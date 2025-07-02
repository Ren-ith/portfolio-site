let stars = [];
let shootingStars = [];
let comets = [];
let CONSTELLATION_DATA = [];
let cometNoiseOffset = 0;
let sparks = [];
let panRA = 0;
let panDec = 0;
let isDragging = false;
let lastMouseX, lastMouseY;

const TOP_CONSTELLATIONS = [
  "Ori", "UMa", "UMi", "Cas", "Lyr",
  "Cyg", "Sco", "Tau", "Gem", "Leo"
];
const TRADITIONAL_CONNECTIONS = {
  Ori: [
    [57, 31], [51, 47], [47, 42], [51, 54], [42, 21], [57, 51], [31, 42],
  ],
  UMi: [
    [0,1], [1,2], [2,3], [3,4], [4,5], [5,6],
  ],
  UMa: [
    [3,4], [4,2], [2,0], [0,1], [1,5], [5,6], // Big Dipper handle and cup
  ],
  Cas: [
    [0,1], [1,2], [2,3], [3,4], // Cassiopeia W shape
  ],
  Lyr: [
    [5,2], [2,1], [1,4], [4,5], // Lyra parallelogram with Vega (index 5)
  ],
  Cyg: [
    [6,2], [2,0], [0,3], [0,4], // Cygnus cross (approximate)
  ],
  Sco: [
    [0,1], [1,2], [2,3], [3,4], [4,5], [5,6], // Scorpius tail curve
  ],
  Tau: [
    [3,4], [4,5], [5,6], [6,7], // Taurus horns
  ],
  Gem: [
    [0,1], [1,2], [2,3], [3,4], [4,5], [5,6], // Gemini twin lines
  ],
  Leo: [
    [0,1], [1,2], [2,3], [3,4], [4,5], [5,6], // Leo sickle and body
  ],
};



function preload() {
  CONSTELLATION_DATA = loadJSON('../../libs/constellations.json');
}

function setup() {
  if (!CONSTELLATION_DATA) {
    console.error("CONSTELLATION_DATA failed to load");
    return;
  }

  if (!Array.isArray(CONSTELLATION_DATA)) {
    CONSTELLATION_DATA = Object.values(CONSTELLATION_DATA);
  }

  console.log("Loaded", CONSTELLATION_DATA.length, "constellations");

  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  cnv.style('position', 'fixed');
  cnv.style('top', '0');
  cnv.style('left', '0');
  cnv.style('z-index', '-9999');
  cnv.style('pointer-events', 'none');

  colorMode(HSL, 360, 100, 100, 255);
  noFill();

  for (let i = 0; i < 300; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      alphaBase: random(150, 255),
      flickerSpeed: random(0.01, 0.05),
      flickerPhase: random(TWO_PI),
      layer: floor(random(1, 4))
    });
  }

  for (let i = 0; i < 2; i++) {
    createComet();
  }
}

function draw() {
  drawGradientBackground();
  drawAurora();
 // drawStars();
  drawConstellations();
  handleShootingStars();
  drawComets();
}

function stereographicProjection(ra, dec, centerRA, centerDec) {
  let raRad = ra * Math.PI / 12; // RA hours to radians
  let decRad = dec * Math.PI / 180;
  let centerRARad = centerRA * Math.PI / 12;
  let centerDecRad = centerDec * Math.PI / 180;

  let cosc = Math.sin(centerDecRad)*Math.sin(decRad) + Math.cos(centerDecRad)*Math.cos(decRad)*Math.cos(raRad-centerRARad);
  let k = 2 / (1 + cosc);

  let x = k * Math.cos(decRad) * Math.sin(raRad-centerRARad);
  let y = k * (Math.cos(centerDecRad)*Math.sin(decRad) - Math.sin(centerDecRad)*Math.cos(decRad)*Math.cos(raRad-centerRARad));

  return { x, y };
}

