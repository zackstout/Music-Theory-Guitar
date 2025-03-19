function backtrack(
  path,
  options,
  isSolution,
  processSolution,
  generateCandidates
) {
  if (isSolution(path)) {
    processSolution(path);
    return;
  }

  let candidates = generateCandidates(path, options);
  for (let candidate of candidates) {
    path.push(candidate); // Make a move
    backtrack(path, options, isSolution, processSolution, generateCandidates);
    path.pop(); // Undo the move (backtrack)
  }
}

// Example usage:
//   function example() {
//     const options = {}; // Problem-specific constraints or inputs
//     function isSolution(path) {
//       return path.length === 3; // Example condition (e.g., finding sequences of length 3)
//     }
//     function processSolution(path) {
//       console.log("Solution found:", path);
//     }
//     function generateCandidates(path, options) {
//       return [1, 2, 3, 4, 5].filter((n) => !path.includes(n)); // Example candidate generation
//     }

//     backtrack([], options, isSolution, processSolution, generateCandidates);
//   }

//   example();

function getCycles(arr) {
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    const cycled = [...arr.slice(i), ...arr.slice(0, i)];
    res.push(cycled);
  }
  return res;
}

// console.log(getCycles([1, 2, 3, 4]));

function getAllChords(numNotes) {
  const options = {};
  const solutions = new Set();

  const NOTE_NAMES = [
    "R",
    "b2",
    "2",
    "b3",
    "3",
    "4",
    "b5",
    "5",
    "#5",
    "6",
    "b7",
    "7",
  ];

  const DISALLOW_CHROMATIC = false;

  // Paths will look like e.g. [4,3] for the major chord.
  // Go up 4 semitones to major third, then 3 more to fifth.

  // If we are testing 3-note chords, we only want to allow 2 more notes besides root.
  const isSolution = (path) => path.length === numNotes - 1;

  const processSolution = (path) => {
    // Want to check if any existing solutions are isomorphic to this one before adding to solution set...
    // console.log("Done", path);

    const pathSum = path.reduce((a, v) => a + v, 0);

    // This is technically redundant but should help us compute whether isomorphic to existing...
    const remaining = 12 - pathSum;

    if (DISALLOW_CHROMATIC && remaining === 1) return;

    const fullPath = [...path, remaining];

    const allCycles = getCycles(fullPath);
    const isIncluded = allCycles.some((cycle) => {
      const str = cycle.join(",");
      return solutions.has(str);
    });
    if (isIncluded) {
      return;
    }

    const pathStr = fullPath.join(",");

    solutions.add(pathStr);
  };

  // If we have already placed intervals [2,5], then the only remaining options should be 1, 2, 3, and 4.
  // (Adding 5 or more would bring us up to and past the root.)
  const generateCandidates = (path, options) => {
    const pathSum = path.reduce((acc, val) => acc + val, 0);
    const maxAllowed = 12 - pathSum - 1;
    const candidates = [];
    const start = DISALLOW_CHROMATIC ? 2 : 1;
    for (let i = start; i <= maxAllowed; i++) {
      candidates.push(i);
    }
    return candidates;
  };

  backtrack([], options, isSolution, processSolution, generateCandidates);

  const namedSolutions = [];

  [...solutions].forEach((chord) => {
    const intervals = chord.split(",").map(Number);
    const allCycles = getCycles(intervals);
    const possibleNames = {
      name: chord,
      names: [],
    };
    allCycles.forEach((cycle) => {
      const named = ["R"];
      let idx = 0;
      for (let i = 0; i < cycle.length - 1; i++) {
        idx += cycle[i];
        named.push(NOTE_NAMES[idx]);
      }
      possibleNames.names.push(named.join("-"));
    });

    namedSolutions.push(possibleNames);
  });

  return namedSolutions;
}

console.time("solution");
const solutions = getAllChords(3);
console.timeEnd("solution");

console.log("Solutions", [...solutions], solutions.length);
