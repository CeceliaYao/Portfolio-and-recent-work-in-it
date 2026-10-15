/*
 * Snake
 * A snake composed of letters searches and devours the scattered letters on
 * the canvas one by one in alphabetical order, eventually forming complete words.
 * Letters appear one by one over time using millis(). The snake speed shifts
 * based on the current second, and the time is shown in the corner using nf().
 * Qinxi Yao, n12138401
 * Code adapted from: https://editor.p5js.org/creativecoding/sketches/m1PcSxkOe
 * - Based on this sketch with custom font loading, I have expanded the
 * functionality of the snake game
 * Reference motion mode from: https://editor.p5js.org/creativecoding/sketches/95eKaHbOE
 */

let word = "iamasnake";
let snakeX = [];
let snakeY = [];
let snakeChars = [];
let foodX = [];
let foodY = [];
let foodChars = [];
let foodIndex = 1; // current food index
let targetX = 0;
let targetY = 0;
let baseSpeed = 3;
let font;
let generateTime = 0;

function preload() {
  font = loadFont("Gaegu-Bold.ttf");
}

function setup() {
  createCanvas(700, 500);
  textAlign(CENTER, CENTER);
  textSize(50);
  textFont(font);

  // start with first letter already placed
  foodChars.push(word[0]);
  foodX.push(random(50, width - 50));
  foodY.push(random(60, height - 40));

  // snake starts from first letter
  snakeChars.push(foodChars[0]);
  snakeX.push(width / 2);
  snakeY.push(height / 2);
}

// generate food letters one by one over time
function generateFood() {
  if (foodX.length < word.length) {
    foodChars.push(word[foodX.length]);
    foodX.push(random(50, width - 50));
    foodY.push(random(60, height - 40));
  }
}

function draw() {
  background(230, 240, 255);

  // generate a new letter every 200ms
  if (millis() - generateTime > 200) {
    generateTime = millis();
    generateFood();
  }

  // speed changes with the current second — faster at some moments, slower at others
  let currentSecond = second();
  let moveSpeed = baseSpeed + sin(currentSecond * 0.1) * 2;

  // gentle pulse on text size using millis
  let pulse = sin(millis() * 0.003) * 3;

  // show current time in top-left using nf() to pad with zeros
  fill(150, 160, 180);
  textSize(14);
  textAlign(LEFT, TOP);
  let timeText = nf(hour(), 2) + ":" + nf(minute(), 2) + ":" + nf(second(), 2);
  text(timeText, 10, 10);

  // reset text alignment for letters
  textAlign(CENTER, CENTER);

  // draw food letters
  fill(0);
  textSize(48 + pulse);
  for (let i = foodIndex; i < foodChars.length; i++) {
    text(foodChars[i], foodX[i], foodY[i]);
  }

  if (foodIndex < foodChars.length) {
    targetX = foodX[foodIndex];
    targetY = foodY[foodIndex];
  } else {
    // random walk after all letters are eaten
    if (random(100) < 2) {
      targetX = random(50, width - 50);
      targetY = random(50, height - 50);
    }
  }

  // move towards target letter
  let dx = targetX - snakeX[0];
  let dy = targetY - snakeY[0];
  let len = sqrt(dx * dx + dy * dy);

  if (len > 0.5) {
    dx /= len;
    dy /= len;
    snakeX[0] += dx * moveSpeed;
    snakeY[0] += dy * moveSpeed;
  }

  let d = dist(snakeX[0], snakeY[0], targetX, targetY);

  // eat food
  if (d < 20) {
    if (foodIndex < foodChars.length) {
      snakeChars.push(foodChars[foodIndex]);
      snakeX.push(targetX);
      snakeY.push(targetY);
      foodIndex++;
    } else {
      targetX = random(50, width - 50);
      targetY = random(50, height - 50);
    }
  }

  // body follow
  for (let i = snakeX.length - 1; i > 0; i--) {
    snakeX[i] = lerp(snakeX[i], snakeX[i - 1], 0.1);
    snakeY[i] = lerp(snakeY[i], snakeY[i - 1], 0.1);
  }

  // draw snake letters with colour that shifts over time
  textSize(50 + pulse);
  for (let i = 0; i < snakeChars.length; i++) {
    fill(50 + i * 5, 100 + i * 8, 200);
    text(snakeChars[i], snakeX[i], snakeY[i]);
  }
}
