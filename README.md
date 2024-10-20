# MIDI Sequence Generator

## Live Demo

You can try out the MIDI Sequence Generator live at: [https://peterpaleev.github.io/pg-synth/](https://peterpaleev.github.io/pg-synth/)


## Overview

This web application is a MIDI Sequence Generator that allows users to create and visualize musical sequences using keyboard input. It provides an interactive interface with multiple visual representations of the musical data, including a piano keyboard, a note transition matrix, and a graph visualization of chord progressions.

## Features

1. **Piano Keyboard Visual**
   - A full piano keyboard is visually represented.
   - Notes are highlighted when played.
   - Different colors represent various types of loops and musical relationships.

2. **Matrix Notes Representation**
   - Displays a grid of all notes.
   - Updates in real-time as notes are played.
   - Uses color intensity to show the frequency of note transitions.

3. **Graph Visualization of Chord Progressions**
   - Represents chords as nodes and transitions as edges.
   - Highlights active chords and transitions.
   - Arranged according to the Circle of Fifths for music theory-based visualization.

4. **Keyboard Input**
   - Uses computer keyboard keys to play notes.
   - Mapping: A->C, W->C#, S->D, E->D#, D->E, F->F, T->F#, G->G, Y->G#, H->A, U->A#, J->B

5. **Mathematical Representation**
   - Visualizes minimalist concepts, repeating triads, and simple progressions.
   - Represents symmetry and transformations in music as geometric operations.
   - Shows phase shifts in sequences visually.

6. **Synth Settings Adjuster**
   - Allows real-time adjustment of synthesizer parameters.
   - Controls for volume, attack, decay, sustain, release, and filter cutoff.
   - Provides immediate audible feedback as settings are changed.

## Technical Details

- Built with HTML, CSS, and JavaScript.
- Uses the p5.js library for graphics and animations.
- Utilizes the Tone.js library for sound synthesis.

## File Structure

- `index.html`: The main HTML file that structures the web page.
- `styles.css`: Contains all the styling for the application.
- `script.js`: The main JavaScript file that handles the application logic.

## Key Components

1. `initializeApp()`: Sets up the entire application.
2. `initializePianoKeyboard()`: Creates the visual piano keyboard.
3. `initializeMatrixSketch()`: Sets up the note transition matrix.
4. `initializeGraphSketch()`: Creates the chord progression graph.
5. `playNote()`: Handles note playing and updates visualizations.

## How to Use

1. Open the `index.html` file in a web browser.
2. Use your computer keyboard to play notes (see keyboard mapping above).
3. Observe the visual feedback on the piano keyboard, matrix, and graph.
4. Experiment with different note sequences to see how the visualizations change.

## Future Enhancements

- Implement chord detection logic.
- Add more complex loop types and visualizations.
- Incorporate MIDI device input for more advanced control.
- Implement sequence recording and playback features.

## Dependencies

- [Tone.js](https://tonejs.github.io/)
- [p5.js](https://p5js.org/)

## Contributors

@peterpaleev

## License

MIT License
