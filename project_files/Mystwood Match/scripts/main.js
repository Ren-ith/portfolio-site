// Setup
let level = 1;
let totalCards = 4;
let matchedPairs = 0;
let boardLocked = false;
let actualImages = [];
let matchedCards = [];
let confettiCanvas, confettiCtx, confettiParticles = [], confettiInterval;
let timerInterval, timeLeft;
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let trailParticles = [];
let totalMatchedAllLevels = 0;



window.addEventListener('mousemove', e => {
  cursorX = e.clientX;
  cursorY = e.clientY;
  addTrailParticle(cursorX + 15, cursorY + 20);

});

window.addEventListener('touchmove', e => {
  if (e.touches.length > 0) {
    cursorX = e.touches[0].clientX;
    cursorY = e.touches[0].clientY;
    addTrailParticle(cursorX +15, cursorY + 20);

  }
});
const availableImages = [
  "images/cat.webp", "images/wolf.webp", "images/dog.webp",
  "images/fox.webp", "images/tiger.webp", "images/bear.webp",
  "images/horse.webp", "images/owl.webp", "images/rabbit.webp", 
  "images/snake.webp", "images/ferret.webp","images/hedgehog.webp",
];

//mouse move fix
let potentialFlipTarget = null;

function attachCardListeners(card, index) {
  card.addEventListener("pointerdown", () => {
    potentialFlipTarget = card;
  });

  card.addEventListener("pointerup", () => {
    if (potentialFlipTarget === card) {
      flipImage(index);
    }
    potentialFlipTarget = null;
  });

  card.addEventListener("pointerleave", () => {
    potentialFlipTarget = null;
  });
}


// Game Functions
function createRandomImageArray() {
  actualImages = [];
  const neededPairs = totalCards / 2;

  let shuffledAvailable = [...availableImages];
  shuffle(shuffledAvailable);

  let selectedImages = shuffledAvailable.slice(0, neededPairs);

  for (let img of selectedImages) {
    actualImages.push(img, img);
  }

  shuffle(actualImages);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function setupBoard() {
  boardLocked = true;

  clearInterval(timerInterval);
  removeTimer();

  const gameBoard = document.getElementById("gameBoard");
  gameBoard.innerHTML = "";

  createRandomImageArray();

  for (let i = 0; i < totalCards; i++) {
    const card = document.createElement("div");
    card.className = "card";
    attachCardListeners(card, i);

    card.innerHTML = `
      <div class="card-inner hidden slide-in delay-${i}">
        <div class="card-front">
          <img src="images/back.jpg" draggable="false">
        </div>
        <div class="card-back">
          <img id="image${i + 1}-back">
        </div>
      </div>
    `;

    gameBoard.appendChild(card);
  }

  printBlanks();

  const maxDelay = 0.5; 
  const animationDuration = 0.3; 
  const totalAnimationTime = (maxDelay + animationDuration) * 1000;

  setTimeout(() => {
    document.querySelectorAll('.card-inner').forEach(inner => {
      inner.classList.remove('hidden');
      inner.classList.remove('slide-in');
      for (let j = 0; j < 18; j++) {
        inner.classList.remove(`delay-${j}`);
      }
    });
    boardLocked = false;
    startTimer();
    showStartMessage();
  }, totalAnimationTime);
}

function printBlanks() {
  for (let i = 0; i < totalCards; i++) {
    document.getElementById(`image${i + 1}-back`).src = actualImages[i];
  }
}
function flipImage(index) {
  if (boardLocked) return;

  const card = document.getElementsByClassName('card')[index];
  if (card.classList.contains('flipped')) return;

  card.classList.add('flipped');
  matchedCards.push(index);

  
  setTimeout(() => {
    const flipSound = document.getElementById("flipSound");
    if (flipSound) {
      flipSound.volume = 0.05;
      flipSound.currentTime = 0;
      flipSound.play().catch(() => {});
    }
  }, 150); 

  if (matchedCards.length === 2) {
    boardLocked = true;
    setTimeout(checkMatch, 500);
  }
}

//Match
function checkMatch() {
  const firstIndex = matchedCards[0];
  const secondIndex = matchedCards[1];

  const firstImage = document.getElementById(`image${firstIndex + 1}-back`).src.split('/').pop();
  const secondImage = document.getElementById(`image${secondIndex + 1}-back`).src.split('/').pop();

  const cards = document.getElementsByClassName('card');

  if (firstImage === secondImage) {
    matchedPairs++;
    totalMatchedAllLevels++;
    cards[firstIndex].classList.add('matched');
    cards[secondIndex].classList.add('matched');

    matchedCards = [];
    boardLocked = false;

  } else {
    boardLocked = true;

    setTimeout(() => {
      cards[firstIndex].classList.remove('flipped');
      cards[secondIndex].classList.remove('flipped');

      matchedCards = [];
      boardLocked = false;
    }, 100);
  }

  if (matchedPairs === totalCards / 2) {
    setTimeout(showVictoryAnimation, 500);
  }
}

function showVictoryAnimation() {
  clearInterval(timerInterval);
  removeTimer();
  startConfetti();

  const victory = document.createElement("div");
  victory.id = "victoryMessage";
  victory.innerHTML = ` Level ${level} Complete! `;
  document.body.appendChild(victory);

  setTimeout(() => {
    document.body.removeChild(victory);
    stopConfetti();
    nextLevel();
  }, 3000);
}
//win
function showGameWinScreen() {
  clearInterval(timerInterval);
  removeTimer();
  stopConfetti();

  document.getElementById('header').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'none';

  const winStats = document.getElementById("winStats");
  if (winStats) {
    winStats.textContent = `You won with ${timeLeft} seconds to spare...`;
  }

  const winScreen = document.getElementById("winScreen");
  winScreen.style.display = 'flex'; 
  winScreen.classList.add("visible");

  const playAgainBtn = document.getElementById("playAgainWin");
  playAgainBtn.onclick = restartGame;
}


function nextLevel() {
  level++;
  if (level > 8) {
    showGameWinScreen();
    return;
  }
  totalCards += 2;
  matchedPairs = 0;
  matchedCards = [];
  setupBoard();
}
//reset button
function restartGame() {
  let oldVictory = document.getElementById("victoryMessage");
  if (oldVictory) oldVictory.remove();

  stopConfetti();
  clearInterval(timerInterval);
  removeTimer();
  
  const resetButton = document.getElementById("resetButton");
  if (resetButton) {
    resetButton.innerText = "Reset Game";
    resetButton.classList.remove("pulsing");
    resetButton.onclick = restartGame;
  }

  
  document.getElementById("header").style.display = "none";
  document.getElementById("gameContainer").style.display = "none";

  
  const startScreen = document.getElementById("startScreen");
  startScreen.style.display = "flex";
  startScreen.style.opacity = "1";

  // Reset variables
  level = 1;
  totalCards = 4;
  matchedPairs = 0;
  matchedCards = [];
  totalMatchedAllLevels = 0;
  timeLeft = 0;
  document.getElementById("winScreen").classList.remove("visible");
  document.getElementById("loseScreen").classList.remove("visible");
  document.getElementById("winScreen").style.display = "none";
  document.getElementById("loseScreen").style.display = "none";
  boardLocked = false;
  
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);

  timeLeft = level <= 3 ? 60 : level <= 6 ? 45 : 40;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleGameOver();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timer = document.getElementById("timer");
  if (timer) {
    timer.innerHTML = `Time Left: ${timeLeft}s`;
  }
}

