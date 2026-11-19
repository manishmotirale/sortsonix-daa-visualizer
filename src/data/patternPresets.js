// ==========================================
// PRESET GENERATOR
// ==========================================
export const PATTERN_PRESETS = {
  shuffle: {
    label: "Random Shuffle",
    fn: (n) => {
      const a = Array.from({ length: n }, (_, i) => i + 1);
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
  },
  nearly: {
    label: "Nearly Sorted (~5% Swaps)",
    fn: (n) => {
      const a = Array.from({ length: n }, (_, i) => i + 1);
      const swaps = Math.max(1, Math.floor(n * 0.05));
      for (let k = 0; k < swaps; k++) {
        const i = Math.floor(Math.random() * n);
        const j = Math.floor(Math.random() * n);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
  },
  reverse: {
    label: "Reversed (Descending)",
    fn: (n) => Array.from({ length: n }, (_, i) => n - i)
  },
  valley: {
    label: "Valley (V-Shape)",
    fn: (n) => {
      const res = [];
      const mid = Math.floor(n / 2);
      for (let i = 0; i < mid; i++) res.push(Math.round(n - i * (n / mid)));
      for (let i = mid; i < n; i++) res.push(Math.round(((i - mid) * (n / (n - mid))) + 1));
      return res;
    }
  },
  mountain: {
    label: "Mountain (A-Shape)",
    fn: (n) => {
      const res = [];
      const mid = Math.floor(n / 2);
      for (let i = 0; i < mid; i++) res.push(Math.round((i * (n / mid)) + 1));
      for (let i = mid; i < n; i++) res.push(Math.round(n - ((i - mid) * (n / (n - mid)))));
      return res;
    }
  },
  wave: {
    label: "Sine Wave Distribution",
    fn: (n) => Array.from({ length: n }, (_, i) => {
      const sin = Math.sin((i / n) * Math.PI * 4);
      return Math.max(1, Math.round(((sin + 1) / 2) * (n - 1) + 1));
    })
  },
  pipeOrgan: {
    label: "Pipe Organ",
    fn: (n) => {
      const a = new Array(n);
      let l = 0, r = n - 1, val = 1;
      while (l <= r) {
        a[l++] = val++;
        if (l <= r) a[r--] = val++;
      }
      return a;
    }
  }
};
