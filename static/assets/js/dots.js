// A viewport-sized decoration: scrolling never changes its coordinate system.
(() => {
  const canvas = document.querySelector('.connecting-dots');
  const context = canvas?.getContext('2d');
  if (!context) return;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const particles = [];
  const frameDuration = 1000 / 30;
  let nearby = new Uint8Array(0);
  let width = 0, height = 0, ratio = 1;
  let pointerX = 0, pointerY = 0, pointerActive = false;
  let frame = 0, resizeFrame = 0, lastFrame = 0;
  let accumulated = 0, suspended = false;

  function draw() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#dddddd';
    context.strokeStyle = '#dddddd';
    context.beginPath();
    const reach = Math.max(width, height) / 10;
    for (let i = 0; i < particles.length; i++) {
      const dot = particles[i];
      context.moveTo(dot.x + dot.radius, dot.y);
      context.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      nearby[i] = Math.abs(dot.x - pointerX) < reach &&
        Math.abs(dot.y - pointerY) < reach;
    }
    context.fill();

    const distance = Math.max(width, height) / 25;
    // The old effect drew each nearby pair twice. Match its fine line weight
    // with one path, and avoid scanning pairs far from the pointer/centre.
    for (const bothNearby of [false, true]) {
      context.beginPath();
      for (let i = 0; i < particles.length; i++) {
        if (!nearby[i]) continue;
        for (let j = 0; j < particles.length; j++) {
          if (bothNearby ? !nearby[j] || j <= i : nearby[j]) continue;
          const from = particles[i], to = particles[j];
          if (Math.abs(from.x - to.x) >= distance ||
              Math.abs(from.y - to.y) >= distance) continue;
          context.moveTo(from.x, from.y);
          context.lineTo(to.x, to.y);
        }
      }
      context.lineWidth = bothNearby ? 0.2 : 0.1;
      context.stroke();
    }
  }

  function resize() {
    // CSS uses the large viewport height, so mobile browser bars and document
    // scroll height do not make the field regenerate while someone scrolls.
    const nextWidth = canvas.clientWidth;
    const nextHeight = canvas.clientHeight;
    const nextRatio = Math.min(devicePixelRatio || 1, 2);
    if (!nextWidth || !nextHeight ||
        (nextWidth === width && nextHeight === height && nextRatio === ratio)) return;
    const widthChanged = width && nextWidth !== width;
    for (const dot of particles) {
      if (widthChanged) {
        dot.x *= nextWidth / width;
        dot.y *= nextHeight / height;
      }
    }
    width = nextWidth;
    height = nextHeight;
    ratio = nextRatio;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = particles.length && !widthChanged
      ? particles.length : Math.min(450, Math.ceil(Math.min(width, height) / 2));
    particles.length = Math.min(particles.length, count);
    while (particles.length < count) {
      particles.push({ x: Math.random() * width, y: Math.random() * height,
        vx: Math.random() - 0.5, vy: Math.random() - 0.5,
        radius: Math.random() });
    }
    if (nearby.length !== count) nearby = new Uint8Array(count);
    if (!pointerActive) { pointerX = width / 2; pointerY = height / 2; }
    draw();
  }

  function animate(now) {
    frame = 0;
    if (suspended || document.hidden || motion.matches) return;
    if (lastFrame) accumulated += Math.min(now - lastFrame, frameDuration * 2);
    lastFrame = now;
    if (accumulated + 0.001 >= frameDuration) {
      const step = Math.floor((accumulated + 0.001) / frameDuration);
      accumulated = Math.max(0, accumulated - step * frameDuration);
      for (const dot of particles) {
        dot.x += dot.vx * step;
        dot.y += dot.vy * step;
        if (dot.x < 0 || dot.x > width) {
          dot.x = Math.max(0, Math.min(width, dot.x)); dot.vx *= -1;
        }
        if (dot.y < 0 || dot.y > height) {
          dot.y = Math.max(0, Math.min(height, dot.y)); dot.vy *= -1;
        }
      }
      draw();
    }
    frame = requestAnimationFrame(animate);
  }

  function pause() {
    cancelAnimationFrame(frame);
    cancelAnimationFrame(resizeFrame);
    frame = resizeFrame = 0;
    lastFrame = accumulated = 0;
  }

  function updateAnimation() {
    pause();
    if (suspended || document.hidden) return;
    resize();
    if (motion.matches) draw();
    else frame = requestAnimationFrame(animate);
  }

  function scheduleResize() {
    if (suspended || document.hidden || resizeFrame) return;
    resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; resize(); });
  }
  addEventListener('resize', scheduleResize, { passive: true });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(scheduleResize).observe(canvas);
  addEventListener('pointermove', (event) => {
    // Touch scrolling and synthetic mouse events must not drag the background.
    if (!finePointer.matches || event.pointerType === 'touch' || motion.matches) return;
    pointerActive = true;
    pointerX = event.clientX;
    pointerY = event.clientY;
  }, { passive: true });
  addEventListener('pointerout', (event) => {
    if (event.relatedTarget) return;
    pointerActive = false; pointerX = width / 2; pointerY = height / 2;
  }, { passive: true });
  finePointer.addEventListener('change', () => {
    pointerActive = false; pointerX = width / 2; pointerY = height / 2;
  });
  document.addEventListener('visibilitychange', updateAnimation);
  motion.addEventListener('change', updateAnimation);
  addEventListener('pagehide', () => { suspended = true; pause(); });
  addEventListener('pageshow', () => { suspended = false; updateAnimation(); });
  updateAnimation();
})();