function drawConstellations() {
  if (!Array.isArray(CONSTELLATION_DATA)) {
    console.log("CONSTELLATION_DATA not an array");
    return;
  }

  let hues = [60, 120, 180, 240, 300, 360];
  let hueIndex = 0;

  for (let constellation of CONSTELLATION_DATA) {
    if (!constellation || !constellation.stars) continue;

    let isTop = TOP_CONSTELLATIONS.includes(constellation.name);
    let hue = hues[hueIndex % hues.length];
    hueIndex++;

    // Draw stars
    noStroke();
    for (let star of constellation.stars) {
      let proj = stereographicProjection(star.ra, star.dec, panRA, panDec);
 // center at RA=0h Dec=0°
      let sx = width / 2 + proj.x * width / 4;
      let sy = height / 2 - proj.y * width / 4;

      let size = map(star.mag, -1, 6, 6, 1);
      fill(hue, 80, 80);
      ellipse(sx, sy, constrain(size, 1, 6));
    }

    // Draw connections
    if (isTop) {
      let connections = TRADITIONAL_CONNECTIONS[constellation.name] || constellation.connections;

      if (connections && connections.length > 0) {
        stroke(hue, 80, 100, 150);
        strokeWeight(1);

        for (let conn of connections) {
          let index1 = conn[0];
          let index2 = conn[1];

          if (index1 >= constellation.stars.length || index2 >= constellation.stars.length) {
            console.log(`Invalid connection indices in ${constellation.name}:`, conn);
            continue;
          }

          let s1 = constellation.stars[index1];
          let s2 = constellation.stars[index2];

          if (s1 && s2) {
           let proj1 = stereographicProjection(s1.ra, s1.dec, panRA, panDec);
let proj2 = stereographicProjection(s2.ra, s2.dec, panRA, panDec);


            let x1 = width / 2 + proj1.x * width / 4;
            let y1 = height / 2 - proj1.y * width / 4;
            let x2 = width / 2 + proj2.x * width / 4;
            let y2 = height / 2 - proj2.y * width / 4;

            line(x1, y1, x2, y2);
          }
        }
      }
    }
  }
}



function drawGradientBackground() {
  let gradient = drawingContext.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgb(30,0,60)');
  gradient.addColorStop(1, 'rgb(10,0,30)');
  drawingContext.fillStyle = gradient;
  drawingContext.fillRect(0, 0, width, height);
}

function drawAurora() {
  let time = millis() / 2000;
  noStroke();
  let auroraHeight = height * 0.15;
  let bandThickness = 40;
  let pulse = map(sin(time * 0.5), -1, 1, 0.3, 1);
  let palettes = [[120, 140], [200, 260], [30, 60]];

  for (let p = 0; p < palettes.length; p++) {
    let [hueStart, hueEnd] = palettes[p];
    for (let i = 0; i < bandThickness; i++) {
      let alpha = map(i, 0, bandThickness, 60, 2) * pulse;
      let hue = lerp(hueStart, hueEnd, i / bandThickness) + sin(time + i * 0.1) * 10;
      fill(hue, 80, 60, alpha);
      beginShape();
      for (let x = 0; x <= width; x += 10) {
        let curve = pow((x - width / 2) / (width / 2), 2);
        let yOffset = sin(time + x * 0.01 + i * 0.1 + p) * 10;
        let y = curve * auroraHeight + i * (auroraHeight / bandThickness) + yOffset;
        vertex(x, y);
      }
      vertex(width, 0);
      vertex(0, 0);
      endShape(CLOSE);
    }
  }
}

function drawStars() {
  noStroke();
  for (let s of stars) {
    let flicker = sin(frameCount * s.flickerSpeed + s.flickerPhase) * 50;
    let alpha = s.alphaBase + flicker;
    fill(0, 0, 100, constrain(alpha, 100, 255));
    let parallax = 0.02 * s.layer;
    s.x += parallax;
    if (s.x > width) s.x = 0;
    ellipse(s.x, s.y, s.size);
  }
}

