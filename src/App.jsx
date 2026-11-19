import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Play, Pause, RotateCcw, StepForward, Volume2, VolumeX, 
  Columns, LayoutGrid, BarChart3, SplitSquareVertical,
  CheckCircle2, Disc, Edit3, X, RefreshCw,
  Code2, Copy, Check, BookOpen, Info, Zap, ShieldCheck
} from 'lucide-react';

import { synth } from './utils/SoundSynth';
import { recordSortEvents } from './utils/sortingAlgorithms';
import { ALGO_METADATA } from './data/algorithmMetadata';
import { PATTERN_PRESETS } from './data/patternPresets';

// ==========================================
// MAIN SORTSONIX REACT APPLICATION
// ==========================================
export default function App() {
  const [viewMode, setViewMode] = useState('hybrid'); // 'numbers' | 'bars' | 'hybrid'
  const [arraySize, setArraySize] = useState(20);
  const [patternKey, setPatternKey] = useState('shuffle');
  const [speed, setSpeed] = useState(65);
  const [isComparing, setIsComparing] = useState(false);

  // Synthesizer State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.2);

  // Algorithms
  const [algoA, setAlgoA] = useState('bubble');
  const [algoB, setAlgoB] = useState('quick');

  // Master Initial Array
  const [masterArray, setMasterArray] = useState([]);

  // Engine A State
  const [arrayA, setArrayA] = useState([]);
  const [traceA, setTraceA] = useState([]);
  const [stepIdxA, setStepIdxA] = useState(0);
  const [highlightsA, setHighlightsA] = useState({ comparing: [], swapping: [], pivot: [], verified: [] });
  const [metricsA, setMetricsA] = useState({ comparisons: 0, swaps: 0, accesses: 0, time: 0 });
  const [statusA, setStatusA] = useState('idle'); // 'idle' | 'running' | 'paused' | 'completed'

  // Engine B State
  const [arrayB, setArrayB] = useState([]);
  const [traceB, setTraceB] = useState([]);
  const [stepIdxB, setStepIdxB] = useState(0);
  const [highlightsB, setHighlightsB] = useState({ comparing: [], swapping: [], pivot: [], verified: [] });
  const [metricsB, setMetricsB] = useState({ comparisons: 0, swaps: 0, accesses: 0, time: 0 });
  const [statusB, setStatusB] = useState('idle');

  // Custom Input Modal
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customInputStr, setCustomInputStr] = useState("45, 12, 89, 3, 27, 65, 33, 10, 50, 78, 19, 41");
  const [customError, setCustomError] = useState("");

  // Code Reference View
  const [codeAlgo, setCodeAlgo] = useState('bubble');
  const [codeLang, setCodeLang] = useState('javascript');
  const [copied, setCopied] = useState(false);

  // Timer Ref
  const animationTimerRef = useRef(null);
  const startTimestampA = useRef(null);
  const startTimestampB = useRef(null);

  // Reset & Re-build Dataset & Ahead-Of-Time Traces
  const rebuildTraces = useCallback((baseArr, currentAlgoA, currentAlgoB) => {
    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);

    const tA = recordSortEvents(currentAlgoA, baseArr);
    const tB = recordSortEvents(currentAlgoB, baseArr);

    setMasterArray([...baseArr]);
    setArrayA([...baseArr]);
    setArrayB([...baseArr]);
    setTraceA(tA);
    setTraceB(tB);
    setStepIdxA(0);
    setStepIdxB(0);
    setHighlightsA({ comparing: [], swapping: [], pivot: [], verified: [] });
    setHighlightsB({ comparing: [], swapping: [], pivot: [], verified: [] });
    setMetricsA({ comparisons: 0, swaps: 0, accesses: 0, time: 0 });
    setMetricsB({ comparisons: 0, swaps: 0, accesses: 0, time: 0 });
    setStatusA('idle');
    setStatusB('idle');
  }, []);

  const regenerateData = useCallback((size = arraySize, pattern = patternKey) => {
    const raw = PATTERN_PRESETS[pattern].fn(size);
    rebuildTraces(raw, algoA, algoB);
  }, [arraySize, patternKey, algoA, algoB, rebuildTraces]);

  // Initial Load
  useEffect(() => {
    regenerateData(arraySize, patternKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Audio Volume
  useEffect(() => {
    synth.setVolume(volume);
  }, [volume]);

  // Dynamic Speed Calculation
  const { delayMs, batchSize } = useMemo(() => {
    if (speed < 75) {
      const ms = Math.round(250 - (speed / 75) * 242);
      return { delayMs: Math.max(8, ms), batchSize: 1 };
    } else {
      const extra = Math.round(((speed - 75) / 25) * 12);
      return { delayMs: 4, batchSize: 1 + extra };
    }
  }, [speed]);

  // Advance Single Engine Step
  const advanceEngine = (
    trace,
    currentStep,
    setStep,
    setArr,
    setHighlights,
    setMetrics,
    setStatus,
    startTimeRef,
    algoKey
  ) => {
    if (currentStep >= trace.length) {
      setStatus('completed');
      setHighlights({
        comparing: [],
        swapping: [],
        pivot: [],
        verified: Array.from({ length: trace[trace.length - 1]?.array?.length || 0 }, (_, i) => i)
      });
      return false;
    }

    const event = trace[currentStep];
    const maxVal = Math.max(...event.array, event.array.length);
    const family = ALGO_METADATA[algoKey]?.family || 'elementary';

    setArr(event.array);

    if (startTimeRef.current) {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setMetrics({ ...event.metrics, time: elapsed });
    }

    if (event.type === 'compare') {
      setHighlights(prev => ({ ...prev, comparing: event.indices, swapping: [] }));
      if (soundEnabled && event.indices.length > 0) {
        synth.playTone(event.array[event.indices[0]] || 1, maxVal, family, Math.min(30, delayMs));
      }
    } else if (event.type === 'swap' || event.type === 'overwrite') {
      setHighlights(prev => ({ ...prev, swapping: event.indices, comparing: [] }));
      if (soundEnabled && event.indices.length > 0) {
        synth.playTone(event.array[event.indices[0]] || 1, maxVal, family, Math.min(30, delayMs));
      }
    } else if (event.type === 'pivot') {
      setHighlights(prev => ({ ...prev, pivot: event.indices }));
    } else if (event.type === 'verify') {
      setHighlights(prev => ({
        ...prev,
        comparing: [],
        swapping: [],
        verified: [...prev.verified, ...event.indices]
      }));
      if (soundEnabled && event.indices.length > 0) {
        synth.playTone(event.array[event.indices[0]] || 1, maxVal, 'elementary', 20);
      }
    }

    setStep(currentStep + 1);
    return true;
  };

  // Main Deterministic Animation Loop
  const runAnimationTick = useCallback(() => {
    let continueA = false;
    let continueB = false;

    if (statusA === 'running') {
      let cur = stepIdxA;
      for (let b = 0; b < batchSize; b++) {
        if (cur < traceA.length) {
          const res = advanceEngine(
            traceA,
            cur,
            (next) => { cur = next; setStepIdxA(next); },
            setArrayA,
            setHighlightsA,
            setMetricsA,
            setStatusA,
            startTimestampA,
            algoA
          );
          if (res) continueA = true;
          else break;
        } else {
          setStatusA('completed');
          break;
        }
      }
    }

    if (isComparing && statusB === 'running') {
      let cur = stepIdxB;
      for (let b = 0; b < batchSize; b++) {
        if (cur < traceB.length) {
          const res = advanceEngine(
            traceB,
            cur,
            (next) => { cur = next; setStepIdxB(next); },
            setArrayB,
            setHighlightsB,
            setMetricsB,
            setStatusB,
            startTimestampB,
            algoB
          );
          if (res) continueB = true;
          else break;
        } else {
          setStatusB('completed');
          break;
        }
      }
    }

    if (continueA || (isComparing && continueB)) {
      animationTimerRef.current = setTimeout(runAnimationTick, delayMs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusA, statusB, stepIdxA, stepIdxB, traceA, traceB, batchSize, delayMs, isComparing, algoA, algoB, soundEnabled]);

  useEffect(() => {
    if (statusA === 'running' || (isComparing && statusB === 'running')) {
      animationTimerRef.current = setTimeout(runAnimationTick, delayMs);
    }
    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, [statusA, statusB, runAnimationTick, delayMs, isComparing]);

  // Controls
  const handleStart = () => {
    synth.init();
    if (!startTimestampA.current) startTimestampA.current = performance.now();
    setStatusA(stepIdxA >= traceA.length ? 'completed' : 'running');

    if (isComparing) {
      if (!startTimestampB.current) startTimestampB.current = performance.now();
      setStatusB(stepIdxB >= traceB.length ? 'completed' : 'running');
    }
  };

  const handlePause = () => {
    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    if (statusA === 'running') setStatusA('paused');
    if (statusB === 'running') setStatusB('paused');
  };

  const handleStepOnce = () => {
    synth.init();
    if (statusA !== 'completed') {
      if (!startTimestampA.current) startTimestampA.current = performance.now();
      advanceEngine(traceA, stepIdxA, setStepIdxA, setArrayA, setHighlightsA, setMetricsA, setStatusA, startTimestampA, algoA);
    }
    if (isComparing && statusB !== 'completed') {
      if (!startTimestampB.current) startTimestampB.current = performance.now();
      advanceEngine(traceB, stepIdxB, setStepIdxB, setArrayB, setHighlightsB, setMetricsB, setStatusB, startTimestampB, algoB);
    }
  };

  const handleReset = () => {
    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    setArrayA([...masterArray]);
    setArrayB([...masterArray]);
    setStepIdxA(0);
    setStepIdxB(0);
    setHighlightsA({ comparing: [], swapping: [], pivot: [], verified: [] });
    setHighlightsB({ comparing: [], swapping: [], pivot: [], verified: [] });
    setMetricsA({ comparisons: 0, swaps: 0, accesses: 0, time: 0 });
    setMetricsB({ comparisons: 0, swaps: 0, accesses: 0, time: 0 });
    setStatusA('idle');
    setStatusB('idle');
    startTimestampA.current = null;
    startTimestampB.current = null;
  };

  const handleApplyCustomInput = (e) => {
    e.preventDefault();
    try {
      const parsed = customInputStr
        .split(',')
        .map(v => v.trim())
        .filter(v => v !== '')
        .map(v => {
          const num = Number(v);
          if (isNaN(num)) throw new Error(`"${v}" is not a valid number.`);
          return num;
        });

      if (parsed.length < 3) throw new Error("Please enter at least 3 numbers.");
      if (parsed.length > 80) throw new Error("Please limit custom entries to 80 items.");

      setArraySize(parsed.length);
      rebuildTraces(parsed, algoA, algoB);
      setCustomModalOpen(false);
      setCustomError("");
    } catch (err) {
      setCustomError(err.message || "Invalid input array.");
    }
  };

  const copyCode = () => {
    const text = ALGO_METADATA[codeAlgo]?.code[codeLang] || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAnyRunning = statusA === 'running' || (isComparing && statusB === 'running');
  const maxValA = useMemo(() => Math.max(...arrayA, 1), [arrayA]);
  const maxValB = useMemo(() => Math.max(...arrayB, 1), [arrayB]);

  const getItemVisualClass = (idx, highlights, isDone) => {
    if (isDone || highlights.verified.includes(idx)) return 'verified';
    if (highlights.swapping.includes(idx)) return 'swapping';
    if (highlights.comparing.includes(idx)) return 'comparing';
    if (highlights.pivot.includes(idx)) return 'pivot';
    return 'default';
  };

  // Render Visualization Box
  const renderVisualizerBox = (
    arr,
    highlights,
    status,
    algoKey,
    setAlgoKey,
    metrics,
    label,
    maxVal
  ) => {
    const isDone = status === 'completed';
    const meta = ALGO_METADATA[algoKey] || {};

    return (
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col shadow-2xl backdrop-blur-md">
        
        {/* Box Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${label === 'A' ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]'}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Engine {label}
            </span>
            <select
              value={algoKey}
              disabled={isAnyRunning}
              onChange={(e) => {
                const newKey = e.target.value;
                setAlgoKey(newKey);
                if (label === 'A') setCodeAlgo(newKey);
                rebuildTraces(masterArray, label === 'A' ? newKey : algoA, label === 'B' ? newKey : algoB);
              }}
              className="bg-slate-800 text-cyan-300 font-semibold border border-slate-700 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {Object.entries(ALGO_METADATA).map(([k, item]) => (
                <option key={k} value={k}>
                  {item.name} • {item.tag}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 text-[11px] text-slate-300 border border-slate-700 font-mono">
              <Disc className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-slate-400">Sound:</span>
              <span className="text-cyan-300 capitalize">{meta.family}</span>
            </div>

            {status === 'completed' && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-700/80 px-2.5 py-0.5 rounded-full shadow-sm shadow-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Sorted
              </span>
            )}
            {status === 'running' && (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-950/80 border border-amber-700/80 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping mr-1" /> Sorting
              </span>
            )}
          </div>
        </div>

        {/* Display Arena */}
        <div className="relative flex-1 min-h-[340px] bg-slate-950/90 rounded-xl border border-slate-800 p-4 flex flex-col justify-end overflow-hidden">
          
          {/* MODE 1: NUMBER CARDS */}
          {viewMode === 'numbers' && (
            <div className="w-full h-full flex flex-wrap items-center justify-center content-center gap-2 sm:gap-2.5 overflow-y-auto py-2">
              {arr.map((val, idx) => {
                const visual = getItemVisualClass(idx, highlights, isDone);
                const fillRatio = Math.max(6, Math.min(100, (val / maxVal) * 100));

                return (
                  <div
                    key={idx}
                    className={`relative overflow-hidden flex flex-col items-center justify-between font-mono font-bold transition-all duration-100 rounded-xl border shadow-lg ${
                      arr.length > 40 ? 'w-10 h-12 text-xs' : arr.length > 25 ? 'w-12 h-14 text-sm' : 'w-16 h-20 text-base'
                    } ${
                      visual === 'verified'
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-emerald-500/30 ring-1 ring-emerald-400'
                        : visual === 'swapping'
                        ? 'bg-rose-950 text-rose-200 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.7)] scale-110 z-20 ring-2 ring-rose-400'
                        : visual === 'comparing'
                        ? 'bg-amber-950 text-amber-200 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-110 z-20 ring-2 ring-amber-400'
                        : visual === 'pivot'
                        ? 'bg-purple-950 text-purple-200 border-purple-400 shadow-purple-500/40 scale-105 z-10'
                        : 'bg-slate-900 text-slate-100 border-slate-700/80 hover:border-cyan-500/60'
                    }`}
                  >
                    <div 
                      className={`absolute bottom-0 left-0 right-0 pointer-events-none transition-all duration-100 opacity-20 ${
                        visual === 'verified' ? 'bg-emerald-400' :
                        visual === 'swapping' ? 'bg-rose-500' :
                        visual === 'comparing' ? 'bg-amber-400' :
                        visual === 'pivot' ? 'bg-purple-400' : 'bg-cyan-500'
                      }`}
                      style={{ height: `${fillRatio}%` }}
                    />
                    <span className="text-[9px] font-mono text-slate-400 pt-1 z-10">
                      #{idx}
                    </span>
                    <span className="text-base sm:text-lg tracking-tight font-extrabold z-10">
                      {val}
                    </span>
                    <div className="w-full px-1.5 pb-1 z-10">
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-100 ${
                            visual === 'verified' ? 'bg-emerald-400' :
                            visual === 'swapping' ? 'bg-rose-400' :
                            visual === 'comparing' ? 'bg-amber-400' : 'bg-cyan-400'
                          }`}
                          style={{ width: `${fillRatio}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 2: BARS */}
          {viewMode === 'bars' && (
            <div className="h-full w-full flex items-end justify-center gap-[1px] sm:gap-[2px]">
              {arr.map((val, idx) => {
                const heightPercent = Math.max(4, (val / maxVal) * 100);
                const visual = getItemVisualClass(idx, highlights, isDone);
                return (
                  <div
                    key={idx}
                    style={{ height: `${heightPercent}%` }}
                    className={`flex-1 rounded-t-sm transition-all duration-75 relative group ${
                      visual === 'verified'
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                        : visual === 'swapping'
                        ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.9)] z-20 scale-y-105'
                        : visual === 'comparing'
                        ? 'bg-gradient-to-t from-amber-500 to-yellow-300 shadow-[0_0_12px_rgba(251,191,36,0.85)] z-20 scale-y-105'
                        : visual === 'pivot'
                        ? 'bg-gradient-to-t from-purple-600 to-fuchsia-400 shadow-[0_0_10px_rgba(192,132,252,0.8)] z-10'
                        : 'bg-gradient-to-t from-cyan-900 to-cyan-400 hover:brightness-125'
                    }`}
                  >
                    {arr.length <= 40 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {val}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 3: HYBRID MODE */}
          {viewMode === 'hybrid' && (
            <div className="h-full w-full flex items-end justify-center gap-1 sm:gap-1.5 pt-8">
              {arr.map((val, idx) => {
                const heightPercent = Math.max(14, (val / maxVal) * 86);
                const visual = getItemVisualClass(idx, highlights, isDone);
                return (
                  <div
                    key={idx}
                    style={{ height: `${heightPercent}%` }}
                    className="flex-1 flex flex-col items-center justify-between group relative"
                  >
                    <span className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold transition-transform shadow-md ${
                      visual === 'verified'
                        ? 'bg-emerald-500 text-slate-950 font-extrabold'
                        : visual === 'swapping'
                        ? 'bg-rose-500 text-white scale-125 z-20'
                        : visual === 'comparing'
                        ? 'bg-amber-400 text-slate-950 scale-125 z-20 font-extrabold'
                        : visual === 'pivot'
                        ? 'bg-purple-400 text-slate-950'
                        : 'bg-slate-800 text-cyan-300 border border-slate-700'
                    }`}>
                      {val}
                    </span>

                    <div className={`w-full flex-1 rounded-t-sm mt-1 transition-all duration-75 ${
                      visual === 'verified'
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                        : visual === 'swapping'
                        ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)]'
                        : visual === 'comparing'
                        ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                        : visual === 'pivot'
                        ? 'bg-purple-500'
                        : 'bg-cyan-600/70 group-hover:bg-cyan-500'
                    }`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Metrics Chips */}
        <div className="grid grid-cols-4 gap-2.5 pt-3 mt-3 border-t border-slate-800 text-center">
          <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Comparisons</span>
            <span className="font-mono text-sm sm:text-base font-bold text-amber-300">
              {metrics.comparisons.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Swaps / Writes</span>
            <span className="font-mono text-sm sm:text-base font-bold text-rose-300">
              {metrics.swaps.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Array Accesses</span>
            <span className="font-mono text-sm sm:text-base font-bold text-sky-300">
              {metrics.accesses.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Elapsed Time</span>
            <span className="font-mono text-sm sm:text-base font-bold text-emerald-300">
              {metrics.time} ms
            </span>
          </div>
        </div>
      </div>
    );
  };

  const currentMeta = ALGO_METADATA[codeAlgo] || ALGO_METADATA.bubble;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-200 bg-clip-text text-transparent">
                  SortSonix
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  Deterministic DAA Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Synchronized sound synthesis & Ahead-of-Time algorithm execution
              </p>
            </div>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl p-1">
              <button
                onClick={() => setViewMode('numbers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'numbers' 
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Numbers</span>
              </button>

              <button
                onClick={() => setViewMode('bars')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'bars' 
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Bars</span>
              </button>

              <button
                onClick={() => setViewMode('hybrid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'hybrid' 
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>Hybrid</span>
              </button>
            </div>

            {/* Custom Input Button */}
            <button
              onClick={() => setCustomModalOpen(true)}
              disabled={isAnyRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Custom Input</span>
            </button>

            {/* Dual Comparison Switch */}
            <button
              onClick={() => {
                setIsComparing(!isComparing);
                handleReset();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                isComparing
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500 shadow-sm shadow-indigo-500/25'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{isComparing ? 'Dual Mode Active' : 'Dual Compare'}</span>
            </button>

            {/* Volume Synthesizer Slider */}
            <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 rounded-xl p-1">
              <button
                onClick={() => {
                  const muted = synth.toggleMute();
                  setSoundEnabled(!muted);
                }}
                className={`p-1.5 rounded-lg transition ${
                  soundEnabled ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0.02"
                max="0.4"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-14 accent-cyan-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ================= SECONDARY DASHBOARD CONTROL STRIP ================= */}
      <section className="bg-slate-900/60 border-b border-slate-800 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          <div className="md:col-span-4 flex items-center gap-2">
            {!isAnyRunning ? (
              <button
                onClick={handleStart}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 transition active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Run Algorithm</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-950/40 transition active:scale-95"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleStepOnce}
              disabled={isAnyRunning}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl border border-slate-700 transition"
              title="Single Step Forward"
            >
              <StepForward className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
              title="Reset Elements"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => regenerateData(arraySize, patternKey)}
              disabled={isAnyRunning}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-cyan-950/80 hover:bg-cyan-900 disabled:opacity-40 text-cyan-300 border border-cyan-800 rounded-xl transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>
          </div>

          {/* Pattern & Size Selection */}
          <div className="md:col-span-5 flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="w-full sm:w-1/2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Input Pattern
              </label>
              <select
                value={patternKey}
                disabled={isAnyRunning}
                onChange={(e) => {
                  setPatternKey(e.target.value);
                  regenerateData(arraySize, e.target.value);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {Object.entries(PATTERN_PRESETS).map(([k, meta]) => (
                  <option key={k} value={k}>{meta.label}</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-1/2">
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                <span>Array Size</span>
                <span className="text-cyan-300 font-mono font-bold">{arraySize} items</span>
              </div>
              <input
                type="range"
                min="6"
                max={viewMode === 'numbers' ? "48" : "160"}
                step="2"
                disabled={isAnyRunning}
                value={arraySize}
                onChange={(e) => {
                  const s = parseInt(e.target.value);
                  setArraySize(s);
                  regenerateData(s, patternKey);
                }}
                className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Speed Selection */}
          <div className="md:col-span-3 flex items-center gap-3">
            <div className="w-full">
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                <span>Speed</span>
                <span className="text-cyan-300 font-mono font-bold">{speed}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CANVASES ================= */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        <div className={`grid gap-6 ${isComparing ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {renderVisualizerBox(
            arrayA,
            highlightsA,
            statusA,
            algoA,
            setAlgoA,
            metricsA,
            'A',
            maxValA
          )}

          {isComparing && renderVisualizerBox(
            arrayB,
            highlightsB,
            statusB,
            algoB,
            setAlgoB,
            metricsB,
            'B',
            maxValB
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-5 py-3 px-6 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-800 border border-slate-700" />
            <span className="text-slate-400">Idle Rest</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <span className="text-slate-300 font-medium">Comparing (Audible)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <span className="text-slate-300 font-medium">Swap / Memory Write</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-purple-500 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
            <span className="text-slate-300 font-medium">Pivot / Marker</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-slate-300 font-medium">Verified Sorted Position</span>
          </div>
        </div>

        {/* ================= ALGORITHM CODE & THEORETICAL VAULT ================= */}
        <section className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl p-5 sm:p-7 backdrop-blur-md">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Algorithm Reference & Code Vault</span>
                  <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800">
                    {currentMeta.name}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Inspect the underlying source code, algorithmic execution steps, and full complexity metrics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Inspect:</span>
              <select
                value={codeAlgo}
                onChange={(e) => setCodeAlgo(e.target.value)}
                className="bg-slate-800 text-cyan-300 font-semibold border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {Object.entries(ALGO_METADATA).map(([k, item]) => (
                  <option key={k} value={k}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Complexity Scorecard Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 my-5">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Best Time</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{currentMeta.best}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Average Time</span>
              <span className="text-sm font-mono font-bold text-amber-400">{currentMeta.avg}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Worst Time</span>
              <span className="text-sm font-mono font-bold text-rose-400">{currentMeta.worst}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Aux Space</span>
              <span className="text-sm font-mono font-bold text-indigo-400">{currentMeta.space}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Stability</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{currentMeta.stable}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">In-Place</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{currentMeta.inPlace}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Method</span>
              <span className="text-xs font-mono font-bold text-cyan-300">{currentMeta.method}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Algorithmic Concept</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentMeta.desc}
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Step-by-Step Procedure</span>
                </h3>
                <ol className="space-y-2">
                  {currentMeta.steps.map((st, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-slate-800 text-cyan-400 font-mono text-[10px] flex items-center justify-center border border-slate-700">
                        {i + 1}
                      </span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCodeLang('javascript')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                      codeLang === 'javascript' 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    JavaScript
                  </button>
                  <button
                    onClick={() => setCodeLang('python')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                      codeLang === 'python' 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Python
                  </button>
                  <button
                    onClick={() => setCodeLang('cpp')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                      codeLang === 'cpp' 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    C++
                  </button>
                </div>

                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 overflow-x-auto max-h-[380px] bg-slate-950 font-mono text-xs leading-relaxed text-slate-200">
                <pre>
                  <code>{currentMeta.code[codeLang]}</code>
                </pre>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* ================= CUSTOM INPUT MODAL ================= */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setCustomModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Edit3 className="w-5 h-5 text-cyan-400" />
              <span>Define Custom Number Sequence</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your own numbers separated by commas. Each card will dynamically adapt and render cleanly.
            </p>

            <form onSubmit={handleApplyCustomInput} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Comma-Separated Values (3 to 80 elements)
                </label>
                <textarea
                  rows={4}
                  value={customInputStr}
                  onChange={(e) => setCustomInputStr(e.target.value)}
                  placeholder="e.g., 45, 12, 89, 3, 27, 65, 33, 10, 50"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
                />
              </div>

              {customError && (
                <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                  {customError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 rounded-xl shadow-lg shadow-cyan-950/40 transition"
                >
                  Apply & Visualize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-800 bg-slate-900/40 px-4 py-3 text-center text-xs text-slate-500">
        SortSonix • Design and Analysis of Algorithms (DAA) Interactive Mini Project
      </footer>
    </div>
  );
}
