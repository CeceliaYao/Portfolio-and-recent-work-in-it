/*
 * Ribbon — Disobedient Drawing Partner
 * The brush has a mind of its own. It follows the mouse with delay and drift,
 * sometimes lagging behind, sometimes wandering off. Drawing fast makes the
 * brush wilder and thicker, drawing slow keeps it calm and thin. Old strokes
 * fade over time, so the user must keep drawing to hold the image together.
 * Right-click to clear. Press F to freeze/unfreeze the fade.
 * Qinxi Yao, n12138401
 * Developed from DXB211 Week 1 active drawing tutorial ideas.
 * All code written and adapted by Qinxi Yao.
 */

let hueValue = 0;
let strokeCount = 0;

// the brush position — it follows the mouse but with delay
let brushX = 300;
let brushY = 300;
let prevBrushX = 300;
let prevBrushY = 300;

// mood: how "disobedient" the brush is right now (0 calm to 1 wild)
let mood = 0;

// drift: the brush slowly wanders on its own
let driftAngle = 0;

// fade control
let fadeOn = true;

function setup() {
  createCanvas(600, 600);
  background(10);
  colorMode(HSB, 360, 100, 100, 100);
  brushX = width / 2;
  brushY = height / 2;
}

function draw() {
  // fade old strokes slowly so the drawing disappears over time
  if (fadeOn) {
    noStroke();
    fill(0, 0, 4, 8);
    rect(0, 0, width, height);
  }

  if (mouseIsPressed) {
    // calculate drawing speed from mouse movement
    let drawSpeed = dist(mouseX, mouseY, pmouseX, pmouseY);

    // mood rises when drawing fast, falls when drawing slow
    if (drawSpeed > 8) {
      mood += 0.03;
    } else {
      mood -= 0.01;
    }
    mood = constrain(mood, 0, 1);

    // the brush follows the mouse lazily — more lazy when mood is high
    let followStrength = map(mood, 0, 1, 0.25, 0.08);
    brushX = lerp(brushX, mouseX, followStrength);
    brushY = lerp(brushY, mouseY, followStrength);

    // drift: the brush wanders on its own when mood is high
    driftAngle += random(-0.3, 0.3);
    let driftAmount = mood * 12;
    brushX += cos(driftAngle) * driftAmount;
    brushY += sin(driftAngle) * driftAmount;

    // keep brush on canvas
    brushX = constrain(brushX, 0, width);
    brushY = constrain(brushY, 0, height);

    // number of ribbon lines changes with mood (calm = few, wild = many)
    let lineCount = int(map(mood, 0, 1, 4, 16));

    // stroke weight also changes with mood
    let weight = map(mood, 0, 1, 1.5, 4);

    // draw the ribbon from previous brush position to current
    for (let i = 0; i < lineCount; i++) {
      let offset = i * map(mood, 0, 1, 2, 5);

      // jitter increases with mood
      let jitterRange = map(mood, 0, 1, 1, 8);
      let jitterX = random(-jitterRange, jitterRange);
      let jitterY = random(-jitterRange, jitterRange);

      let startX = prevBrushX + offset + jitterX;
      let startY = prevBrushY + offset + jitterY;
      let endX = brushX + offset + jitterX;
      let endY = brushY + offset + jitterY;

      // draw the line with HSB colour and mood-based opacity
      let opacity = map(mood, 0, 1, 40, 80);
      strokeWeight(weight);
      stroke((hueValue + i * 20) % 360, 70, 100, opacity);
      line(startX, startY, endX, endY);

      strokeCount++;
    }

    hueValue += 1;
    if (hueValue > 360) {
      hueValue = 0;
    }

    prevBrushX = brushX;
    prevBrushY = brushY;
  } else {
    // when not drawing, mood slowly resets
    mood *= 0.95;

    // brush drifts back toward centre when idle
    brushX = lerp(brushX, width / 2, 0.005);
    brushY = lerp(brushY, height / 2, 0.005);
    prevBrushX = brushX;
    prevBrushY = brushY;
  }

  // display info
  noStroke();
  fill(0, 0, 100, 70);
  textSize(12);
  text("strokes: " + strokeCount, 10, 20);
  text("mood: " + nf(mood, 1, 2), 10, 36);
  text("fade: " + (fadeOn ? "on" : "off"), 10, 52);
}

// right-click to clear canvas
function mousePressed() {
  if (mouseButton === RIGHT) {
    background(10);
    strokeCount = 0;
    mood = 0;
    return false;
  }
}

// press F to toggle fade on/off
function keyPressed() {
  if (key === "f" || key === "F") {
    fadeOn = !fadeOn;
    if (!fadeOn) {
      background(10);
      console.log("Fade off — strokes persist");
    } else {
      console.log("Fade on — strokes will disappear");
    }
  }
}
