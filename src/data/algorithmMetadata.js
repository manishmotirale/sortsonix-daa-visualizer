// ==========================================
// ALGORITHM VAULT & CODE REFERENCE
// ==========================================
export const ALGO_METADATA = {
  bubble: {
    name: "Bubble Sort",
    family: "elementary",
    tag: "Elementary",
    method: "Adjacent Exchange",
    best: "O(n)",
    avg: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "Yes",
    inPlace: "Yes",
    desc: "Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. Terminates early if a pass completes with zero swaps.",
    steps: [
      "Compare adjacent elements arr[j] and arr[j + 1].",
      "If arr[j] > arr[j + 1], swap them.",
      "Repeat for n - 1 passes, bubbling the largest remaining element to the end."
    ],
    code: {
      javascript: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return arr;
}`,
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
      cpp: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`
    }
  },

  selection: {
    name: "Selection Sort",
    family: "elementary",
    tag: "Elementary",
    method: "Selection",
    best: "O(n²)",
    avg: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "No",
    inPlace: "Yes",
    desc: "Divides the array into sorted and unsorted regions. Repeatedly searches the unsorted region for the minimum element and swaps it into the next sorted position.",
    steps: [
      "Find the minimum element in unsorted subarray [i ... n-1].",
      "Swap it with the element at position i.",
      "Advance the sorted boundary i by 1."
    ],
    code: {
      javascript: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`,
      python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
      cpp: `void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        swap(arr[i], arr[minIdx]);
    }
}`
    }
  },

  insertion: {
    name: "Insertion Sort",
    family: "elementary",
    tag: "Elementary",
    method: "Insertion",
    best: "O(n)",
    avg: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "Yes",
    inPlace: "Yes",
    desc: "Builds the sorted array one element at a time by picking items and shifting larger elements in the sorted partition to make room.",
    steps: [
      "Pick key = arr[i] starting from index 1.",
      "Compare key with elements to its left, shifting them right if they are larger than key.",
      "Insert key into the correct open position."
    ],
    code: {
      javascript: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
      python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
      cpp: `void insertionSort(vector<int>& arr) {
    for (size_t i = 1; i < arr.size(); i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`
    }
  },

  cocktail: {
    name: "Cocktail Shaker Sort",
    family: "elementary",
    tag: "Elementary",
    method: "Bi-directional Exchange",
    best: "O(n)",
    avg: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "Yes",
    inPlace: "Yes",
    desc: "A variation of Bubble Sort that traverses the array in alternating directions, mitigating the turtle problem where small values at the tail take a long time to shift.",
    steps: [
      "Pass left to right, bubbling the largest value to the end boundary.",
      "Pass right to left, bubbling the smallest value to the start boundary.",
      "Shrink both boundaries until they cross."
    ],
    code: {
      javascript: `function cocktailSort(arr) {
  let start = 0, end = arr.length - 1, swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = start; i < end; i++) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
    if (!swapped) break;
    swapped = false;
    end--;
    for (let i = end - 1; i >= start; i--) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
    start++;
  }
  return arr;
}`,
      python: `def cocktail_sort(arr):
    start, end = 0, len(arr) - 1
    swapped = True
    while swapped:
        swapped = False
        for i in range(start, end):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swapped = True
        if not swapped: break
        swapped = False
        end -= 1
        for i in range(end - 1, start - 1, -1):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swapped = True
        start += 1
    return arr`,
      cpp: `void cocktailSort(vector<int>& arr) {
    int start = 0, end = arr.size() - 1;
    bool swapped = true;
    while (swapped) {
        swapped = false;
        for (int i = start; i < end; i++) {
            if (arr[i] > arr[i + 1]) {
                swap(arr[i], arr[i + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
        swapped = false;
        end--;
        for (int i = end - 1; i >= start; i--) {
            if (arr[i] > arr[i + 1]) {
                swap(arr[i], arr[i + 1]);
                swapped = true;
            }
        }
        start++;
    }
}`
    }
  },

  gnome: {
    name: "Gnome Sort",
    family: "elementary",
    tag: "Elementary",
    method: "Exchange",
    best: "O(n)",
    avg: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "Yes",
    inPlace: "Yes",
    desc: "Moves an element to its proper place by a series of swaps, similar to insertion sort, but conceptually visualized as a garden gnome sorting flower pots.",
    steps: [
      "If pos is 0 or arr[pos] >= arr[pos - 1], advance pos by 1.",
      "Else, swap arr[pos] and arr[pos - 1] and step back pos by 1."
    ],
    code: {
      javascript: `function gnomeSort(arr) {
  let pos = 0;
  while (pos < arr.length) {
    if (pos === 0 || arr[pos] >= arr[pos - 1]) pos++;
    else {
      [arr[pos], arr[pos - 1]] = [arr[pos - 1], arr[pos]];
      pos--;
    }
  }
  return arr;
}`,
      python: `def gnome_sort(arr):
    pos = 0
    while pos < len(arr):
        if pos == 0 or arr[pos] >= arr[pos - 1]:
            pos += 1
        else:
            arr[pos], arr[pos - 1] = arr[pos - 1], arr[pos]
            pos -= 1
    return arr`,
      cpp: `void gnomeSort(vector<int>& arr) {
    int pos = 0;
    while (pos < arr.size()) {
        if (pos == 0 || arr[pos] >= arr[pos - 1]) pos++;
        else {
            swap(arr[pos], arr[pos - 1]);
            pos--;
        }
    }
}`
    }
  },

  quick: {
    name: "Quick Sort (Lomuto Partition)",
    family: "divide",
    tag: "Divide & Conquer",
    method: "Partitioning",
    best: "O(n log n)",
    avg: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
    stable: "No",
    inPlace: "Yes",
    desc: "Selects the last element as pivot and reorders the array so elements smaller than the pivot appear before it, and larger elements appear after it. Then recursively sorts the partitions.",
    steps: [
      "Pick arr[high] as pivot.",
      "Scan from low to high - 1. If arr[j] < pivot, increment i and swap arr[i] with arr[j].",
      "Swap pivot into position i + 1. Recursively sort subarrays."
    ],
    code: {
      javascript: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    const pi = i + 1;
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}`,
      python: `def quick_sort(arr, low=0, high=None):
    if high is None: high = len(arr) - 1
    if low < high:
        pivot = arr[high]
        i = low - 1
        for j in range(low, high):
            if arr[j] < pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        pi = i + 1
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    return arr`,
      cpp: `void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                swap(arr[i], arr[j]);
            }
        }
        swap(arr[i + 1], arr[high]);
        int pi = i + 1;
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`
    }
  },

  merge: {
    name: "Merge Sort",
    family: "divide",
    tag: "Divide & Conquer",
    method: "Merging",
    best: "O(n log n)",
    avg: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
    stable: "Yes",
    inPlace: "No",
    desc: "Divides the array into two halves, recursively sorts them, and merges the two sorted halves using an auxiliary buffer.",
    steps: [
      "Divide the array at mid = floor((l + r) / 2).",
      "Recursively sort the left and right halves.",
      "Merge both sorted halves into sorted order."
    ],
    code: {
      javascript: `function mergeSort(arr, start = 0, end = arr.length - 1) {
  if (start >= end) return arr;
  const mid = Math.floor((start + end) / 2);
  mergeSort(arr, start, mid);
  mergeSort(arr, mid + 1, end);
  
  const left = arr.slice(start, mid + 1);
  const right = arr.slice(mid + 1, end + 1);
  let i = 0, j = 0, k = start;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) arr[k++] = left[i++];
    else arr[k++] = right[j++];
  }
  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];
  return arr;
}`,
      python: `def merge_sort(arr):
    if len(arr) > 1:
        mid = len(arr) // 2
        L, R = arr[:mid], arr[mid:]
        merge_sort(L)
        merge_sort(R)
        i = j = k = 0
        while i < len(L) and j < len(R):
            if L[i] <= R[j]:
                arr[k] = L[i]; i += 1
            else:
                arr[k] = R[j]; j += 1
            k += 1
        while i < len(L): arr[k] = L[i]; i += 1; k += 1
        while j < len(R): arr[k] = R[j]; j += 1; k += 1
    return arr`,
      cpp: `void merge(vector<int>& arr, int l, int m, int r) {
    vector<int> L(arr.begin() + l, arr.begin() + m + 1);
    vector<int> R(arr.begin() + m + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;
    while (i < L.size() && j < R.size())
        arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while (i < L.size()) arr[k++] = L[i++];
    while (j < R.size()) arr[k++] = R[j++];
}
void mergeSort(vector<int>& arr, int l, int r) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    merge(arr, l, m, r);
}`
    }
  },

  heap: {
    name: "Heap Sort",
    family: "divide",
    tag: "Divide & Conquer",
    method: "Tree Selection",
    best: "O(n log n)",
    avg: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1)",
    stable: "No",
    inPlace: "Yes",
    desc: "Transforms the array into a max heap, repeatedly removes the maximum element (root) and swaps it with the last unsorted item, then re-heapifies.",
    steps: [
      "Build a max-heap in-place from the input array.",
      "Swap root arr[0] with the boundary element arr[i].",
      "Heapify root index 0 for the remaining heap size."
    ],
    code: {
      javascript: `function heapSort(arr) {
  const n = arr.length;
  function heapify(size, i) {
    let largest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < size && arr[l] > arr[largest]) largest = l;
    if (r < size && arr[r] > arr[largest]) largest = r;
    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      heapify(size, largest);
    }
  }
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(i, 0);
  }
  return arr;
}`,
      python: `def heapify(arr, n, i):
    largest = i; l = 2 * i + 1; r = 2 * i + 2
    if l < n and arr[l] > arr[largest]: largest = l
    if r < n and arr[r] > arr[largest]: largest = r
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1): heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    return arr`,
      cpp: `void heapify(vector<int>& arr, int n, int i) {
    int largest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}
void heapSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}`
    }
  },

  shell: {
    name: "Shell Sort",
    family: "divide",
    tag: "Divide & Conquer",
    method: "Gapped Insertion",
    best: "O(n log n)",
    avg: "O(n^1.3)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "No",
    inPlace: "Yes",
    desc: "An optimization over insertion sort that allows exchanges of elements far apart using diminishing gap sizes.",
    steps: [
      "Initialize gap = floor(n / 2).",
      "Perform gapped insertion sort for all elements with the current gap interval.",
      "Halve gap until it reaches 1, concluding with standard insertion sort."
    ],
    code: {
      javascript: `function shellSort(arr) {
  const n = arr.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
    }
  }
  return arr;
}`,
      python: `def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2
    return arr`,
      cpp: `void shellSort(vector<int>& arr) {
    int n = arr.size();
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i], j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
}`
    }
  },

  counting: {
    name: "Counting Sort",
    family: "noncomp",
    tag: "Non-Comparison",
    method: "Histogram Frequency",
    best: "O(n + k)",
    avg: "O(n + k)",
    worst: "O(n + k)",
    space: "O(k)",
    stable: "Yes",
    inPlace: "No",
    desc: "Counts occurrences of each key value in an auxiliary histogram and reconstructs the sorted output without pairwise element comparisons.",
    steps: [
      "Find maximum value k.",
      "Count occurrences of each value in count[k + 1].",
      "Directly write values back into the array in sorted order."
    ],
    code: {
      javascript: `function countingSort(arr) {
  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);
  for (let x of arr) count[x]++;
  let idx = 0;
  for (let i = 0; i <= max; i++) {
    while (count[i] > 0) {
      arr[idx++] = i;
      count[i]--;
    }
  }
  return arr;
}`,
      python: `def counting_sort(arr):
    max_val = max(arr)
    count = [0] * (max_val + 1)
    for x in arr: count[x] += 1
    idx = 0
    for i in range(max_val + 1):
        while count[i] > 0:
            arr[idx] = i; idx += 1
            count[i] -= 1
    return arr`,
      cpp: `void countingSort(vector<int>& arr) {
    int maxVal = *max_element(arr.begin(), arr.end());
    vector<int> count(maxVal + 1, 0);
    for (int x : arr) count[x]++;
    int idx = 0;
    for (int i = 0; i <= maxVal; i++) {
        while (count[i]-- > 0) arr[idx++] = i;
    }
}`
    }
  },

  radix: {
    name: "Radix Sort (LSD)",
    family: "noncomp",
    tag: "Non-Comparison",
    method: "Digit Bucket Sort",
    best: "O(d · (n + k))",
    avg: "O(d · (n + k))",
    worst: "O(d · (n + k))",
    space: "O(n + k)",
    stable: "Yes",
    inPlace: "No",
    desc: "Processes integer elements digit by digit, from least significant digit (LSD) to most significant digit using stable counting sort passes.",
    steps: [
      "Find maximum value to identify the number of digits d.",
      "Perform stable counting sort for each digit exp = 1, 10, 100...",
      "Array is fully sorted after the final pass on the most significant digit."
    ],
    code: {
      javascript: `function radixSort(arr) {
  const max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const output = new Array(arr.length).fill(0);
    const count = new Array(10).fill(0);
    for (let x of arr) count[Math.floor(x / exp) % 10]++;
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = arr.length - 1; i >= 0; i--) {
      const d = Math.floor(arr[i] / exp) % 10;
      output[count[d] - 1] = arr[i];
      count[d]--;
    }
    for (let i = 0; i < arr.length; i++) arr[i] = output[i];
  }
  return arr;
}`,
      python: `def radix_sort(arr):
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        output = [0] * len(arr)
        count = [0] * 10
        for x in arr: count[(x // exp) % 10] += 1
        for i in range(1, 10): count[i] += count[i - 1]
        for i in range(len(arr) - 1, -1, -1):
            d = (arr[i] // exp) % 10
            output[count[d] - 1] = arr[i]
            count[d] -= 1
        for i in range(len(arr)): arr[i] = output[i]
        exp *= 10
    return arr`,
      cpp: `void radixSort(vector<int>& arr) {
    int maxVal = *max_element(arr.begin(), arr.end());
    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
        vector<int> output(arr.size());
        int count[10] = {0};
        for (int x : arr) count[(x / exp) % 10]++;
        for (int i = 1; i < 10; i++) count[i] += count[i - 1];
        for (int i = arr.size() - 1; i >= 0; i--) {
            int d = (arr[i] / exp) % 10;
            output[count[d] - 1] = arr[i];
            count[d]--;
        }
        for (size_t i = 0; i < arr.size(); i++) arr[i] = output[i];
    }
}`
    }
  },

  comb: {
    name: "Comb Sort",
    family: "exotic",
    tag: "Exotic",
    method: "Shrink Factor Exchange",
    best: "O(n log n)",
    avg: "O(n² / 2^p)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "No",
    inPlace: "Yes",
    desc: "Improves Bubble Sort by using a shrink factor of 1.3 to remove turtles (small values near the end of the list) quickly.",
    steps: [
      "Initialize gap = length.",
      "Shrink gap by factor of 1.3 on each pass.",
      "Compare and swap elements across gap until gap becomes 1."
    ],
    code: {
      javascript: `function combSort(arr) {
  let gap = arr.length, sorted = false;
  while (!sorted) {
    gap = Math.floor(gap / 1.3);
    if (gap <= 1) { gap = 1; sorted = true; }
    for (let i = 0; i + gap < arr.length; i++) {
      if (arr[i] > arr[i + gap]) {
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
        sorted = false;
      }
    }
  }
  return arr;
}`,
      python: `def comb_sort(arr):
    gap = len(arr)
    sorted = False
    while not sorted:
        gap = max(1, int(gap / 1.3))
        if gap == 1: sorted = True
        for i in range(len(arr) - gap):
            if arr[i] > arr[i + gap]:
                arr[i], arr[i + gap] = arr[i + gap], arr[i]
                sorted = False
    return arr`,
      cpp: `void combSort(vector<int>& arr) {
    int gap = arr.size();
    bool sorted = false;
    while (!sorted) {
        gap = max(1, (int)(gap / 1.3));
        if (gap == 1) sorted = true;
        for (size_t i = 0; i + gap < arr.size(); i++) {
            if (arr[i] > arr[i + gap]) {
                swap(arr[i], arr[i + gap]);
                sorted = false;
            }
        }
    }
}`
    }
  },

  pancake: {
    name: "Pancake Sort",
    family: "exotic",
    tag: "Exotic",
    method: "Prefix Reversal",
    best: "O(n)",
    avg: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: "No",
    inPlace: "Yes",
    desc: "Sorts the array using only prefix reversals (spatula flips), bringing maximum elements to the front and then flipping them to their target positions.",
    steps: [
      "Find index of maximum element in current unsorted prefix.",
      "Flip prefix [0 ... maxIdx] to bring maximum to front (index 0).",
      "Flip prefix [0 ... currSize - 1] to place maximum in its final destination."
    ],
    code: {
      javascript: `function pancakeSort(arr) {
  function flip(k) {
    let l = 0, r = k;
    while (l < r) [arr[l], arr[r]] = [arr[r], arr[l]], l++, r--;
  }
  for (let s = arr.length; s > 1; s--) {
    let maxIdx = 0;
    for (let i = 1; i < s; i++) if (arr[i] > arr[maxIdx]) maxIdx = i;
    if (maxIdx !== s - 1) {
      if (maxIdx > 0) flip(maxIdx);
      flip(s - 1);
    }
  }
  return arr;
}`,
      python: `def pancake_sort(arr):
    def flip(k):
        arr[:k+1] = reversed(arr[:k+1])
    for s in range(len(arr), 1, -1):
        max_idx = arr.index(max(arr[:s]))
        if max_idx != s - 1:
            if max_idx > 0: flip(max_idx)
            flip(s - 1)
    return arr`,
      cpp: `void flip(vector<int>& arr, int k) {
    int l = 0, r = k;
    while (l < r) swap(arr[l++], arr[r--]);
}
void pancakeSort(vector<int>& arr) {
    for (int s = arr.size(); s > 1; s--) {
        int maxIdx = max_element(arr.begin(), arr.begin() + s) - arr.begin();
        if (maxIdx != s - 1) {
            if (maxIdx > 0) flip(arr, maxIdx);
            flip(arr, s - 1);
        }
    }
}`
    }
  }
};
