 // Constants
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = 7;
const KEY_TO_NOTE = {
    'A': 'C', 'W': 'C#', 'S': 'D', 'E': 'D#', 'D': 'E', 'F': 'F', 'T': 'F#',
    'G': 'G', 'Y': 'G#', 'H': 'A', 'U': 'A#', 'J': 'B'
};

// State
let currentSequence = [];
let currentChord = null;
let activeNotes = {};

// Sketches
let pianoSketch, matrixSketch, graphSketch;
let synth;

function initializeApp() {
    console.log("Initializing MIDI Sequence Generator");
    initializeSynth();
    initializePianoKeyboard();
    initializeMatrixSketch();
    initializeGraphSketch();
    setupKeyboardListeners();
}

function initializeSynth() {
    synth = new Tone.PolySynth(Tone.Synth).toDestination();
}

function initializePianoKeyboard() {
    pianoSketch = new p5((p) => {
        p.setup = () => {
            let canvas = p.createCanvas(800, 200);
            canvas.parent('piano-keyboard');
        };

        p.draw = () => {
            p.background(220);
            drawPianoKeys(p);
            highlightActiveNotes(p);
        };
    });
}

function initializeMatrixSketch() {
    matrixSketch = new p5((p) => {
        let matrix;

        p.setup = () => {
            let canvas = p.createCanvas(400, 400);
            canvas.parent('matrix-view');
            matrix = Array(NOTES.length).fill().map(() => Array(NOTES.length).fill(0));
        };

        p.draw = () => {
            p.background(240);
            drawMatrix(p, matrix);
            highlightActiveNotesInMatrix(p, matrix);
        };

        p.updateMatrix = (note) => {
            const noteIndex = NOTES.indexOf(note);
            matrix[noteIndex][noteIndex]++;
        };
    }, 'matrix-view');
}

function initializeGraphSketch() {
    graphSketch = new p5((p) => {
        let nodes = [];
        let edges = [];

        p.setup = () => {
            let canvas = p.createCanvas(400, 400);
            canvas.parent('graph-view');
        };

        p.draw = () => {
            p.background(230);
            drawGraph(p, nodes, edges);
            highlightActiveNodesInGraph(p, nodes);
        };

        p.updateGraph = (note) => {
            const newNode = {
                x: p.random(p.width),
                y: p.random(p.height),
                note: note
            };
            nodes.push(newNode);

            if (nodes.length > 1) {
                edges.push([nodes.length - 2, nodes.length - 1]);
            }
        };
    }, 'graph-view');
}

function drawPianoKeys(p) {
    const whiteKeyWidth = p.width / (OCTAVES * 7);
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const whiteKeyHeight = p.height;
    const blackKeyHeight = p.height * 0.6;

    for (let octave = 0; octave < OCTAVES; octave++) {
        for (let i = 0; i < 7; i++) {
            const x = (octave * 7 + i) * whiteKeyWidth;
            p.fill(255);
            p.stroke(0);
            p.rect(x, 0, whiteKeyWidth, whiteKeyHeight);

            if (i !== 2 && i !== 6) {
                p.fill(0);
                p.rect(x + whiteKeyWidth - blackKeyWidth / 2, 0, blackKeyWidth, blackKeyHeight);
            }
        }
    }
}

function highlightActiveNotes(p) {
    const currentTime = Date.now();
    for (const [note, startTime] of Object.entries(activeNotes)) {
        if (currentTime - startTime < 3000) {
            const noteIndex = NOTES.indexOf(note);
            const octave = Math.floor(noteIndex / 12);
            const noteInOctave = noteIndex % 12;
            const x = (octave * 7 + [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][noteInOctave]) * (p.width / (OCTAVES * 7));
            const alpha = p.map(currentTime - startTime, 0, 3000, 255, 0);
            p.fill(255, 0, 0, alpha);
            p.rect(x, 0, p.width / (OCTAVES * 7), p.height);
        } else {
            delete activeNotes[note];
        }
    }
}

function drawMatrix(p, matrix) {
    const cellSize = p.width / NOTES.length;
    for (let i = 0; i < NOTES.length; i++) {
        for (let j = 0; j < NOTES.length; j++) {
            p.fill(p.map(matrix[i][j], 0, 10, 240, 100));
            p.stroke(200);
            p.rect(i * cellSize, j * cellSize, cellSize, cellSize);
            p.fill(0);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(matrix[i][j], i * cellSize + cellSize/2, j * cellSize + cellSize/2);
        }
    }
}

function highlightActiveNotesInMatrix(p, matrix) {
    const cellSize = p.width / NOTES.length;
    const currentTime = Date.now();
    for (const [note, startTime] of Object.entries(activeNotes)) {
        if (currentTime - startTime < 3000) {
            const noteIndex = NOTES.indexOf(note);
            const alpha = p.map(currentTime - startTime, 0, 3000, 255, 0);
            p.fill(255, 0, 0, alpha);
            p.rect(noteIndex * cellSize, noteIndex * cellSize, cellSize, cellSize);
        }
    }
}

function drawGraph(p, nodes, edges) {
    p.stroke(0);
    for (let edge of edges) {
        p.line(nodes[edge[0]].x, nodes[edge[0]].y, nodes[edge[1]].x, nodes[edge[1]].y);
    }
    p.fill(200);
    p.noStroke();
    for (let node of nodes) {
        p.ellipse(node.x, node.y, 20, 20);
        p.fill(0);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(node.note, node.x, node.y);
    }
}

function highlightActiveNodesInGraph(p, nodes) {
    const currentTime = Date.now();
    for (const [note, startTime] of Object.entries(activeNotes)) {
        if (currentTime - startTime < 3000) {
            const activeNodes = nodes.filter(node => node.note === note);
            const alpha = p.map(currentTime - startTime, 0, 3000, 255, 0);
            p.fill(255, 0, 0, alpha);
            for (let node of activeNodes) {
                p.ellipse(node.x, node.y, 25, 25);
            }
        }
    }
}

function setupKeyboardListeners() {
    document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
    const key = event.key.toUpperCase();
    if (KEY_TO_NOTE.hasOwnProperty(key)) {
        const note = KEY_TO_NOTE[key];
        playNote(note);
    }
}

function playNote(note) {
    console.log(`Playing note: ${note}`);
    currentSequence.push(note);
    updateChord();

    const fullNote = note + '4';
    synth.triggerAttackRelease(fullNote, '3n');

    activeNotes[note] = Date.now();

    matrixSketch.updateMatrix(note);
    graphSketch.updateGraph(note);
}

function updateChord() {
    // TODO: Implement chord detection logic
    console.log(`Updating current chord`);
}

// Initialize the app when the window loads
window.onload = initializeApp;