function removeTimer() {
  const timer = document.getElementById("timer");
  if (timer) {
    timer.innerHTML = "Time Left: --"; 
  }
}
//lose
function handleGameOver() {
  clearInterval(timerInterval);
  removeTimer();

  let oldVictory = document.getElementById("victoryMessage");
  if (oldVictory) oldVictory.remove();

  const resetButton = document.getElementById("resetButton");
  if (resetButton) {
    resetButton.innerText = "Try Again";
    resetButton.onclick = restartGame;
    resetButton.classList.add("pulsing");
  }

  // Hide game UI
  document.getElementById("header").style.display = "none";
  document.getElementById("gameContainer").style.display = "none";

const loseStats = document.getElementById("loseStats");
if (loseStats) {
  const totalPairs = totalCards / 2;
  loseStats.textContent = `You reached Level ${level} of 8 and matched ${totalMatchedAllLevels} pairs in total.`;}


  const loseScreen = document.getElementById("loseScreen");
  loseScreen.style.display = 'flex'; 
  loseScreen.classList.add("visible");
  
  const tryAgainBtn = document.getElementById("tryAgainButton");
  tryAgainBtn.onclick = restartGame;

  boardLocked = true;
}


function startConfetti() {
  if (document.getElementById("confettiCanvas")) return;

  confettiCanvas = document.createElement("canvas");
  confettiCanvas.id = "confettiCanvas";
  confettiCanvas.style.position = "fixed";
  confettiCanvas.style.top = "0";
  confettiCanvas.style.left = "0";
  confettiCanvas.style.width = "100%";
  confettiCanvas.style.height = "100%";
  confettiCanvas.style.pointerEvents = "none";
  confettiCanvas.style.zIndex = "1600";
  document.body.appendChild(confettiCanvas);

  confettiCtx = confettiCanvas.getContext("2d");
  confettiParticles = [];

  const mysticColors = ['#bfaaff', '#99ccff', '#cc99ff', '#ffeecc'];

  for (let i = 0; i < 3000; i++) {
    confettiParticles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1 + 0.5,
      d: Math.random() * 1.5 + 0.3,
      color: mysticColors[Math.floor(Math.random() * mysticColors.length)],
      tilt: Math.random() * 4 - 2,
      life: Math.random() * Math.PI * 2
    });
  }

  confettiInterval = setInterval(drawConfetti, 20);
}

