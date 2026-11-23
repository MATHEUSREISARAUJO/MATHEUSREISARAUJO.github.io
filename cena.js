const sequence = document.querySelector('.sequencia');
const scene = document.querySelector('.cena');
const photo = scene.querySelector('img');
const canvas = scene.querySelector('canvas');
const brush = canvas.getContext('2d');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const dust = Array.from({length: 170}, (_, index) => ({
  start: index / 225,
  spread: Math.sin(index * 32.73),
  drift: Math.cos(index * 11.7),
  size: 0.5 + (index % 8) * 0.19
}));
let frame = 0;
function render() {
  frame = 0;
  const {width, height} = scene.getBoundingClientRect();
  const density = Math.min(devicePixelRatio, 2);
  if (canvas.width !== Math.round(width * density) || canvas.height !== Math.round(height * density)) {
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
  }
  brush.setTransform(density, 0, 0, density, 0, 0);
  brush.clearRect(0, 0, width, height);
  if (motion.matches || !photo.naturalWidth) return;
  const range = Math.max(1, sequence.offsetHeight - height);
  const progress = Math.max(0, Math.min(1, -sequence.getBoundingClientRect().top / range));
  const scale = Math.max(width / photo.naturalWidth, height / photo.naturalHeight);
  const imageWidth = photo.naturalWidth * scale;
  const imageHeight = photo.naturalHeight * scale;
  const left = (width - imageWidth) * (width <= 650 ? .68 : .65);
  const top = (height - imageHeight) * .5;
  for (const grain of dust) {
    const age = (progress - grain.start) / .24;
    if (age < 0 || age > 1) continue;
    const x = left + imageWidth * (.675 + age * .023 + grain.spread * (.009 + age * .045) + grain.drift * age * .012);
    const y = top + imageHeight * (.52 + age * age * .26);
    brush.fillStyle = 'rgba(255,241,206,' + (Math.sin(age * Math.PI) * .85) + ')';
    brush.beginPath();
    brush.arc(x, y, grain.size, 0, Math.PI * 2);
    brush.fill();
  }
}
function requestRender() {
  if (!frame) frame = requestAnimationFrame(render);
}
addEventListener('scroll', requestRender, {passive: true});
addEventListener('resize', requestRender);
photo.addEventListener('load', requestRender);
motion.addEventListener('change', requestRender);
requestRender();

