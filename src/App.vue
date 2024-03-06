<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/> -->

  <div class="flex flex-col space-y-6 p-12">
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
          @click="clear"
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

    <!-- Guitar neck visualization: -->
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

      <!-- Fret markers: -->
      <text
        :x="
          -4 + 800 / 2 / this.frets.length + (marker * 800) / this.frets.length
        "
        class="text-[10px]"
        :y="-20"
        v-for="marker in fretMarkers"
        :key="marker"
        fill="black"
      >
        {{ marker }}
      </text>

      <!-- Notes: -->
      <circle
        v-for="circle in allNoteCircles"
        :key="circle.index"
        :cx="800 / 26 + (circle.x * 800) / this.frets.length"
        :cy="100 - 100 / 6 - (circle.y * 100) / 6"
        r="7"
        :stroke="
          noteSelectionsFromNeck
            .map((x) => x.originalIndex)
            .includes(circle.index)
            ? 'gold'
            : 'black'
        "
        :stroke-width="
          noteSelectionsFromNeck
            .map((x) => x.originalIndex)
            .includes(circle.index)
            ? 3
            : 1
        "
        class="cursor-pointer"
        @click="toggleSelectFromNeck(circle)"
        :fill="
          noteSelections.includes(getNoteLabel(circle.index))
            ? getFill(circle)
            : 'transparent'
        "
      />

      <text
        v-for="circle in allNoteCircles"
        :key="circle.index"
        :x="800 / 26 + (circle.x * 800) / this.frets.length - 4"
        :y="100 - 100 / 6 - (circle.y * 100) / 6 + 3.5"
        class="text-[8px] font-bold cursor-pointer select-none"
        @click="toggleSelectFromNeck(circle)"
        :fill="
          noteSelections.includes(getNoteLabel(circle.index))
            ? 'white'
            : 'black'
        "
      >
        {{ getNoteLabel(circle.index) }}
      </text>
    </svg>

    <!-- JSON output for selected neck notes: -->
    <div v-if="noteSelectionsFromNeck.length > 0">
      {{ noteSelectionsFromNeck }}
    </div>

    <div class="w-full h-1 border-gray-400 border bg-gray-400 my-4"></div>

    <!-- All da chords -->
    <h3 class="text-4xl">Chord Voicings</h3>
    <div class="flex flex-col space-y-10">
      <div
        class="flex flex-col items-center space-y-6"
        v-for="(voicing, idx) in allVoicings"
        :key="idx"
      >
        <div class="text-xl font-bold">{{ voicing[0] }}</div>

        <div class="mb-8 flex space-x-4">
          <div class="h-32 w-32" v-for="(v, idx2) in voicing[1]" :key="idx2">
            <ChordVoicing
              :noteCoordinates="v"
              :isFavorite="getFaveStatus(idx2, voicing[0])"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="w-full h-1 border-gray-400 border bg-gray-400 my-4"></div>

    <!-- Triads -->
    <h3 class="text-4xl">Triads</h3>

    <div class="p-3 rounded-lg border border-black">
      <ul>
        <li>Top 2 rows from D, A, and E shapes.</li>
        <li>Bottom 2 rows from G, C and E shapes.</li>
        <li>
          As you shift up on the neck, the root drops a string; as you shift
          down, root goes up a string.
        </li>
        <li>
          The third is *always* above the root (if you wrap around), and the
          fifth always below.
        </li>
        <li>(So, it's easy to find the minor triads.)</li>
        <li>
          Wrap around from left-most cell in each row to rightmost cell in next
          row to continue shape. (D becomes C; A becomes G; E abides.)
        </li>
        <li>The bottom 2 rows have identical shapes.</li>
      </ul>
    </div>

    <table class="triads-table">
      <thead>
        <th>(String on which root lies →)</th>
        <th>E</th>
        <th>B</th>
        <th>G</th>
        <th>D</th>
        <th>A</th>
        <th>E</th>
      </thead>
      <tbody>
        <tr>
          <td>High strings</td>
          <td>
            <ChordVoicing
              :noteCoordinates="allTriadInfo['highStrings']?.['E']"
              :isChromatic="true"
            />
          </td>
          <td>
            <ChordVoicing
              :noteCoordinates="allTriadInfo['highStrings']?.['B']"
              :isChromatic="true"
            />
          </td>
          <td>
            <ChordVoicing
              :noteCoordinates="allTriadInfo['highStrings']?.['G']"
              :isChromatic="true"
            />
          </td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>High-mid strings</td>
          <td></td>
          <td>
            <ChordVoicing
              :noteCoordinates="allTriadInfo['highMidStrings']?.['B']"
              :isChromatic="true"
            />
          </td>
          <td>
            <ChordVoicing
              :noteCoordinates="allTriadInfo['highMidStrings']?.['G']"
              :isChromatic="true"
            />
          </td>

          <td>
            <ChordVoicing
              :noteCoordinates="allTriadInfo['highMidStrings']?.['D']"
              :isChromatic="true"
            />
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>Low-mid strings</td>
          <td></td>
          <td></td>
          <td>
            <ChordVoicing
              :noteCoordinates="allTriadInfo['lowMidStrings']?.['G']"
              :isChromatic="true"
            />
          </td>
          <td>
            <ChordVoicing
              :noteCoordinates="allTriadInfo['lowMidStrings']?.['D']"
              :isChromatic="true"
            />
          </td>
          <td>
            <ChordVoicing
              :noteCoordinates="allTriadInfo['lowMidStrings']?.['A']"
              :isChromatic="true"
            />
          </td>
          <td></td>
        </tr>
        <tr>
          <td>Low strings</td>
          <td></td>
          <td></td>
          <td></td>

          <td>
            <ChordVoicing
              :noteCoordinates="allTriadInfo['lowStrings']?.['D']"
              :isChromatic="true"
            />
          </td>
          <td>
            <ChordVoicing
              :noteCoordinates="allTriadInfo['lowStrings']?.['A']"
              :isChromatic="true"
            />
          </td>
          <td>
            <ChordVoicing
              :noteCoordinates="allTriadInfo['lowStrings']?.['E']"
              :isChromatic="true"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <div class="w-full h-1 border-gray-400 border bg-gray-400 my-4"></div>
    <!-- Shell chords -->
    <h3 class="text-4xl">Shell voicings</h3>

    <div class="p-3 rounded-lg border border-black">
      <ul>
        <li>
          There are only 2 possible 3rds (major and minor), and 3 possible 7ths
          (major, minor, and double minor, or, major 6th).
        </li>
        <li>
          So technically there are 6 total, even though we can mostly ignore
          minMaj I feel.
        </li>
        <li>
          dim and m6 end up being the same here, since we omit the 5th, and bb7
          = M6 .
        </li>
        <li>
          The 7th relationship is always played the same (up 2 strings), but the
          3rd is played either up 1 string, or up 3.
        </li>
        <li>
          When played 3 strings up, it's just 1 string above the 7th -- since
          3rd is a 4th of the 7th (and strings are a 4th apart).
        </li>
      </ul>
    </div>

    <table>
      <thead>
        <th></th>
        <th>3rd</th>
        <th>7th</th>
        <th>5th</th>
      </thead>

      <tbody>
        <tr>
          <td>Maj 7</td>
          <td>Maj</td>
          <td>Maj</td>
          <td>Maj</td>
        </tr>

        <tr>
          <td>m7</td>
          <td>m</td>
          <td>m</td>
          <td>Maj</td>
        </tr>

        <tr>
          <td>7</td>
          <td>Maj</td>
          <td>m</td>
          <td>Maj</td>
        </tr>

        <tr>
          <td>Maj 6</td>
          <td>Maj</td>
          <td>6</td>
          <td>Maj</td>
        </tr>

        <tr>
          <td>m6</td>
          <td>m</td>
          <td>6</td>
          <td>Maj</td>
        </tr>

        <tr>
          <td>dim</td>
          <td>m</td>
          <td>6 (bb7)</td>
          <td>m</td>
        </tr>

        <tr>
          <td>minMaj</td>
          <td>m</td>
          <td>Maj</td>
          <td>Maj</td>
        </tr>
      </tbody>
    </table>

    <!-- Jazz shell chords: -->
    <div class="flex w-full flex-wrap">
      <div class="flex w-full justify-center p-3">
        <div
          class="w-40 h-40"
          v-for="voicing in triadShells.high"
          :key="voicing"
        >
          <div>{{ voicing.label }}</div>
          <ChordVoicing :noteCoordinates="voicing.values" :isChromatic="true" />
        </div>
      </div>

      <div class="flex w-full justify-center p-3">
        <div
          v-for="voicing in triadShells.low"
          :key="voicing"
          class="w-40 h-40"
        >
          <!-- <div>{{ voicing.label }}</div> -->
          <ChordVoicing :noteCoordinates="voicing.values" :isChromatic="true" />
        </div>
      </div>
    </div>

    <div class="w-full h-1 border-gray-400 border bg-gray-400 my-4"></div>

    <h3 class="text-4xl">Seventh chords</h3>

    <table>
      <thead>
        <th></th>
        <th>E root</th>
        <th>A root</th>
        <th>D root</th>
      </thead>

      <tbody>
        <tr
          v-for="(voicing, voicingIdx) in jazzVoicings"
          :key="voicing"
          :class="[voicingIdx % 2 ? 'bg-gray-200' : '']"
        >
          <td class="font-bold">{{ voicing.label }}</td>
          <td>
            <div class="w-32 h-32 flex justify-center w-full">
              <ChordVoicing :noteCoordinates="voicing.e" :isChromatic="false" />
            </div>
          </td>
          <td>
            <div class="w-32 h-32 flex justify-center w-full">
              <ChordVoicing :noteCoordinates="voicing.a" :isChromatic="false" />
            </div>
          </td>
          <td>
            <div class="w-32 h-32 flex justify-center w-full">
              <ChordVoicing :noteCoordinates="voicing.d" :isChromatic="false" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- <div class="w-40 h-40">
      <ChordVoicing
        :isBig="true"
        :noteCoordinates="uberChord"
        :isChromatic="true"
      />
    </div> -->

    <div class="w-full h-1 border-gray-400 border bg-gray-400 my-4"></div>
    <h3 class="text-4xl">Pentatonic scales</h3>

    <div class="p-3 rounded-lg border border-black">
      <ul>
        <li>
          Blue is root when considered as minor scale. (CAGED starts at 3)
        </li>
        <li>Red is root when considered as major. (CAGED starts at 4)</li>
        <li>Position 2 is at fret 3</li>
        <li>Position 3 is at fret 5</li>
        <li>Position 4 is at fret -5</li>
        <li>Position 5 is at fret -2</li>
        <li>
          The "blues" note is b5, from the perspective of the minor (Aeolian)
          scale (whose root is blue here).
        </li>
        <li>It is, I guess, b3 from the perspective of the Ionian/major.</li>
      </ul>
    </div>

    <div class="w-full flex justify-between pb-16">
      <div
        class="w-40 h-40 flex items-center space-y-2 flex-col"
        v-for="(scale, idx) in pentatonics"
        :key="idx + 'penta'"
      >
        <div class="font-bold">{{ idx + 1 }}</div>
        <div class="italic">{{ pentatonicLabels[idx] }}</div>
        <ChordVoicing
          :isBig="true"
          :noteCoordinates="scale"
          :showThird="true"
        />
      </div>
    </div>

    <!-- Copy pasta for major scalez: -->
    <div class="w-full flex justify-between pb-16">
      <div
        class="w-40 h-40 flex items-center space-y-2 flex-col"
        v-for="(scale, idx) in majorScales"
        :key="idx + 'major'"
      >
        <div class="font-bold">{{ idx + 1 }}</div>
        <div class="italic">{{ pentatonicLabels[idx] }}</div>
        <ChordVoicing
          :isBig="true"
          :noteCoordinates="scale"
          :showThird="true"
          :isChromatic="true"
        />
      </div>
    </div>

    <table>
      <tr>
        <td>Minor pentatonic</td>
        <td>R</td>
        <td>m3</td>
        <td>4</td>
        <td>5</td>
        <td>m7</td>
      </tr>
      <tr>
        <td>Major pentatonic</td>
        <td>6</td>
        <td>R</td>
        <td>2</td>
        <td>3</td>
        <td>5</td>
      </tr>
      <tr>
        <td>Ex</td>
        <td>A</td>
        <td>C</td>
        <td>D</td>
        <td>E</td>
        <td>G</td>
      </tr>
      <tr>
        <td>Japanese</td>
        <td>R</td>
        <td>M2</td>
        <td>m3</td>
        <td>5</td>
        <td>m6</td>
      </tr>
      <tr>
        <td>Japanese Ex</td>
        <td>C</td>
        <td>D</td>
        <td>Eb</td>
        <td>G</td>
        <td>Ab</td>
      </tr>
    </table>

    <div class="w-full h-1 border-gray-400 border bg-gray-400 my-4"></div>
    <h3 class="text-4xl">Diatonic arpeggios</h3>

    <div class="flex justify-center">
      <div
        v-for="(d, idx) in seventhArpeggios"
        :key="'seventh' + idx"
        class="w-32 flex flex-col items-center"
      >
        <div class="font-bold">{{ seventhArpeggioTitles[idx - 1] }}</div>
        <div class="italic">{{ seventhArpeggioLabels[idx - 1] }}</div>
        <div class="text-xs">{{ seventhArpeggioAltExplanations[idx - 1] }}</div>

        <ChordVoicing :noteCoordinates="d" />
      </div>
    </div>

    <div class="w-full h-1 border-gray-400 border bg-gray-400 my-4 mt-8"></div>
    <h3 class="text-4xl">Modes of Major Scale</h3>

    <div class="flex flex-col space-y-3 items-center justify-center">
      <table>
        <tbody class="p-1">
          <tr>
            <td class="bold">Lydian</td>
            <td class="italic">iv</td>
            <td>Ex: F</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>^</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>Brightest</td>
          </tr>
          <tr>
            <td class="bold">Ionian</td>
            <td class="italic">i</td>
            <td>Ex: C</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
          </tr>
          <tr>
            <td class="bold">Mixolydian</td>
            <td class="italic">v</td>
            <td>Ex: G</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>v</td>
          </tr>
          <tr>
            <td class="bold">Dorian</td>
            <td class="italic">ii</td>
            <td>Ex: D</td>
            <td>-</td>
            <td>-</td>
            <td>v</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>v</td>
          </tr>
          <tr>
            <td class="bold">Aeolian</td>
            <td class="italic">vi</td>
            <td>Ex: A</td>
            <td>-</td>
            <td>-</td>
            <td>v</td>
            <td>-</td>
            <td>-</td>
            <td>v</td>
            <td>v</td>
          </tr>
          <tr>
            <td class="bold">Phrygian</td>
            <td class="italic">iii</td>
            <td>Ex: E</td>
            <td>-</td>
            <td>v</td>
            <td>v</td>
            <td>-</td>
            <td>-</td>
            <td>v</td>
            <td>v</td>
          </tr>
          <tr>
            <td class="bold">Locrian</td>
            <td class="italic">vii</td>
            <td>Ex: B</td>
            <td>-</td>
            <td>v</td>
            <td>v</td>
            <td>-</td>
            <td>v</td>
            <td>v</td>
            <td>v</td>
            <td>Darkest</td>
          </tr>
        </tbody>
      </table>

      <ul>
        <li>
          The notes of C Ionian are identical to those of A Aeolian, D Dorian, E
          Phrygian, etc.
        </li>
        <li>
          The first (brightest) 3 modes are considered "major", and the next 3
          are "minor".
        </li>
        <li class="font-bold italic">
          So there are 2 ways to think of, e.g., "F Dorian":
        </li>
        <li>(a) As the notes of Eb Major, but starting at second note.</li>
        <li>
          (b) As the notes of F Major, but you flatten the 3rd and 7th notes.
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import ChordVoicing from "./components/ChordVoicing.vue";
import { NoteCoordinate } from "./main";
import {
  allSeeingEye,
  ALL_CHORD_INFO,
  jazzVoicingsData,
  pentatonics,
  seventhArpeggios,
  triadsData,
  triadsShellData,
  uberChord,
  majorScales,
} from "./data";

interface NoteCircle {
  index: number;
  x: number;
  y: number;
}

/**
 * Modes notes:
 * - Ionian (skip/avoid 4th)
 * - Dorian (major with b3 b7, or natural minor with #6)
 * - Phrygian (major with b2 b3 b6 b7, or natural minor with b2)
 * - Lydian (ionian with raised 4th)
 * - Mixolydian (ionian with flat 7th)
 * - Locrian (Phrygian with b5)
 */

const modes = {
  ionian: "_______",
  dorian: "__b___b",
  phrygian: "_bb__bb",
  lydian: "___#___",
  mixolydian: "______b",
  aeolian: "__b__bb",
  locrian: "_bb_bbb",
};

// Increasing number of flats: I, V, II, VI, III, VII, IV
// Kind of reminiscent of circle of fifths: C, G, D, A, ... like two interlaced ascending patterns

// Oh wow, it just let me v-for through entries of an object, I wasn't even thinking about it lol

@Options({
  components: {
    ChordVoicing,
  },
})
export default class App extends Vue {
  strings = [...new Array(6)].map((_, i) => i);
  frets = [...new Array(15)].map((_, i) => i);

  colors = [...new Array(7)].map((_, i) => i);

  fretMarkers = [3, 5, 7, 9, 12];

  uberChord = uberChord;

  seventhArpeggios = seventhArpeggios;
  seventhArpeggioLabels = ["M7", "m7", "m7", "M7", "7", "m7", "m7b5"];
  seventhArpeggioTitles = ["I", "II", "III", "IV", "V", "VI", "VII"];

  // "H" or "M" denotes Harmonic, Melodic natural scales. (The "usual" ones are from natural minor.)
  seventhArpeggioAltExplanations = [
    "maj7#5 (H/M)",
    "7 (M)",
    "7 (H/M)",
    "m7b5 (M)",
    "dim7 (H)",
    "m(maj7) (H/M)",
    "m7 (M)",
  ];

  testNoteCoords: NoteCoordinate[] = [
    { string: 1, fret: 2 },
    { string: 2, fret: 4 },
    { string: 3, fret: 1 },
  ].map((x) => ({ ...x, fret: x.fret + 1 }));

  pentatonics = Object.values(pentatonics);

  majorScales = Object.values(majorScales);

  pentatonicLabels = ["Em/G", "Dm/E", "Cm/D", "Am/C", "Gm/A"];

  noteSelectionsFromNeck: NoteCoordinate[] = [];

  rainbow = [
    "#f1442d",
    "#f58f00",
    "#f1c521",
    "black",
    "#3ab441",
    "#1e6cd5",
    "#5c239e",
  ];

  // Ordering is tricky, because you want M7, 7, m7, but you also want 7 close to 13 and 9.
  // We also want to showcase the Maj7 -> 7 -> m7 -> m7b5 -> dim7, because that is lit.
  get allVoicings() {
    return Object.entries({
      Maj: Object.values(allSeeingEye["major"]),
      m: Object.values(allSeeingEye["minor"]),
      Maj7: Object.values(allSeeingEye["maj7"]),
      "7th": Object.values(allSeeingEye["dom7"]),
      m7: Object.values(allSeeingEye["min7"]),
      "13th": Object.values(allSeeingEye["thirteenth"]),
      Maj9: Object.values(allSeeingEye["maj9"]),
      "9th": Object.values(allSeeingEye["ninth"]),
      m9: Object.values(allSeeingEye["min9"]),
      "add 9": Object.values(allSeeingEye["add9"]),
      m11: Object.values(allSeeingEye["min11"]),
      "sus 2": Object.values(allSeeingEye["sus2"]),
      "sus 4": Object.values(allSeeingEye["sus4"]),
      dim: Object.values(allSeeingEye["dim"]),
      dim7: Object.values(allSeeingEye["dim7"]),
      m7b5: Object.values(allSeeingEye["m7b5"]),
      "6/9": Object.values(allSeeingEye["sixNine"]),
      m6: Object.values(allSeeingEye["m6"]),
      Maj6: Object.values(allSeeingEye["maj6"]),
    });
  }

  get allTriadInfo() {
    // console.log("get all triad info", triadsData);
    // return {
    //   highStrings: Object.values(triadsData["highStrings"]),
    //   highMidStrings: Object.values(triadsData["highMidStrings"]),
    //   lowMidStrings: Object.values(triadsData["lowMidStrings"]),
    //   lowStrings: Object.values(triadsData["lowStrings"]),
    // };
    return triadsData;
  }

  triadOrdering = ["Maj7", "7", "Maj6", "m7", "m6"];

  get triadShells() {
    return {
      high: this.triadOrdering.map((label) => ({
        label,
        values: triadsShellData[label]?.["high"],
      })),
      low: this.triadOrdering.map((label) => ({
        label,
        values: triadsShellData[label]?.["low"],
      })),
    };
  }

  // Note: would also be possible to order as maj7, 7, m7, m7b5, dim7, so we drop one note lower each time.
  // https://www.jazzguitar.be/blog/17-essential-jazz-guitar-chords-beginners/ -- nice, has the exact same idea, the 3 x 5 table, awesome.
  // NOTE: I think A-string needs a second column for shells...
  get jazzVoicings() {
    return ["maj7", "m7b5", "7", "dim7", "m7"].map((label) => {
      return {
        label,
        ...jazzVoicingsData[label],
      };
    });
  }

  favoriteVoicings: Record<string, number[]> = {
    m9: [2],
    "9th": [2, 4],
    Maj9: [1, 2],
    "13th": [1],
    "6/9": [1],
    m6: [0],
    Maj6: [0],
    dim7: [0, 1],
    m7b5: [0, 1],
    dim: [3],
    m11: [1], // not sure about this, this one is so weird
    "add 9": [0], // also not sure, want to find another one
  };

  allNotes = ["A", "Bb", "B", "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab"];

  noteSelections: string[] = [];

  getFaveStatus(idx: number, key: string) {
    // console.log(idx, key);
    return this.favoriteVoicings[key]?.includes(idx);
  }

  getFill(circle: NoteCircle) {
    //  return this.getNoteLabel(circle.index) === 'A'
    //             ? 'blue'
    //             : 'green'

    // Ahhhh.... not quite this simple... there are 12 notes but we need to map them to 7 "real tones".
    // (i.e. 5 of the tones have a flat).
    const noteIdx = this.allNotes.indexOf(this.getNoteLabel(circle.index));

    const noteIdxToToneIndexLookup = [0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6];

    const toneIndex = noteIdxToToneIndexLookup[noteIdx];

    // return `hsl(${this.getHue(toneIndex)}, 80%, 50%)`;
    return this.rainbow[toneIndex];
  }

  clear() {
    this.noteSelections = [];
    this.noteSelectionsFromNeck = [];
  }

  toggleSelectFromNeck(circle: NoteCircle) {
    const label = this.getNoteLabel(circle.index);
    const string = circle.y;
    const fret = circle.x;

    const idx = this.noteSelectionsFromNeck.findIndex(
      (x) => x.originalIndex === circle.index
    );
    if (idx > -1) {
      this.noteSelectionsFromNeck.splice(idx, 1);
    } else {
      this.noteSelectionsFromNeck.push({
        label,
        string,
        fret,
        index: this.allNotes.indexOf(label),
        originalIndex: circle.index,
      });
    }
  }

  // TODO: Put gold border or something around favorite voicings for each chord. Pick 2 or 3, or just 1.

  // TODO: explore rootless voicings

  // NOTE: sus2 and sus4, one of the voicings requires another fret.

  // TODO: Let's go ahead with color-coding each note. I do like the clean look of black... with just root...
  // Maybe you add a toggle for color display vs black?
  // You can experiment with how to -- and WHETHER to -- represent flats. The chord name will tell you that info.

  // The colors will be SUPER helpful for starting to internalize WHERE fifths, thirds, etc, are, relative to a given Root.

  // You can add them on both the guitar neck, and all the chord voicings.

  // Remember -- the vast majority of the shapes you have found were omitting the fifth.
  // You can also add that back in -- and try omitting the 3rd as well.

  // TODO: would be cool to add optional flat fifth to minor 7th in particular. On two shapes at least it is very easy to add.

  // [x] TODO: Make getNoteLabel actually work
  // [x] TODO: Make notes highlight when they are included in noteSelections

  // TODO (FOR TABLE): It would likely help to put note names in the boxes

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
  // You can comfortably fit 6...maybe 7...maybe 8 columns in. You shouldn't need more voicings than that lol.

  // Maybe make that as a separate page? Just a big table with sticky headers?
  // We should have a way to represent optional notes

  // Or maybe you do some kind of... open up a modal with voicings for the chosen chord....
  // And then ... maybe page through different chord types? Like page from maj7 to m7? And see all the chords change?
  // Could work...

  // Oh shit! color code each node. So root is always one color (obviously) -- but then also 3rd is always one, 5th, etc.
  // Could even change the color (*slightly*?) if it's flat.

  // Oooooh shit. You could go deeper. You could have a program that FINDS VOICINGS FOR YOU.
  // Just.... max distance strings can be apart from each other, and frets can be apart.
  // Oh and watch out for one note OVERWRITING another by being on a higher fret on same string.
  // Wow.....
  // I feel like.... we lose out on the learning there...
  // But it's super fucking cool and i want to do it just for kicks.

  // [x] TODO: maybe should go up to like 15... stuff right around the 0/12 gets a bit obscured.

  clamp(val: number, x: number, y: number) {
    if (val < x) return x;
    if (val > y) return y;
    return val;
  }

  lerp(v: number, s1: number, s2: number, t1: number, t2: number) {
    //
  }

  // Testing color stuff for chord voicings chart... whatever form that may take
  getHue(color: number) {
    const spread = (color * 360) / 7;

    return this.clamp(spread * Math.pow(Math.sin(spread / 360), 0.3), 0, 360);
  }

  // Show flatted 3rd and 7th different color
  getSaturation(color: number) {
    // if (color === 2 || color === 6) return 40;
    return 80;
  }

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

  allChordInfo = ALL_CHORD_INFO;

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

td,
th {
  border: 1px solid black;
  padding: 0.3rem 1rem;
}

.triads-table td {
  /* display: flex;
  justify-content: center;
  align-items: center; */
}
</style>