function drawConfetti() {
  confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  const mysticColors = ['#bfaaff', '#99ccff', '#cc99ff', '#ffeecc'];


  // 🌌 Draw falling spiral sparkles
  for (let p of confettiParticles) {
    // Animate scale & fade
    p.life += 0.03;
    if (p.life > Math.PI * 2) p.life -= Math.PI * 2;

    const scale = 0.75 + Math.abs(Math.sin(p.life)) * 0.75;
    const alpha = 0.2 + Math.abs(Math.sin(p.life)) * 0.8;

    // Magnetic pull to cursor
    const dx = cursorX - p.x;
    const dy = cursorY - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150) {
      const pull = (150 - dist) / 150 * 0.05;
      p.x += dx * pull;
      p.y += dy * pull;
    }

    // Spiral float motion
    const spiralX = Math.cos(p.life) * 0.5;
    const spiralY = Math.sin(p.life) * 0.5;
    p.y += p.d + spiralY;
    p.x += spiralX + Math.sin(p.tilt) * 0.3;
    p.tilt += Math.random() * 0.2 - 0.1;

    // Recycle at top if off-screen
    if (p.y > window.innerHeight) {
      p.y = -10;
      p.x = Math.random() * window.innerWidth;
      p.color = mysticColors[Math.floor(Math.random() * mysticColors.length)];
    }

    // Draw sparkle
    confettiCtx.beginPath();
    confettiCtx.globalAlpha = alpha;
    confettiCtx.arc(p.x, p.y, p.r * scale, 0, Math.PI * 2);
    confettiCtx.fillStyle = p.color;
    confettiCtx.shadowColor = p.color;
    confettiCtx.shadowBlur = 10;
    confettiCtx.fill();
    confettiCtx.globalAlpha = 1;
  }
}

function stopConfetti() {
  clearInterval(confettiInterval);

  if (confettiCanvas && confettiCanvas.parentNode === document.body) {
    document.body.removeChild(confettiCanvas);
    confettiCanvas = null;
  }
}
//autowin
function cheatWin() {
  clearInterval(timerInterval);
  removeTimer();

  level = 8;
  totalCards = 18;
  matchedPairs = totalCards / 2;

  showVictoryAnimation();
}
function showStartMessage() {
  const placeholder = document.getElementById("startMessagePlaceholder");

  if (!placeholder) return;

  placeholder.innerHTML = ""; 

  const startMessage = document.createElement("div");
  startMessage.id = "startMessage";
  startMessage.innerText = "GO!";
  startMessage.classList.add("start-message");

  placeholder.appendChild(startMessage);

  setTimeout(() => {
    startMessage.classList.add("visible");
  }, 100);

  setTimeout(() => {
    startMessage.classList.remove("visible");
    setTimeout(() => {
      if (startMessage.parentNode) {
        startMessage.parentNode.removeChild(startMessage);
      }
    }, 500);
  }, 1500);
}

window.addEventListener('DOMContentLoaded', () => {
  const startScreen = document.getElementById('startScreen');
  const startButton = document.getElementById('startButton');
  const audio = document.getElementById('ambientAudio');

  startButton.addEventListener('click', () => {
    // Fade out and hide start screen
    startScreen.style.opacity = '0';
    setTimeout(() => {
      startScreen.style.display = 'none';

      // SHOW the game UI
      document.getElementById('header').style.display = 'block';
      document.getElementById('gameContainer').style.display = 'flex';

      setupBoard();
    }, 600);

    // Start ambient audio
    audio.play().catch(() => {
      console.warn("User interaction required to play audio");
    });
  });
});


const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('load', resizeCanvas);      
window.addEventListener('resize', resizeCanvas);    
resizeCanvas();

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * 2 + 1;
    this.alpha = Math.random() * 0.5 + 0.3;
    this.speedY = Math.random() * 0.3 + 0.1;
  }
  update() {
    this.y -= this.speedY;
    if (this.y < 0) this.reset();
  }
  draw() {
    ctx.beginPath();
    const glow = 0.5 + Math.sin(Date.now() * 0.001 + this.x) * 0.3;
ctx.fillStyle = `rgba(255, 255, 200, ${this.alpha * glow})`;

    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

for (let i = 0; i < 100; i++) {
  particles.push(new Particle());
}


animateMagic(); 


//cursor stuff
function addTrailParticle(x, y) {
  const mysticColors = ['#bfaaff', '#99ccff', '#cc99ff', '#ffeecc'];
  trailParticles.push({
    x,
    y,
    r: Math.random() * 2 + 1,
    alpha: 1,
    color: mysticColors[Math.floor(Math.random() * mysticColors.length)],
  });

  // Limit trail length
  if (trailParticles.length > 150) {
    trailParticles.shift();
  }
}

function animateMagic() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🌌 Draw background sparkles
  particles.forEach(p => {
    p.update();
    p.draw();
  });

  // 🌠 Draw cursor trail
  for (let i = 0; i < trailParticles.length; i++) {
    const t = trailParticles[i];
    t.alpha -= 0.02;
    if (t.alpha <= 0) {
      trailParticles.splice(i, 1);
      i--;
      continue;
    }

    ctx.beginPath();
    ctx.globalAlpha = t.alpha;
    ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
    ctx.fillStyle = t.color;
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  requestAnimationFrame(animateMagic);
}