function handleShootingStars() {
  if (random(1) < 0.05) {
    let colors = [
      ['rgba(255,200,200,', 'rgba(255,100,100,'],
      ['rgba(200,200,255,', 'rgba(100,100,255,'],
      ['rgba(220,200,255,', 'rgba(150,120,255,']
    ];
    let chosen = random(colors);
    shootingStars.push({
      x: random(-200, width / 2),
      y: random(-200, height / 2),
      len: random(150, 300),
      speed: random(12, 20),
      alpha: 255,
      colorStart: chosen[0],
      colorEnd: chosen[1]
    });
  }

  for (let s of shootingStars) {
    let grad = drawingContext.createLinearGradient(s.x + s.len, s.y + s.len / 2, s.x, s.y);
    grad.addColorStop(0, s.colorStart + (s.alpha / 255) + ')');
    grad.addColorStop(1, s.colorEnd + '0)');
    drawingContext.strokeStyle = grad;
    drawingContext.lineWidth = 2;
    drawingContext.beginPath();
    drawingContext.moveTo(s.x, s.y);
    drawingContext.lineTo(s.x + s.len, s.y + s.len / 2);
    drawingContext.stroke();
    s.x += s.speed;
    s.y += s.speed * 0.5;
    s.alpha -= 5;
    if (s.alpha <= 0) shootingStars.splice(shootingStars.indexOf(s), 1);
  }
}

function drawComets() {
  for (let c of comets) {
    c.tail.push({ x: c.x, y: c.y, alpha: c.alpha });
    if (c.tail.length > 100) c.tail.shift();

    for (let i = 0; i < c.tail.length; i++) {
      let t = c.tail[i];
      let flickerX = t.x + random(-1, 1);
      let flickerY = t.y + random(-1, 1);
      let hue = map(i, 0, c.tail.length, 20, 50);
      let alpha = t.alpha * (i / c.tail.length);
      stroke(hue, 80, map(i, 0, c.tail.length, 50, 70), alpha);
      strokeWeight(map(i, 0, c.tail.length, 3, 1));
      point(flickerX, flickerY);

      if (random(1) < 0.03) {
        sparks.push({
          x: flickerX, y: flickerY,
          vx: random(-0.3, 0.3), vy: random(-0.5, 0.5),
          alpha: 150
        });
      }
    }

    drawCometGlow(c.x, c.y, c.alpha);

    cometNoiseOffset += 0.01;
    c.x += c.speed * 0.5 + (noise(c.x * 0.001, cometNoiseOffset) - 0.5) * 2;
    c.y += c.speed * 0.2;
    c.alpha -= 0.2;
    if (c.alpha <= 0) { createComet(); comets.splice(comets.indexOf(c), 1); }
  }

  drawSparks();
}

function drawCometGlow(x, y, alpha) {
  noStroke();
  for (let i = 4; i >= 1; i--) {
    fill(50, 80, 100, (alpha / (i * 2)));
    ellipse(x, y, i * 3);
  }
  fill(50, 80, 100, alpha);
  ellipse(x, y, 3);
}

function drawSparks() {
  for (let s of sparks) {
    fill(40, 80, 80, s.alpha);
    noStroke();
    ellipse(s.x, s.y, 2);
    s.x += s.vx;
    s.y += s.vy;
    s.alpha -= 2;
  }
  sparks = sparks.filter(s => s.alpha > 0);
}

function createComet() {
  comets.push({
    x: random(width),
    y: random(height / 3),
    len: random(80, 150),
    speed: random(1, 3),
    alpha: 255,
    tail: []
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  isDragging = true;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function mouseReleased() {
  isDragging = false;
}

function mouseDragged() {
  if (isDragging) {
    let dx = mouseX - lastMouseX;
    let dy = mouseY - lastMouseY;

    // Adjust RA with wrap-around
    panRA = (panRA - dx * 0.02) % 24; // RA wraps around 24h

    // Adjust Dec with smoother scaling
    panDec += dy * 0.05;

    // Clamp Dec to -89 to +89 to avoid projection flipping
    panDec = constrain(panDec, -89, 89);

    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}
