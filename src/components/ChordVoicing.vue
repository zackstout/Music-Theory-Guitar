<template>
  <div class="h-full w-full" :class="{ 'rounded-xl bg-green-300': isFavorite }">
    <!-- <div>{{ noteCoordinates }}</div> -->
    <svg class="w-full h-full p-3" viewBox="0 0 100 100">
      <!-- String: -->
      <line
        v-for="string in strings"
        :key="string"
        y1="0"
        y2="100"
        :x1="10 + (string * 80) / (strings.length - 1)"
        :x2="10 + (string * 80) / (strings.length - 1)"
        stroke="black"
      />

      <!-- Fret: -->
      <line
        v-for="fret in frets"
        :key="fret"
        x1="10"
        x2="90"
        :y1="(fret * 100) / (frets.length - 1)"
        :y2="(fret * 100) / (frets.length - 1)"
        stroke="black"
      />

      <circle
        v-for="(note, idx) in noteCoordsRender"
        :key="idx"
        r="7"
        :fill="getFill(note.index || 0)"
        :cx="10 + (note.string * 80) / (strings.length - 1)"
        :cy="
          -(100 / 2) / (frets.length - 1) +
          (note.fret * 100) / (frets.length - 1)
        "
      />

      <!-- <text
        v-for="(note, idx) in noteCoordsRender"
        :key="idx"
        :x="10 + (note.string * 80) / (strings.length - 1)"
        :y="
          -(100 / 2) / (frets.length - 1) +
          (note.fret * 100) / (frets.length - 1)
        "
        fill="black"
        stroke="black"
      >
        {{ note.index }}
      </text> -->
    </svg>
  </div>
</template>

<script lang="ts">
import { NoteCoordinate } from "@/main";
import { Options, Vue } from "vue-class-component";

/**
 * - So... do we want to detect the root, and the intervals? Or have the props provide that info?
 *
 * - I mean... maybe best way is to support "click to select notes on guitar neck"..
 * - And then you have like an "export" button, or it just builds up as you go...
 * - It creates a JSON array that you can just copy/paste into the code.
 * - It can include info about what interval/role each note is representing/playing.
 *
 *
 *
 * This WAS note fill:
 *         :fill="note.index === 0 ? 'blue' : 'black'"
 * But yeah ... I think I prefer this
 *         :fill="'hsl(' + (note.index * 360) / 12 + ', 90%, 50%)'"
 */

@Options({
  props: {
    noteCoordinates: { type: Array },
    label: { type: String },
    isFavorite: { type: Boolean },
    isBig: { type: Boolean },
    isChromatic: { type: Boolean },
    showThird: { type: Boolean },
  },
})
export default class ChordVoicing extends Vue {
  noteCoordinates!: NoteCoordinate[];
  label!: string;
  isFavorite!: boolean;
  isBig!: boolean;
  isChromatic!: boolean;
  showThird!: boolean;

  getFill(noteIndex: number) {
    if (this.isChromatic) {
      return "hsl(" + (noteIndex * 330) / 12 + ", 90%, 50%)";
    }

    if (this.showThird) {
      return noteIndex === 0 ? "blue" : noteIndex === 3 ? "red" : "black";
    }

    return noteIndex === 0 ? "blue" : "black";
  }

  get numFrets() {
    return this.isBig ? 6 : 5;
  }

  strings = [...new Array(6)].map((_, i) => i);

  get frets() {
    return [...new Array(this.numFrets)].map((_, i) => i);
  }
  // frets = [...new Array(this.numFrets)].map((_, i) => i);

  mounted() {
    // console.log(this.numFrets, this.isBig, this.frets);
  }

  get coordinates() {
    return this.noteCoordinates || [];
  }

  get minimumFret() {
    return Math.min(...this.coordinates.map((n) => n.fret));
  }

  get maximumFret() {
    return Math.max(...this.coordinates.map((n) => n.fret));
  }

  // This should cause it to always render minimum fret on first fret in our diagram.
  get noteCoordsRender() {
    return this.coordinates.map((x) => ({
      ...x,
      fret: x.fret - this.minimumFret + 1,
    }));
  }
}
</script>
