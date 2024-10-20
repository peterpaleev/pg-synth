 // Constants
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = 7;
const KEY_TO_NOTE = {
    'A': 'C', 'W': 'C#', 'S': 'D', 'E': 'D#', 'D': 'E', 'F': 'F', 'T': 'F#',
    'G': 'G', 'Y': 'G#', 'H': 'A', 'U': 'A#', 'J': 'B'
};

// New constant for color mapping
const NOTE_COLORS = {
    'C': '#FF0000', 'C#': '#FF4500', 'D': '#FFA500', 'D#': '#FFD700',
    'E': '#FFFF00', 'F': '#ADFF2F', 'F#': '#00FF00', 'G': '#00FA9A',
    'G#': '#00FFFF', 'A': '#1E90FF', 'A#': '#0000FF', 'B': '#8A2BE2'
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
        let activeNotes = {};
        const MARGIN = 40; // Margin for labels
        let maxTransitions = 1; // To keep track of the maximum number of transitions

        p.setup = () => {
            let canvas = p.createCanvas(440, 480); // Increased size for labels and description
            canvas.parent('matrix-view');
            matrix = Array(NOTES.length).fill().map(() => Array(NOTES.length).fill(0));
        };

        p.draw = () => {
            p.background(255); // White background
            drawMatrix(p, matrix);
            highlightActiveNotesInMatrix(p, activeNotes);
            drawLabels(p);
            drawDescription(p);
        };

        p.updateMatrix = (note) => {
            const noteIndex = NOTES.indexOf(note);
            matrix[noteIndex][noteIndex]++;
            activeNotes[note] = Date.now();
            // Update maxTransitions if necessary
            maxTransitions = Math.max(maxTransitions, matrix[noteIndex][noteIndex]);
        };

        function drawMatrix(p, matrix) {
            const cellSize = (p.width - MARGIN) / NOTES.length;
            p.push();
            p.translate(MARGIN, MARGIN);
            for (let i = 0; i < NOTES.length; i++) {
                for (let j = 0; j < NOTES.length; j++) {
                    const intensity = p.map(matrix[i][j], 0, maxTransitions, 0, 1);
                    const cellColor = p.lerpColor(p.color(255), p.color(0, 0, 255), intensity);
                    p.stroke(220); // Light gray for grid lines
                    p.fill(cellColor);
                    p.rect(i * cellSize, j * cellSize, cellSize, cellSize);
                    p.fill(intensity > 0.5 ? 255 : 0); // White text for dark backgrounds, black for light
                    p.textAlign(p.CENTER, p.CENTER);
                    p.text(matrix[i][j], i * cellSize + cellSize/2, j * cellSize + cellSize/2);
                }
            }
            p.pop();
        }

        function highlightActiveNotesInMatrix(p, activeNotes) {
            const cellSize = (p.width - MARGIN) / NOTES.length;
            const currentTime = Date.now();
            const maxAge = 3000; // 3 seconds

            p.push();
            p.translate(MARGIN, MARGIN);
            for (const [note, startTime] of Object.entries(activeNotes)) {
                const age = currentTime - startTime;
                if (age < maxAge) {
                    const noteIndex = NOTES.indexOf(note);
                    const alpha = p.map(age, 0, maxAge, 255, 0);
                    p.noStroke();
                    p.fill(NOTE_COLORS[note] + alpha.toString(16).padStart(2, '0'));
                    p.rect(noteIndex * cellSize, noteIndex * cellSize, cellSize, cellSize);
                    
                    // Redraw the text
                    p.fill(0);
                    p.textAlign(p.CENTER, p.CENTER);
                    p.text(matrix[noteIndex][noteIndex], noteIndex * cellSize + cellSize/2, noteIndex * cellSize + cellSize/2);
                } else {
                    delete activeNotes[note];
                }
            }
            p.pop();
        }

        function drawLabels(p) {
            p.textSize(10);
            p.textAlign(p.CENTER, p.CENTER);
            p.fill(0);

            // X-axis labels
            for (let i = 0; i < NOTES.length; i++) {
                p.text(NOTES[i], MARGIN + i * ((p.width - MARGIN) / NOTES.length) + ((p.width - MARGIN) / NOTES.length) / 2, p.height - 10);
            }

            // Y-axis labels
            p.push();
            p.translate(10, MARGIN);
            p.rotate(-p.HALF_PI);
            for (let i = 0; i < NOTES.length; i++) {
                p.text(NOTES[i], -i * ((p.height - MARGIN) / NOTES.length) - ((p.height - MARGIN) / NOTES.length) / 2, 0);
            }
            p.pop();

            // Axis titles
            p.textSize(12);
            p.text("To Note", p.width / 2, p.height - MARGIN / 2);
            p.push();
            p.translate(MARGIN / 2, p.height / 2);
            p.rotate(-p.HALF_PI);
            p.text("From Note", 0, 0);
            p.pop();
        }

        function drawDescription(p) {
            p.textSize(10);
            p.textAlign(p.LEFT, p.TOP);
            p.fill(0);
            p.text("This matrix shows note transitions. Each cell represents the number of times", MARGIN, 10);
            p.text("a note (y-axis) has transitioned to another note (x-axis).", MARGIN, 22);
            p.text("Color intensity indicates transition frequency (darker = more frequent).", MARGIN, 34);
        }
    }, 'matrix-view');
}

