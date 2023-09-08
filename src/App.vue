<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/> -->

  <div class="flex flex-col space-y-6 p-8">
    <div class="text-4xl">Chords</div>

    <table>
      <tbody>
        <tr v-for="chord in allChordInfo" :key="chord.name">
          <td>
            {{ chord.name }}
          </td>
          <td>{{ chord.label }}</td>
          <td>{{ getAllIntervals(chord.intervals) }}</td>
          <td>
            <div class="flex space-x-1">
              <div
                class="rounded bg-blue-200 w-8 h-8"
                v-for="x in getNotes(chord.intervals)"
                :key="x"
                :class="{ 'bg-blue-600': x }"
              ></div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Buttons representing each chord: -->
    <div class="flex flex-wrap">
      <div v-for="chord in allChordInfo" :key="chord.name">
        <div
          class="cursor-pointer hover:bg-gray-100 p-2 m-2 rounded outline-black outline"
          @click="selectChord(chord.intervals)"
        >
          {{ chord.name }}
        </div>
        <div class="italic text-xs">{{ chord.label }}</div>
      </div>

      <div>
        <div
          class="cursor-pointer hover:bg-gray-100 p-2 m-2 rounded outline-black outline"
          @click="noteSelections = []"
        >
          Clear
        </div>
      </div>
    </div>

    <!-- Buttons representing each note: -->
    <div class="flex my-4">
      <div
        v-for="note in allNotes"
        :key="note"
        class="rounded shadow px-4 py-2 m-2 cursor-pointer border border-transparent select-none"
        :class="{
          'border-black bg-green-200': noteSelections.includes(note),
        }"
        @click="toggleNote(note)"
      >
        {{ note }}
      </div>
    </div>

    <svg class="w-full h-80 bg-gray-100" viewBox="0 0 800 100">
      <!-- Strings: -->
      <line
        v-for="string in strings"
        :key="string"
        :x1="800 / this.frets.length"
        x2="800"
        :y1="(string * 100) / 6"
        :y2="(string * 100) / 6"
        stroke="black"
      />

      <!-- Frets: -->
      <line
        v-for="fret in frets"
        :key="fret"
        :x1="800 / this.frets.length + (fret * 800) / this.frets.length"
        :x2="800 / this.frets.length + (fret * 800) / this.frets.length"
        y1="0"
        y2="100"
        stroke="black"
      />

      <!-- Notes: -->
      <circle
        v-for="circle in allNoteCircles"
        :key="circle.index"
        :cx="800 / 26 + (circle.x * 800) / this.frets.length"
        :cy="100 - 100 / 6 - (circle.y * 100) / 6"
        r="7"
        stroke="black"
        :fill="
          noteSelections.includes(getNoteLabel(circle.index))
            ? getNoteLabel(circle.index) === 'A'
              ? 'blue'
              : 'green'
            : 'none'
        "
      />

      <text
        v-for="circle in allNoteCircles"
        :key="circle.index"
        :x="800 / 26 + (circle.x * 800) / this.frets.length - 4"
        :y="100 - 100 / 6 - (circle.y * 100) / 6 + 3.5"
        class="text-[8px] font-bold"
        :fill="
          noteSelections.includes(getNoteLabel(circle.index))
            ? 'white'
            : 'black'
        "
      >
        {{ getNoteLabel(circle.index) }}
      </text>
    </svg>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import HelloWorld from "./components/HelloWorld.vue";

@Options({
  components: {
    HelloWorld,
  },
})
export default class App extends Vue {
  strings = [...new Array(6)].map((_, i) => i);
  frets = [...new Array(15)].map((_, i) => i);

  // [x] TODO: Make getNoteLabel actually work
  // [x] TODO: Make notes highlight when they are included in noteSelections

  // TODO: Add fret number markers (3, 5, 7, 9, 12)

  // TODO: add chord detector -- look at intervals among selected notes. See what chord(s) it could possibly be.
  // [x] TODO: highlight the root note. (Currently we are doing it but just hard-coded to A)
  // TODO: Add label for chord after selecting it.
  // And also keep the button highlighted maybe

  // TODO: Add a "shift chord" button, so if we are showing Amaj, shift to Bbmaj. Good for showing open chords.
  // Or maybe better to just follow other chord-making sites, just have a button for key and a button for chord type.

  // TODO: Add ability to choose a selection of notes from the neck itself... and save that as a chord.
  // You could already know the chord name if you do detection.
  // Then you can save a bunch of voicings of same chord. Fuck yeah bro.
  // I mean, you can also just write them down manually too.
  // Just a simple set of points each having 2 coordinates (string + fret).

