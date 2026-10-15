/*
 * Painting
 * Multiple "paintbrushes" moving randomly on the canvas continuously
 * sample colors from the image for filling. This random walk simulates
 * the artist's repeated experimentation and application on the canvas,
 * giving the generation process a slow and gradual character. Elliptical
 * brushstrokes are used to replace real brushes, creating a texture similar
 *  to the buildup of paint, and by gradually reducing the size of the
 * brushstrokes, the process from the overall composition to the details
 * of the painting is simulated, gradually clarifying the image.
 * Press P to pause/resume. Press R to reset. UP/DOWN to change brush size.
 * Click on the left canvas to move all brushes to that spot.
 * Qinxi Yao, n12138401
 * Code adapted from: https://archive.p5js.org/examples/image-pointillism.html
 * - I used the pointillism example as the basis for developing
 *   Added automatic pathing and automatic resizing
 */

let img;
let ellipseSize = 30;

let brushX = [];
let brushY = [];

let brushCount = 20; // brush count
let pixelColor;
let paused = false;

function preload() {
  img = loadImage("source.jpg");
}

function setup() {
  createCanvas(1000, 500);
  background(255);
  noStroke();

  resetBrushes();
  console.log("Brush positions initialised");
  console.log(brushX);
}

// place all brushes at random positions
function resetBrushes() {
  for (let i = 0; i < brushCount; i++) {
    brushX[i] = random(img.width);
    brushY[i] = random(img.height);
  }
}

function draw() {
  for (let k = 0; k < 12; k++) {
    for (let i = 0; i < brushCount; i++) {
      // move brush randomly
      brushX[i] += random(-5, 5);
      brushY[i] += random(-5, 5);

      // keep inside image bounds
      if (brushX[i] < 0) {
        brushX[i] = 0;
      }
      if (brushX[i] > img.width - 1) {
        brushX[i] = img.width - 1;
      }
      if (brushY[i] < 0) {
        brushY[i] = 0;
      }
      if (brushY[i] > img.height - 1) {
        brushY[i] = img.height - 1;
      }

      // sample colour from the source image
      pixelColor = img.get(int(brushX[i]), int(brushY[i]));

      // add transparency to fill
      fill(red(pixelColor), green(pixelColor), blue(pixelColor), 180);
      ellipse(brushX[i], brushY[i], ellipseSize, ellipseSize);
    }
  }

  // ellipse size changes slowly
  if (random(100) < 4) {
    ellipseSize -= 1;
    if (ellipseSize < 5) ellipseSize = 5;
  }

  // show original image on the right with a slight transparency
  tint(255, 220);
  image(img, 500, 0);
  noTint();
}

function keyPressed() {
  // R to reset
  if (key == "r" || key == "R") {
    background(255);
    ellipseSize = 30;
    resetBrushes();
    console.log("Canvas reset, brush size: " + ellipseSize);
  }

  // P to pause or resume
  if (key == "p" || key == "P") {
    if (paused) {
      loop();
      paused = false;
      console.log("Resumed");
    } else {
      noLoop();
      paused = true;
      console.log("Paused");
    }
  }

  // UP arrow to increase brush size
  if (keyCode === UP_ARROW) {
    ellipseSize += 3;
    if (ellipseSize > 50) {
      ellipseSize = 50;
    }
    console.log("Brush size: " + ellipseSize);
  }

  // DOWN arrow to decrease brush size
  if (keyCode === DOWN_ARROW) {
    ellipseSize -= 3;
    if (ellipseSize < 2) {
      ellipseSize = 2;
    }
    console.log("Brush size: " + ellipseSize);
  }
}

// click to gather brushes at mouse position
function mousePressed() {
  if (mouseX < 500) {
    for (let i = 0; i < brushCount; i++) {
      brushX[i] = mouseX;
      brushY[i] = mouseY;
    }
    console.log("Brushes moved to " + mouseX + ", " + mouseY);
  }
}