function initializeGraphSketch() {
    graphSketch = new p5((p) => {
        let nodes = [];
        let edges = [];

        // Constants for music theory-based plotting
        const CIRCLE_OF_FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];

        p.setup = () => {
            let canvas = p.createCanvas(400, 400);
            canvas.parent('graph-view');
        };

        p.draw = () => {
            p.background(255); // White background
            drawCircleOfFifths(p);
            drawGraph(p, nodes, edges);
            highlightActiveNodesInGraph(p, nodes);
        };

        function drawCircleOfFifths(p) {
            const centerX = p.width / 2;
            const centerY = p.height / 2;
            const radius = p.width * 0.4; // 80% of the width
            const angleStep = (2 * Math.PI) / 12;

            p.noFill();
            p.stroke(200); // Light gray
            p.ellipse(centerX, centerY, radius * 2);

            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(14);
            p.fill(0); // Black text

            for (let i = 0; i < CIRCLE_OF_FIFTHS.length; i++) {
                const angle = i * angleStep - Math.PI / 2; // Start at 12 o'clock
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);

                // Draw note name
                p.text(CIRCLE_OF_FIFTHS[i], x, y);

                // Draw tick mark
                const innerX = centerX + (radius - 10) * Math.cos(angle);
                const innerY = centerY + (radius - 10) * Math.sin(angle);
                const outerX = centerX + (radius + 10) * Math.cos(angle);
                const outerY = centerY + (radius + 10) * Math.sin(angle);
                p.stroke(150); // Darker gray for tick marks
                p.line(innerX, innerY, outerX, outerY);
            }
        }

        function drawGraph(p, nodes, edges) {
            const currentTime = Date.now();
            const maxEdgeAge = 5000; // 5 seconds

            // Draw edges
            for (let edge of edges) {
                const startNode = nodes[edge[0]];
                const endNode = nodes[edge[1]];
                const edgeAge = currentTime - edge[2]; // edge[2] is the timestamp
                
                if (edgeAge < maxEdgeAge) {
                    const thickness = p.map(edgeAge, 0, maxEdgeAge, 4, 0);
                    const alpha = p.map(edgeAge, 0, maxEdgeAge, 255, 0);
                    p.stroke(0, alpha);
                    p.strokeWeight(thickness);
                    p.line(startNode.x, startNode.y, endNode.x, endNode.y);
                }
            }

            // Draw nodes
            p.strokeWeight(1);
            for (let node of nodes) {
                p.fill(NOTE_COLORS[node.note]);
                p.ellipse(node.x, node.y, 20, 20);
                p.fill(0);
                p.textAlign(p.CENTER, p.CENTER);
                p.text(node.note, node.x, node.y);
            }
        }

        function highlightActiveNodesInGraph(p, nodes) {
            const currentTime = Date.now();
            const maxNodeAge = 3000; // 3 seconds

            for (let i = nodes.length - 1; i >= 0; i--) {
                const node = nodes[i];
                const nodeAge = currentTime - node.timestamp;

                if (nodeAge < maxNodeAge) {
                    const alpha = p.map(nodeAge, 0, maxNodeAge, 255, 0);
                    p.noStroke();
                    p.fill(255, 255, 0, alpha); // Yellow highlight
                    p.ellipse(node.x, node.y, 30, 30);
                }
            }
        }

        p.updateGraph = (note) => {
            // Calculate position based on the Circle of Fifths
            const angleStep = (2 * Math.PI) / 12;
            const index = CIRCLE_OF_FIFTHS.indexOf(note.replace(/\d+/, ''));
            const angle = index * angleStep - Math.PI / 2; // Start at 12 o'clock
            const radius = p.width * 0.4; // 80% of the width
            const x = p.width / 2 + radius * Math.cos(angle);
            const y = p.height / 2 + radius * Math.sin(angle);

            const currentTime = Date.now();
            const newNode = { x, y, note, timestamp: currentTime };
            nodes.push(newNode);

            if (nodes.length > 1) {
                edges.push([nodes.length - 2, nodes.length - 1, currentTime]);
            }

            // Limit the number of nodes and remove old edges
            if (nodes.length > 24) {
                nodes.shift();
                edges = edges
                    .map(edge => [edge[0] - 1, edge[1] - 1, edge[2]])
                    .filter(edge => edge[0] >= 0 && currentTime - edge[2] < 5000);
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
            const note = NOTES[[0, 2, 4, 5, 7, 9, 11][i]];
            p.fill(NOTE_COLORS[note]);
            p.stroke(0);
            p.rect(x, 0, whiteKeyWidth, whiteKeyHeight);

            if (i !== 2 && i !== 6) {
                const blackNote = NOTES[[1, 3, 6, 8, 10][Math.floor(i / 2)]];
                p.fill(NOTE_COLORS[blackNote]);
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
            p.fill(p.color(NOTE_COLORS[note] + alpha.toString(16).padStart(2, '0')));
            p.rect(x, 0, p.width / (OCTAVES * 7), p.height);
        } else {
            delete activeNotes[note];
        }
    }
}

function getConsonanceValue(interval) {
    // Simple consonance calculation based on music theory
    const consonanceValues = [1, 0.1, 0.5, 0.3, 0.8, 0.6, 0.2, 0.9, 0.4, 0.7, 0.3, 0.5];
    return consonanceValues[interval % 12];
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
