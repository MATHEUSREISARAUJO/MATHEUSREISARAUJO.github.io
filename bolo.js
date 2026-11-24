const sequence = document.querySelector('.bolo-sequencia');
const stage = sequence.querySelector('.bolo-palco');
const canvas = stage.querySelector('canvas');
const brush = canvas.getContext('2d');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const angles = new Image();
let frame = 0;

function drawCake() {
  frame = 0;
  if (!brush || !angles.naturalWidth || motion.matches) return;
  const width = Math.floor(angles.naturalWidth / 2);
  const height = Math.floor(angles.naturalHeight / 2);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const travel = Math.max(1, sequence.offsetHeight - stage.offsetHeight);
  const top = stage.getBoundingClientRect().top;
  const progress = Math.min(1, Math.max(0, (top - sequence.getBoundingClientRect().top) / travel));
  const angle = progress * 4;
  const current = Math.floor(angle) % 4;
  const next = (current + 1) % 4;
  const blend = angle % 1;

  brush.globalAlpha = 1;
  brush.drawImage(angles, current % 2 * width, Math.floor(current / 2) * height,
    width, height, 0, 0, width, height);
  brush.globalAlpha = blend;
  brush.drawImage(angles, next % 2 * width, Math.floor(next / 2) * height,
    width, height, 0, 0, width, height);
}

function scheduleCake() {
  if (!frame) frame = requestAnimationFrame(drawCake);
}

angles.addEventListener('load', scheduleCake);
addEventListener('scroll', scheduleCake, {passive: true});
addEventListener('resize', scheduleCake);
motion.addEventListener('change', scheduleCake);
angles.src = 'bolo-angulos.jpg';
