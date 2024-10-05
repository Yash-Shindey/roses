let a = 0;
let loveColors = ["#A61458", "#C92B68", "#F74F70", "#FF939B"];
let harmonyColors = ["#14472C", "#185027", "#3A724A", "#77AA84"];
let peaceColors = ["#2C774E", "#2C8646", "#789C84"];
let myChannel, myFFT;
let spectrum_min = 50;
let spectrum_max = 200;
let theta;
let thetacum = 0;
let speedSlider;  // Speed slider

function preload() {
    myChannel = loadSound("./assets/sample.mp3");
}

function setup() {
    let canvas = createCanvas(600, 600, WEBGL);  // Match the container's size
    canvas.parent('visualizer-container');       // Attach the canvas to the container
    myFFT = new p5.FFT();
    myChannel.loop();
    myChannel.amp(0.5);
    background(255);

    // Create a speed slider to control the fast-forward effect
    speedSlider = select('#speed-slider');  // Link to the correct bottom slider via ID
}

function draw() {
    strokeWeight(4);

    // Analyze audio spectrum
    spectrum = myFFT.analyze();
    theta =
        (spectrum[20] +
            spectrum[60] +
            spectrum[100] +
            spectrum[140] +
            spectrum[180] +
            spectrum[220]) /
        (256 * 10);  // Sharpness remains fixed at maximum

    // Get the speed factor from the slider to speed up the rose formation
    let speedFactor = speedSlider.value();  // Fast-forward control

    // Apply speed factor to control the pace of the rose's movement
    thetacum += theta * speedFactor;  

    // Map the constrained theta value to color the strokes dynamically
    constrainedTheta = constrain(theta, 0.3, 0.4);
    mappedTheta = map(constrainedTheta, 0, 0.4, 0, 3.93);
    strokeColor = loveColors[int(mappedTheta)];

    // Set stroke color for the rose
    stroke(color(strokeColor));
    
    // Rotate the rose based on theta calculations
    rotateY(cos(thetacum / 40));
    rotateZ(sin(thetacum / 40));
    fill(220, 150);

    // Draw the box and adjust size
    box(300 - a * 10);

    // Increment 'a' to reduce the size of the box over time, affected by the speed factor
    a += 0.005 * speedFactor;  

    // Condition to stop the song and visualizer when the square is gone
    if (a >= 30) {
        myChannel.stop();  // Stop the song
        noLoop();  // Stop the draw loop
    }
}