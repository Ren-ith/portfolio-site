let branches = [];

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  cnv.style('z-index', '-1');

  strokeJoin(ROUND);
  noFill();

  let numBranches = 20; // reduced from 50 for less crowding

  for (let i = 0; i < numBranches; i++) {
    let side = random();

    let x, maxLen;
   if (side < 0.45) {
  x = random(width * 0.05, width * 0.25); // left side
  maxLen = random(height / 1.5, height); // taller plants
} else if (side > 0.55) {
  x = random(width * 0.75, width * 0.95); // right side
  maxLen = random(height / 1.5, height); // taller plants
} else {
  x = random(width * 0.4, width * 0.6); // center, short plants
  maxLen = random(100, 150); // slightly taller center
}
    let y = random(height * 0.8, height * 0.95);
    let angle = random(-PI / 4, -3 * PI / 4);

    branches.push(new Branch(x, y, angle, 0, false, null, maxLen));
  }
}

function draw() {
  background(255, 5);

  for (let b of branches) {
    b.grow();
    b.display();
  }
}

class Branch {
  constructor(x, y, angle, depth, isLeaf, attachedTo = null, forcedMaxLength = null) {
    this.points = [createVector(x, y)];
    this.angle = angle;
    this.depth = depth;
    this.length = 0;
    this.maxLength = forcedMaxLength || (isLeaf ? random(50, 100) : random(height / 4, height / 1.5));
    this.speed = isLeaf ? 2 : random(2, 3);
    this.doneGrowing = false;
    this.isLeaf = isLeaf;
    this.attachedTo = attachedTo;

    if (isLeaf) {
      this.currentLength = 0;
    }

    this.angleNoiseOffset = random(1000);
    this.curveStrength = isLeaf ? 0 : random(0.001, 0.01);

    this.color1 = color(100, 150, 100);
    this.color2 = color(150, 200, 150);

    this.spawnedLeavesAt = []; // track leaf spawn locations
  }

  grow() {
    if (!this.doneGrowing) {
      if (!this.isLeaf) {
        let angleVariation = (noise(this.angleNoiseOffset + this.length * 0.02) - 0.5) * this.curveStrength * PI;
        this.angle += angleVariation;

        let last = this.points[this.points.length - 1];
        let newX = last.x + this.speed * cos(this.angle);
        let newY = last.y + this.speed * sin(this.angle);

        // Ensure upward growth
        if (newY > last.y) {
          newY = last.y - this.speed * abs(sin(this.angle));
        }

        let newPoint = createVector(newX, newY);
        this.points.push(newPoint);
        this.length += this.speed;

        // Spawn leaves every ~50px along stem, only if not already spawned there
        if (this.length % 50 < this.speed && !this.spawnedLeavesAt.includes(this.length)) {
          this.spawnedLeavesAt.push(this.length);

          let base = this.points[this.points.length - 1];

          // Create leaves on both sides, angled outward horizontally
          for (let dir of [-1, 1]) {
            let leafAngle = dir * PI / 4; // 45 degrees left or right

            // Offset position slightly to each side
            let offsetDist = 5;
            let offsetX = base.x + dir * offsetDist * cos(this.angle + PI / 2);
            let offsetY = base.y + dir * offsetDist * sin(this.angle + PI / 2);

            branches.push(new Branch(offsetX, offsetY, leafAngle, this.depth + 1, true, createVector(offsetX, offsetY)));
          }
        }

        if (this.length >= this.maxLength) {
          this.doneGrowing = true;
        }
      } else {
        this.currentLength += this.speed;
        if (this.currentLength >= this.maxLength) {
          this.currentLength = this.maxLength;
          this.doneGrowing = true;
        }
      }
    }
  }

  display() {
    let gradColor = lerpColor(this.color1, this.color2, this.depth / 3);

    if (!this.isLeaf) {
      // Glow
      stroke(red(gradColor), green(gradColor), blue(gradColor), 50);
      strokeWeight(6);
      noFill();
      beginShape();
      for (let p of this.points) {
        curveVertex(p.x, p.y);
      }
      endShape();

      // Stem
      stroke(gradColor);
      strokeWeight(1.5);
      noFill();
      beginShape();
      for (let p of this.points) {
        curveVertex(p.x, p.y);
      }
      endShape();
    } else {
      let base = this.attachedTo || this.points[0];
      push();
      translate(base.x, base.y);
      rotate(this.angle);
      fill(gradColor);
      noStroke();

      let l = this.currentLength;

      beginShape();
      vertex(0, 0);
      bezierVertex(10 * (l / this.maxLength), -0.5 * l, 20 * (l / this.maxLength), -0.5 * l, 20 * (l / this.maxLength), -l);
      bezierVertex(10 * (l / this.maxLength), -0.9 * l, 0, -0.7 * l, 0, 0);
      endShape(CLOSE);

      pop();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
