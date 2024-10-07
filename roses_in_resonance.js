let a = 0;
let loveColors = ["#A61458", "#C92B68", "#F74F70", "#FF939B"];
let harmonyColors = ["#14472C", "#185027", "#3A724A", "#77AA84"];
let peaceColors = ["#2C774E", "#2C8646", "#789C84"];
let currentColorIndex = 0;
let transitionSpeed = 0.01;
let pulseFactor = 1;
let rotationX = 0;
let rotationY = 0;
let dragging = false;
let prevMouseX, prevMouseY;
let myChannel, myFFT;
let speedSlider;
let uploadedMusic;
let colorScheme = loveColors;
let thetacum = 0;

function preload() {
    myChannel = loadSound("./assets/sample.mp3");  // Default sample audio
}

function setup() {
    let canvas = createCanvas(600, 600, WEBGL);
    canvas.parent('visualizer-container');
    myFFT = new p5.FFT();
    myChannel.loop();  // Play the default audio in loop
    myChannel.amp(0.5);
    background(255);

    speedSlider = select('#speed-slider');

    // Set up audio upload functionality
    select('#upload-music').elt.onchange = function(event) {
        let file = event.target.files[0];
        if (file && file.type.includes('audio')) {
            handleFile(file);
        }
    };

    // Set up color scheme change
    select('#color-scheme').changed(function() {
        switch (this.value()) {
            case 'love':
                colorScheme = loveColors;
                break;
            case 'harmony':
                colorScheme = harmonyColors;
                break;
            case 'peace':
                colorScheme = peaceColors;
                break;
        }
    });
}

function draw() {
    strokeWeight(4);
    spectrum = myFFT.analyze();
    let theta = (spectrum[20] + spectrum[60] + spectrum[100] + spectrum[140] + spectrum[180] + spectrum[220]) / (256 * 10);
    let speedFactor = speedSlider.value();
    thetacum += theta * speedFactor;
    let amplitude = myFFT.getEnergy("bass");
    pulseFactor = map(amplitude, 0, 255, 0.9, 1.1);

    let nextColorIndex = (currentColorIndex + 1) % colorScheme.length;
    let lerpAmount = sin(thetacum * transitionSpeed) * 0.5 + 0.5;
    let strokeColor = lerpColor(color(colorScheme[currentColorIndex]), color(colorScheme[nextColorIndex]), lerpAmount);
    stroke(strokeColor);

    if (a % 1 === 0) {
        currentColorIndex = nextColorIndex;
    }

    if (dragging) {
        let deltaX = mouseX - prevMouseX;
        let deltaY = mouseY - prevMouseY;
        rotationX += deltaY * 0.01;
        rotationY += deltaX * 0.01;
        prevMouseX = mouseX;
        prevMouseY = mouseY;
    }

    rotateX(rotationX);
    rotateY(rotationY);
    rotateY(cos(thetacum / 40));
    rotateZ(sin(thetacum / 40));
    fill(220, 150);
    let boxSize = (300 - a * 10) * pulseFactor;
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(255, 0, 100, 0.5)';
    box(boxSize);
    a += 0.005 * speedFactor;

    if (a >= 30) {
        if (uploadedMusic && uploadedMusic.isPlaying()) {
            uploadedMusic.stop();  // Stop the uploaded music when the visual ends
        } else {
            myChannel.stop();  // Stop the default music
        }
        noLoop();  // Stop the draw loop when the rose has fully formed
    }
}

function handleFile(file) {
    if (uploadedMusic) {
        uploadedMusic.stop();  // Stop any previously uploaded music
    }

    uploadedMusic = loadSound(file.data, () => {
        a = 0;  // Reset the rose growth variable
        thetacum = 0;  // Reset the angle accumulator
        loop();  // Restart the draw loop

        uploadedMusic.loop();  // Start playing the newly uploaded audio
        myChannel.stop();  // Stop the default audio
    });
}

function mousePressed() {
    dragging = true;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
}

function mouseReleased() {
    dragging = false;
}

function windowResized() {
    resizeCanvas(windowWidth * 0.8, windowHeight * 0.8);
}