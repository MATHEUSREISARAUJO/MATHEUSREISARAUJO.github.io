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
const handLayer = document.createElement('canvas');
const handBrush = handLayer.getContext('2d');
handLayer.width = 330;
handLayer.height = 330;
let handReady = false;
let frame = 0;

function drawHand(left, top, imageWidth, imageHeight, progress) {
  if (!handReady) {
    handBrush.drawImage(photo, photo.naturalWidth * .51, photo.naturalHeight * .20,
      photo.naturalWidth * .22, photo.naturalHeight * .38, 0, 0, 330, 330);
    const mask = handBrush.createRadialGradient(165, 177, 92, 165, 177, 153);
    mask.addColorStop(0, '#fff');
    mask.addColorStop(1, 'transparent');
    handBrush.globalCompositeOperation = 'destination-in';
    handBrush.fillStyle = mask;
    handBrush.fillRect(0, 0, 330, 330);
    handReady = true;
  }

  const tilt = Math.sin(Math.PI * progress) * .07;
  const wristX = left + imageWidth * .56;
  const wristY = top + imageHeight * .41;
  brush.save();
  brush.translate(wristX, wristY);
  brush.rotate(tilt);
  brush.drawImage(handLayer, -.05 * imageWidth, -.21 * imageHeight,
    .22 * imageWidth, .38 * imageHeight);
  brush.restore();
  return tilt;
}
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
  const tilt = drawHand(left, top, imageWidth, imageHeight, progress);
  for (const grain of dust) {
    const age = (progress - grain.start) / .24;
    if (age < 0 || age > 1) continue;
    const x = left + imageWidth * (.675 + age * .023 + grain.spread * (.009 + age * .045) + grain.drift * age * .012);
    const y = top + imageHeight * (.52 + tilt * .16 * imageWidth / imageHeight + age * age * .26);
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