  // We just have to determine what we want to use as root. E? A? C?
  // And also have to decide how to display them... Hmmmm
  // And think of a way to keep it organized in code... like.. we have "rows" of chord types,
  // and then "columns" of... pattern nameS? Like "A-shaped"?
  // Maybe make that as a separate page? Just a big table with sticky headers?
  // We should have a way to represent optional notes

  // [x] TODO: maybe should go up to like 15... stuff right around the 0/12 gets a bit obscured.

  allNotes = ["A", "Bb", "B", "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab"];

  noteSelections: string[] = [];

  get allNoteCircles() {
    const result = [];

    for (let i = 0; i < this.strings.length; i++) {
      for (let j = 0; j < this.frets.length; j++) {
        result.push({
          index: i * this.frets.length + j,
          x: j,
          y: i,
        });
      }
    }
    return result;
  }

  /**
   * When string is 0 (low E), we start at index 7.
   * When string is 1 (A), we start at 0.
   * We are asking, what index in the list does our string occur at?
   */
  getNoteLabel(idx: number) {
    const stringIndexLookup: Record<number, number> = {
      0: 7,
      1: 0,
      2: 5,
      3: 10,
      4: 2,
      5: 7,
    };
    const string = Math.floor(idx / this.frets.length);
    const fret = idx % this.frets.length;
    // return string.toString();
    return this.allNotes[(stringIndexLookup[string] + fret) % 12];
  }

  selectChord(intervals: number[]) {
    const newSelections = ["A"];

    let idx = 0;

    for (const distance of intervals) {
      idx += distance;
      newSelections.push(this.allNotes[idx]);
    }

    this.noteSelections = newSelections;
  }

  toggleNote(note: string) {
    if (this.noteSelections.includes(note)) {
      this.noteSelections.splice(this.noteSelections.indexOf(note), 1);
    } else {
      this.noteSelections.push(note);
    }
  }

  // Used to power the TABLE

  getNotes(intervals: number[]) {
    const result = [true]; // First note is always included

    for (const interval of intervals) {
      for (let i = 0; i < interval - 1; i++) {
        result.push(false);
      }
      result.push(true);
    }

    while (result.length < 13) {
      result.push(result.length === 12);
    }
    return result;
    //  [...new Array(13)].map((x) => true);
  }

  getAllIntervals(intervals: number[]) {
    return [...intervals, 12 - intervals.reduce((sum, x) => sum + x, 0)];
  }

  allChordInfo = [
    {
      name: "Major",
      label: "1-3-5",
      intervals: [4, 3],
    },
    {
      name: "minor",
      label: "1-b3-5",
      intervals: [3, 4],
    },
    // sevenths
    {
      name: "7th",
      label: "1-3-5-b7",
      intervals: [4, 3, 3],
    },
    {
      name: "Major 7th",
      label: "1-3-5-7",
      intervals: [4, 3, 4],
    },
    {
      name: "minor 7th",
      label: "1-b3-5-b7",
      intervals: [3, 4, 3],
    },
    // ninths -- hmm these are tricky. Do we show at position 2, or extend out to show at position 11??
    {
      name: "9th",
      label: "1-3-5-b7-9",
      intervals: [2, 2, 3, 3],
    },
    {
      name: "add 9",
      label: "1-3-5-9",
      intervals: [2, 2, 3],
    },
    {
      name: "minor 9th",
      label: "1-b3-5-b7-9",
      intervals: [2, 1, 4, 3],
    },
    // sixths
    {
      name: "6th",
      label: "1-3-5-6",
      intervals: [4, 3, 2],
    },
    {
      name: "minor 6th",
      label: "1-b3-5-6",
      intervals: [3, 4, 2],
    },
    {
      name: "6 / 9",
      label: "1-3-5-6-9",
      intervals: [2, 2, 3, 2],
    },
    // weirdos
    {
      name: "diminished",
      label: "1-b3-b5",
      intervals: [3, 3],
    },
    {
      name: "sus 2",
      label: "1-2-5",
      intervals: [2, 5],
    },
    {
      name: "sus 4",
      label: "1-4-5",
      intervals: [5, 2],
    },
    {
      name: "augmented",
      label: "1-3-#5",
      intervals: [4, 4],
    },
    {
      name: "13th",
      label: "1-3-5-b7-13",
      intervals: [4, 3, 2, 1],
    },
  ];

  created() {
    console.log("what up", this.allNoteCircles);
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

td {
  border: 1px solid black;
  padding: 0.3rem 1rem;
}
</style>
