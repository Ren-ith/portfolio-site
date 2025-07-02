let progress = 0;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  cnv.style('position', 'fixed');
  cnv.style('top', '0');
  cnv.style('left', '0');
  cnv.style('z-index', '-9999');
  cnv.style('pointer-events', 'none');

  noFill();
  strokeJoin(ROUND);
}

function draw() {
  background(255, 5);

  progress = min(progress + 0.03, 1);


  let amp = 10;
  let freq = 30;

  strokeWeight(2);
  stroke(150, 120, 200, 150); // purple braid

  let topLength = width;
  let sideLength = height - 150;

  // Top border: grow from center outward
  drawGrowingBraid(width / 2, 150, width / 2 + topLength / 2 * progress, 150, amp, freq, true);
  drawGrowingBraid(width / 2, 150, width / 2 - topLength / 2 * progress, 150, amp, freq, true);

  // Bottom border: grow from center outward
  drawGrowingBraid(width / 2, height, width / 2 + topLength / 2 * progress, height, amp, freq, true);
  drawGrowingBraid(width / 2, height, width / 2 - topLength / 2 * progress, height, amp, freq, true);

  // Left border: grow from center upward and downward
  drawGrowingBraid(0, 150 + sideLength / 2, 0, 150 + sideLength / 2 - sideLength / 2 * progress, amp, freq, false);
  drawGrowingBraid(0, 150 + sideLength / 2, 0, 150 + sideLength / 2 + sideLength / 2 * progress, amp, freq, false);

  // Right border: grow from center upward and downward
  drawGrowingBraid(width, 150 + sideLength / 2, width, 150 + sideLength / 2 - sideLength / 2 * progress, amp, freq, false);
  drawGrowingBraid(width, 150 + sideLength / 2, width, 150 + sideLength / 2 + sideLength / 2 * progress, amp, freq, false);

  // Draw corner rosettes
  drawRosette(0, 150);
  drawRosette(width, 150);
  drawRosette(0, height);
  drawRosette(width, height);
}

function drawGrowingBraid(x1, y1, x2, y2, amplitude, wavelength, horizontal) {
  let steps = horizontal ? abs(x2 - x1) : abs(y2 - y1);
  let dir = (horizontal && x2 < x1) || (!horizontal && y2 < y1) ? -1 : 1;

  let time = millis() / 2000;
  let resolution = 2;

  beginShape();
  for (let i = 0; i <= steps; i += resolution) {
    let offset = sin(i / wavelength * TWO_PI + time) * amplitude;
    let x = horizontal ? x1 + i * dir : x1 + offset;
    let y = horizontal ? y1 + offset : y1 + i * dir;
    curveVertex(x, y);
  }
  endShape();

  beginShape();
  for (let i = 0; i <= steps; i += resolution) {
    let offset = -sin(i / wavelength * TWO_PI + time + PI / 2) * amplitude;
    let x = horizontal ? x1 + i * dir : x1 + offset;
    let y = horizontal ? y1 + offset : y1 + i * dir;
    curveVertex(x, y);
  }
  endShape();
}

function drawRosette(cx, cy) {
  push();
  translate(cx, cy);
  let petals = 12;
  let radius = 20;
  let time = millis() / 1000;
  stroke(150, 120, 200);
  fill(200, 180, 230, 150);
  beginShape();
  for (let i = 0; i < TWO_PI; i += TWO_PI / petals) {
    let r = radius + sin(time + i * 3) * 3;
    let x = cos(i) * r;
    let y = sin(i) * r;
    vertex(x, y);
  }
  endShape(CLOSE);

  // center dot
  fill(150, 120, 200);
  ellipse(0, 0, 5, 5);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
