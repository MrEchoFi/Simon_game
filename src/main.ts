import { invoke } from '@tauri-apps/api/core';
import './style.css';

type Pad = 'green' | 'red' | 'yellow' | 'blue';

type HighScore = { score: number; round: number; name: string };

const pads: Pad[] = ['green', 'red', 'yellow', 'blue'];
const frequencies: Record<Pad, number> = {
  green: 329.63,
  red: 261.63,
  yellow: 196.0,
  blue: 130.81,
};

let sequence: Pad[] = [];
let playerIndex = 0;
let acceptingInput = false;
let round = 0;
let score = 0;
let lives = 3;
let strictMode = false;
let highScore: HighScore = { score: 0, round: 0, name: 'PLAYER' };
let audioCtx: AudioContext | null = null;

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <main class="cabinet">
    <header class="marquee">
      <div class="brand">SIMON</div>
      <div class="tagline">ECHO // MEMORY MACHINE</div>
      <div class="credits">FREE PLAY</div>
    </header>

    <section class="screen-shell">
      <div class="crt">
        <div class="scanlines"></div>
        <div class="screen-top">
          <div><span class="label">ROUND</span><span id="round">00</span></div>
          <div><span class="label">SCORE</span><span id="score">000000</span></div>
          <div><span class="label">HI</span><span id="hi">000000</span></div>
        </div>
        <div class="screen-center">
          <div id="message" class="pixel-title">PRESS START</div>
          <div id="submessage" class="submessage">Watch the lights. Repeat the sequence.</div>
        </div>
        <div class="screen-bottom">
          <span id="mode">NORMAL</span>
          <span id="lives">● ● ●</span>
        </div>
      </div>
    </section>

    <section class="simon-board" aria-label="Simon pads">
      ${pads.map((pad) => `<button class="pad ${pad}" data-pad="${pad}" aria-label="${pad} pad"></button>`).join('')}
      <div class="center-badge">
        <div class="simon-mini">SIMON</div>
        <button id="start" class="start-button">START</button>
        <button id="strict" class="strict-button">STRICT: OFF</button>
      </div>
    </section>

    <section class="controls">
      <button id="sound" class="control">SOUND: ON</button>
      <button id="modeButton" class="control">MODE: NORMAL</button>
      <button id="reset" class="control">RESET</button>
    </section>

    <footer>
      <span>1-4 KEYS = PADS</span>
      <span>ENTER = START</span>
      <span>ESC = RESET</span>
      <span>© RETRO ARCADE LAB</span>
    </footer>
  </main>
