const sequence = document.querySelector('.bolo-sequencia');
const stage = sequence.querySelector('.bolo-palco');
const controls = stage.querySelector('.bolo-controles');
const button = controls.querySelector('button');
const chapter = controls.querySelector('.bolo-etapa');
const canvas = stage.querySelector('canvas');
const brush = canvas.getContext('2d');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const angles = new Image();
const photo = document.createElement('canvas');
const photoBrush = photo.getContext('2d');
const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => value * value * (3 - 2 * value);
const cakeShape = new Path2D('M .105 .411 Q .108 .31 .20 .251 Q .28 .197 .36 .198 Q .38 .138 .49 .12 L .67 .125 Q .75 .172 .79 .253 Q .88 .315 .898 .414 L .887 .598 Q .871 .716 .502 .755 Q .139 .733 .112 .614 Z');
const layers = [
  {top: .08, bottom: .455, lift: -.15, drift: -.04},
  {top: .455, bottom: .602, lift: -.006, drift: .045},
  {top: .602, bottom: .76, lift: .095, drift: -.025}
];
const crumbs = Array.from({length: 64}, (_, index) => ({
  x: .17 + ((index * 37) % 67) / 100,
  y: .44 + ((index * 29) % 25) / 100,
  drift: Math.sin(index * 2.4),
  spread: .07 + (index % 13) * .012,
  size: .002 + (index % 5) * .0011,
  coconut: index % 3 === 0
}));
const duration = 20000;
const chapters = ['Bolo inteiro', 'Cobertura de coco', 'Massa de leite de coco', 'Tapioca granulada'];
let frame = 0;
let elapsed = 0;
let lastTime = null;
let playing = false;
let activeChapter = -1;

function blendViews(width, height, turn) {
  const current = Math.floor(turn) % 4;
  const next = (current + 1) % 4;
  for (const [view, alpha] of [[current, 1], [next, turn % 1]]) {
    photoBrush.globalAlpha = alpha;
    photoBrush.drawImage(angles, view % 2 * width, Math.floor(view / 2) * height,
      width, height, 0, 0, width, height);
  }
}

function separateLayers(amount, emphasis, width, height) {
  const backdrop = brush.createRadialGradient(.5, .5, .08, .5, .5, .69);
  backdrop.addColorStop(0, '#30241d');
  backdrop.addColorStop(1, '#100d0c');
  brush.globalAlpha = ease(clamp(amount * 3));
  brush.fillStyle = backdrop;
  brush.fillRect(0, 0, 1, 1);
  brush.globalAlpha = 1;

  for (const layer of layers) {
    brush.save();
    brush.translate(layer.drift * amount, layer.lift * amount + .02 * amount);
    brush.clip(cakeShape);
    brush.beginPath();
    brush.rect(0, layer.top, 1, layer.bottom - layer.top);
    brush.clip();
    brush.drawImage(photo, 0, 0, width, height, 0, 0, 1, 1);
    brush.restore();
  }

  for (const crumb of crumbs) {
    const spread = crumb.spread * amount * (1 + emphasis * .65);
    const x = crumb.x + crumb.drift * spread;
    const y = crumb.y + Math.cos(crumb.x * 39) * spread;
    brush.globalAlpha = clamp(amount * 1.6) * .8;
    brush.fillStyle = crumb.coconut ? '#fff0d5' : '#ffd993';
    brush.beginPath();
    brush.ellipse(x, y, crumb.size * (1 + emphasis), crumb.size * (crumb.coconut ? .42 : .82) * (1 + emphasis), crumb.drift, 0, Math.PI * 2);
    brush.fill();
  }
  brush.globalAlpha = 1;
}

function drawCake(now) {
  frame = 0;
  if (!brush || !photoBrush || !angles.naturalWidth || motion.matches) return;
  const width = Math.floor(angles.naturalWidth / 2);
  const height = Math.floor(angles.naturalHeight / 2);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = photo.width = width;
    canvas.height = photo.height = height;
  }

  if (playing && lastTime !== null) elapsed = Math.min(duration, elapsed + now - lastTime);
  if (playing) lastTime = now;
  const progress = elapsed / duration;
  const angle = Math.min(3, Math.floor(progress * 4));
  const separation = ease(clamp((progress - .25) / .47));
  const emphasis = ease(clamp((progress - .75) / .25));
  if (angle !== activeChapter) {
    activeChapter = angle;
    chapter.textContent = chapters[angle];
  }

  blendViews(width, height, progress * 4);
  brush.setTransform(width, 0, 0, height, 0, 0);
  brush.drawImage(photo, 0, 0, 1, 1);
  if (separation > 0) separateLayers(separation, emphasis, width, height);
  if (elapsed === duration) {
    playing = false;
    lastTime = null;
    button.textContent = 'Reproduzir novamente';
  }
  if (playing) scheduleCake();
}

function scheduleCake() {
  if (!frame) frame = requestAnimationFrame(drawCake);
}

function updateControls() {
  controls.hidden = motion.matches || !angles.naturalWidth || !brush || !photoBrush;
  if (motion.matches) {
    playing = false;
    elapsed = 0;
    lastTime = null;
    button.textContent = 'Reproduzir giro';
  }
  scheduleCake();
}

button.addEventListener('click', () => {
  if (elapsed === duration) elapsed = 0;
  playing = !playing;
  lastTime = null;
  button.textContent = playing ? 'Pausar' : elapsed ? 'Continuar' : 'Reproduzir giro';
  scheduleCake();
});

document.addEventListener('visibilitychange', () => { lastTime = null; });
angles.addEventListener('load', updateControls);
motion.addEventListener('change', updateControls);
angles.src = 'bolo-angulos.jpg';
