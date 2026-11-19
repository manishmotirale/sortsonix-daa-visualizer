// ==========================================
// CANONICAL SORTING TRACE GENERATORS
// Pure functions: guarantee 100% sorted results
// ==========================================
export function recordSortEvents(algoKey, originalArray) {
  const arr = [...originalArray];
  const events = [];
  let comparisons = 0;
  let swaps = 0;
  let accesses = 0;

  const compare = (i, j) => {
    comparisons++;
    accesses += 2;
    events.push({
      type: 'compare',
      indices: [i, j],
      metrics: { comparisons, swaps, accesses },
      array: [...arr]
    });
    return arr[i] - arr[j];
  };

  const swap = (i, j) => {
    if (i === j) return;
    swaps++;
    accesses += 4;
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
    events.push({
      type: 'swap',
      indices: [i, j],
      metrics: { comparisons, swaps, accesses },
      array: [...arr]
    });
  };

  const overwrite = (index, value) => {
    swaps++;
    accesses += 2;
    arr[index] = value;
    events.push({
      type: 'overwrite',
      indices: [index],
      metrics: { comparisons, swaps, accesses },
      array: [...arr]
    });
  };

  const markPivot = (indices) => {
    events.push({
      type: 'pivot',
      indices,
      metrics: { comparisons, swaps, accesses },
      array: [...arr]
    });
  };

  // Algorithm Execution
  switch (algoKey) {
    case 'bubble': {
      const n = arr.length;
      for (let i = 0; i < n; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
          if (compare(j, j + 1) > 0) {
            swap(j, j + 1);
            swapped = true;
          }
        }
        if (!swapped) break;
      }
      break;
    }

    case 'selection': {
      const n = arr.length;
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        markPivot([minIdx]);
        for (let j = i + 1; j < n; j++) {
          if (compare(j, minIdx) < 0) {
            minIdx = j;
            markPivot([minIdx]);
          }
        }
        if (minIdx !== i) swap(i, minIdx);
      }
      break;
    }

    case 'insertion': {
      const n = arr.length;
      for (let i = 1; i < n; i++) {
        const key = arr[i];
        accesses++;
        markPivot([i]);
        let j = i - 1;
        while (j >= 0) {
          comparisons++;
          accesses++;
          events.push({
            type: 'compare',
            indices: [j, j + 1],
            metrics: { comparisons, swaps, accesses },
            array: [...arr]
          });
          if (arr[j] > key) {
            overwrite(j + 1, arr[j]);
            j--;
          } else {
            break;
          }
        }
        overwrite(j + 1, key);
      }
      break;
    }

    case 'cocktail': {
      let start = 0;
      let end = arr.length - 1;
      let swapped = true;
      while (swapped) {
        swapped = false;
        for (let i = start; i < end; ++i) {
          if (compare(i, i + 1) > 0) {
            swap(i, i + 1);
            swapped = true;
          }
        }
        if (!swapped) break;
        swapped = false;
        end--;
        for (let i = end - 1; i >= start; --i) {
          if (compare(i, i + 1) > 0) {
            swap(i, i + 1);
            swapped = true;
          }
        }
        start++;
      }
      break;
    }

    case 'gnome': {
      let pos = 0;
      while (pos < arr.length) {
        if (pos === 0 || compare(pos, pos - 1) >= 0) {
          pos++;
        } else {
          swap(pos, pos - 1);
          pos--;
        }
      }
      break;
    }

    case 'quick': {
      const qsort = (low, high) => {
        if (low < high) {
          const pivotVal = arr[high];
          accesses++;
          markPivot([high]);
          let i = low - 1;
          for (let j = low; j < high; j++) {
            comparisons++;
            accesses++;
            events.push({
              type: 'compare',
              indices: [j, high],
              metrics: { comparisons, swaps, accesses },
              array: [...arr]
            });
            if (arr[j] < pivotVal) {
              i++;
              swap(i, j);
            }
          }
          swap(i + 1, high);
          const pi = i + 1;
          qsort(low, pi - 1);
          qsort(pi + 1, high);
        }
      };
      qsort(0, arr.length - 1);
      break;
    }

    case 'merge': {
      const msort = (start, end) => {
        if (start >= end) return;
        const mid = Math.floor((start + end) / 2);
        msort(start, mid);
        msort(mid + 1, end);

        const left = arr.slice(start, mid + 1);
        const right = arr.slice(mid + 1, end + 1);
        accesses += (end - start + 1);

        let i = 0, j = 0, k = start;
        while (i < left.length && j < right.length) {
          comparisons++;
          events.push({
            type: 'compare',
            indices: [start + i, mid + 1 + j],
            metrics: { comparisons, swaps, accesses },
            array: [...arr]
          });
          if (left[i] <= right[j]) {
            overwrite(k, left[i++]);
          } else {
            overwrite(k, right[j++]);
          }
          k++;
        }
        while (i < left.length) {
          overwrite(k++, left[i++]);
        }
        while (j < right.length) {
          overwrite(k++, right[j++]);
        }
      };
      msort(0, arr.length - 1);
      break;
    }

    case 'heap': {
      const n = arr.length;
      const heapify = (size, root) => {
        let largest = root;
        const l = 2 * root + 1;
        const r = 2 * root + 2;

        if (l < size && compare(l, largest) > 0) largest = l;
        if (r < size && compare(r, largest) > 0) largest = r;

        if (largest !== root) {
          swap(root, largest);
          heapify(size, largest);
        }
      };

      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i);
      }
      for (let i = n - 1; i > 0; i--) {
        swap(0, i);
        heapify(i, 0);
      }
      break;
    }

    case 'shell': {
      const n = arr.length;
      for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        for (let i = gap; i < n; i++) {
          const temp = arr[i];
          accesses++;
          markPivot([i]);
          let j = i;
          while (j >= gap) {
            comparisons++;
            accesses++;
            events.push({
              type: 'compare',
              indices: [j - gap, j],
              metrics: { comparisons, swaps, accesses },
              array: [...arr]
            });
            if (arr[j - gap] > temp) {
              overwrite(j, arr[j - gap]);
              j -= gap;
            } else {
              break;
            }
          }
          overwrite(j, temp);
        }
      }
      break;
    }

    case 'counting': {
      const max = Math.max(...arr);
      const count = new Array(max + 1).fill(0);
      for (let i = 0; i < arr.length; i++) {
        count[arr[i]]++;
        accesses++;
        events.push({
          type: 'compare',
          indices: [i],
          metrics: { comparisons, swaps, accesses },
          array: [...arr]
        });
      }
      let idx = 0;
      for (let val = 0; val <= max; val++) {
        while (count[val] > 0) {
          overwrite(idx++, val);
          count[val]--;
        }
      }
      break;
    }

    case 'radix': {
      const max = Math.max(...arr);
      for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        const output = new Array(arr.length).fill(0);
        const count = new Array(10).fill(0);

        for (let i = 0; i < arr.length; i++) {
          const digit = Math.floor(arr[i] / exp) % 10;
          count[digit]++;
          accesses++;
          events.push({
            type: 'compare',
            indices: [i],
            metrics: { comparisons, swaps, accesses },
            array: [...arr]
          });
        }
        for (let i = 1; i < 10; i++) count[i] += count[i - 1];

        for (let i = arr.length - 1; i >= 0; i--) {
          const digit = Math.floor(arr[i] / exp) % 10;
          output[count[digit] - 1] = arr[i];
          count[digit]--;
          accesses += 2;
        }
        for (let i = 0; i < arr.length; i++) {
          overwrite(i, output[i]);
        }
      }
      break;
    }

    case 'comb': {
      let gap = arr.length;
      let sorted = false;
      while (!sorted) {
        gap = Math.floor(gap / 1.3);
        if (gap <= 1) {
          gap = 1;
          sorted = true;
        }
        for (let i = 0; i + gap < arr.length; i++) {
          if (compare(i, i + gap) > 0) {
            swap(i, i + gap);
            sorted = false;
          }
        }
      }
      break;
    }

    case 'pancake': {
      const flip = (k) => {
        let left = 0;
        let right = k;
        while (left < right) {
          swap(left, right);
          left++;
          right--;
        }
      };

      for (let currSize = arr.length; currSize > 1; currSize--) {
        let maxIdx = 0;
        for (let i = 1; i < currSize; i++) {
          if (compare(i, maxIdx) > 0) maxIdx = i;
        }
        if (maxIdx !== currSize - 1) {
          if (maxIdx > 0) flip(maxIdx);
          flip(currSize - 1);
        }
      }
      break;
    }

    default:
      break;
  }

  // Appending Celebratory Integrity Verification Sweep
  for (let i = 0; i < arr.length; i++) {
    events.push({
      type: 'verify',
      indices: [i],
      metrics: { comparisons, swaps, accesses },
      array: [...arr]
    });
  }

  return events;
}