`;

const $ = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;
const roundEl = $('#round');
const scoreEl = $('#score');
const hiEl = $('#hi');
const messageEl = $('#message');
const submessageEl = $('#submessage');
const livesEl = $('#lives');
const modeEl = $('#mode');
const startButton = $('#start') as HTMLButtonElement;
const strictButton = $('#strict') as HTMLButtonElement;
const soundButton = $('#sound') as HTMLButtonElement;
const modeButton = $('#modeButton') as HTMLButtonElement;
const resetButton = $('#reset') as HTMLButtonElement;

const padButtons = Object.fromEntries(
  pads.map((pad) => [pad, document.querySelector<HTMLButtonElement>(`.pad.${pad}`)!]),
) as Record<Pad, HTMLButtonElement>;

let soundEnabled = true;
let gameMode: 'normal' | 'speed' = 'normal';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatScore(value: number) {
  return value.toString().padStart(6, '0');
}

function updateHud() {
  roundEl.textContent = round.toString().padStart(2, '0');
  scoreEl.textContent = formatScore(score);
  hiEl.textContent = formatScore(highScore.score);
  livesEl.textContent = '● '.repeat(lives).trimEnd() + (lives < 3 ? ' ○ '.repeat(3 - lives).trimEnd() : '');
  modeEl.textContent = strictMode ? 'STRICT' : gameMode.toUpperCase();
  strictButton.textContent = `STRICT: ${strictMode ? 'ON' : 'OFF'}`;
  modeButton.textContent = `MODE: ${gameMode.toUpperCase()}`;
}

function setMessage(main: string, sub = '') {
  messageEl.textContent = main;
  submessageEl.textContent = sub;
}

async function loadHighScore() {
  try {
    highScore = await invoke<HighScore>('get_high_score');
    updateHud();
  } catch {
    highScore = { score: 0, round: 0, name: 'PLAYER' };
  }
}

async function saveHighScore() {
  if (score <= highScore.score) return;
  highScore = { score, round, name: 'PLAYER' };
  try {
    await invoke('save_high_score', { score, round });
  } catch {
    // The game remains playable if persistence is unavailable.
  }
  updateHud();
}

function getAudio() {
  if (!soundEnabled) return null;
  audioCtx ??= new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function beep(pad: Pad, duration = 180) {
  const ctx = getAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = frequencies[pad];
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration / 1000 + 0.02);
}

async function flashPad(pad: Pad, duration = 300) {
  const button = padButtons[pad];
  button.classList.add('lit');
  beep(pad, duration * 0.7);
  await sleep(duration);
  button.classList.remove('lit');
}

function nextStep() {
  const next = pads[Math.floor(Math.random() * pads.length)];
  sequence.push(next);
}

async function playSequence() {
  acceptingInput = false;
  playerIndex = 0;
  const duration = gameMode === 'speed' ? Math.max(140, 300 - round * 8) : Math.max(180, 360 - round * 5);
  await sleep(350);
  for (const pad of sequence) {
    await flashPad(pad, duration);
    await sleep(gameMode === 'speed' ? 65 : 105);
  }
  acceptingInput = true;
  setMessage('YOUR TURN', 'Repeat the pattern.');
}

async function startGame() {
  sequence = [];
  round = 0;
  score = 0;
  lives = strictMode ? 1 : 3;
  updateHud();
  setMessage('READY?', 'Watch closely...');
  await sleep(700);
  await nextRound();
}

async function nextRound() {
  round += 1;
  nextStep();
  updateHud();
  setMessage(`ROUND ${round}`, 'Remember the sequence.');
  await playSequence();
}

async function failRound() {
  acceptingInput = false;
  lives -= 1;
  updateHud();
  for (let i = 0; i < 2; i += 1) {
    pads.forEach((pad) => padButtons[pad].classList.add('error'));
    await sleep(120);
    pads.forEach((pad) => padButtons[pad].classList.remove('error'));
    await sleep(100);
  }
  if (lives <= 0 || strictMode) {
    await gameOver();
  } else {
    setMessage('WRONG!', 'Try the same sequence again.');
    await sleep(800);
    await playSequence();
  }
}

async function handlePad(pad: Pad) {
  if (!acceptingInput) return;
  await flashPad(pad, 150);
  if (pad !== sequence[playerIndex]) {
    await failRound();
    return;
  }

  playerIndex += 1;
  score += 10 * round;
  updateHud();

  if (playerIndex === sequence.length) {
    acceptingInput = false;
    score += round * 25;
    await saveHighScore();
    setMessage('NICE!', `+${round * 25} BONUS`);
    await sleep(850);
    await nextRound();
  }
}

async function gameOver() {
  acceptingInput = false;
  await saveHighScore();
  setMessage('GAME OVER', `ROUND ${round} • SCORE ${formatScore(score)}`);
  startButton.textContent = 'PLAY AGAIN';
}

function resetGame() {
  sequence = [];
  playerIndex = 0;
  acceptingInput = false;
  round = 0;
  score = 0;
  lives = strictMode ? 1 : 3;
  startButton.textContent = 'START';
  setMessage('PRESS START', 'Watch the lights. Repeat the sequence.');
  updateHud();
}

padButtons.green.addEventListener('pointerdown', () => void handlePad('green'));
padButtons.red.addEventListener('pointerdown', () => void handlePad('red'));
padButtons.yellow.addEventListener('pointerdown', () => void handlePad('yellow'));
padButtons.blue.addEventListener('pointerdown', () => void handlePad('blue'));

startButton.addEventListener('click', () => void startGame());

strictButton.addEventListener('click', () => {
  strictMode = !strictMode;
  resetGame();
});

soundButton.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundButton.textContent = `SOUND: ${soundEnabled ? 'ON' : 'OFF'}`;
});

modeButton.addEventListener('click', () => {
  gameMode = gameMode === 'normal' ? 'speed' : 'normal';
  resetGame();
});

resetButton.addEventListener('click', resetGame);

const keyMap: Record<string, Pad | undefined> = {
  '1': 'green',
  '2': 'red',
  '3': 'yellow',
  '4': 'blue',
};

document.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  if (event.key === 'Enter') {
    event.preventDefault();
    void startGame();
    return;
  }
  if (event.key === 'Escape') {
    resetGame();
    return;
  }
  const pad = keyMap[event.key];
  if (pad) void handlePad(pad);
});

void loadHighScore();
updateHud();
