/* Lightweight confetti + floating hearts.
   No external JS deps; designed to work as a single GitHub Pages site. */

const state = {
  running: true,
  confettiBurst: 0,
};

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeHeartSvg(color) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "18");
  svg.setAttribute("height", "18");
  svg.setAttribute("fill", "none");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M12 21s-7-4.6-9.5-8.4C.4 9.4 2.2 6.5 5.3 6c1.8-.3 3.4.6 4.2 1.8.8-1.2 2.4-2.1 4.2-1.8 3.1.5 4.9 3.4 2.8 6.6C19 16.4 12 21 12 21Z"
  );
  path.setAttribute("fill", color);
  path.setAttribute("opacity", "0.92");
  svg.appendChild(path);
  return svg;
}

function setupFloaters() {
  const host = document.getElementById("floaters");
  if (!host) return { tick: () => {} };

  const colors = ["#ff4d8d", "#7c4dff", "#21c7a8", "#ffb84d", "#ff6b6b"];
  const floaters = [];
  // More floaters for a fuller look, but capped to keep it light on phones.
  const count = clamp(Math.floor(window.innerWidth / 55), 16, 32);

  host.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "floater";
    el.style.left = `${rand(0, 100)}%`;
    el.style.top = `${rand(10, 95)}%`;

    const s = rand(0.8, 1.55);
    el.style.transform = `translate3d(0,0,0) scale(${s})`;

    el.appendChild(makeHeartSvg(pick(colors)));
    host.appendChild(el);

    floaters.push({
      el,
      baseX: rand(0, window.innerWidth),
      baseY: rand(0, window.innerHeight),
      speedY: rand(14, 36),
      ampX: rand(14, 44),
      phase: rand(0, Math.PI * 2),
      drift: rand(-8, 8),
      scale: s,
    });
  }

  function layoutBases() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (const f of floaters) {
      f.baseX = rand(0, w);
      f.baseY = rand(0, h);
    }
  }

  function tick(dt, t) {
    if (!state.running) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (const f of floaters) {
      f.baseY -= (f.speedY * dt) / 1000;
      if (f.baseY < -40) {
        f.baseY = h + rand(20, 120);
        f.baseX = rand(0, w);
      }

      const x = f.baseX + Math.sin(t / 900 + f.phase) * f.ampX + (f.drift * dt) / 1000;
      const y = f.baseY + Math.cos(t / 1200 + f.phase) * 6;
      const rot = Math.sin(t / 700 + f.phase) * 10;

      f.el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${f.scale})`;
      f.el.style.opacity = state.running ? "0.92" : "0";
    }
  }

  window.addEventListener("resize", () => {
    layoutBases();
  });

  layoutBases();
  return { tick };
}

function setupPhotoFloaters() {
  const host = document.getElementById("photoFloaters");
  if (!host) return { tick: () => {} };
  const lovePop = document.getElementById("lovePop");

  const images = [
    "./assets/photos/01.png",
    "./assets/photos/02.png",
    "./assets/photos/03.png",
    "./assets/photos/04.png",
    "./assets/photos/05.png",
    "./assets/photos/06.png",
    "./assets/photos/07.png",
    "./assets/photos/08.png",
    "./assets/photos/09.png",
    "./assets/photos/10.png",
    "./assets/photos/11.png",
    "./assets/photos/12.png",
    "./assets/photos/13.png",
  ];

  const floaters = [];
  host.innerHTML = "";

  function spawn(i) {
    const el = document.createElement("div");
    el.className = "photoFloater";

    const img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    img.loading = "lazy";
    img.src = images[i % images.length];
    el.appendChild(img);

    host.appendChild(el);

    const w = window.innerWidth;
    const h = window.innerHeight;

    const sizeScale = rand(0.85, 1.2);
    const x = rand(-0.05, 1.05) * w;
    const y = h + rand(40, 260);
    const speedY = rand(18, 42); // px/s
    const ampX = rand(10, 34);
    const phase = rand(0, Math.PI * 2);
    const rotBase = rand(-8, 8);

    floaters.push({
      el,
      img,
      x,
      y,
      speedY,
      ampX,
      phase,
      rotBase,
      sizeScale,
      swapAt: rand(0.25, 0.6), // swap image mid-flight (loop feel)
      swapped: false,
      index: i,
    });
  }

  // A bit fewer than hearts, but still present. Cap for mobile performance.
  const count = clamp(Math.floor(window.innerWidth / 180) + 6, 8, 14);
  for (let i = 0; i < count; i++) spawn(i);

  function respawn(f) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    f.x = rand(-0.05, 1.05) * w;
    f.y = h + rand(60, 340);
    f.speedY = rand(18, 42);
    f.ampX = rand(10, 34);
    f.phase = rand(0, Math.PI * 2);
    f.rotBase = rand(-8, 8);
    f.sizeScale = rand(0.85, 1.2);
    f.swapAt = rand(0.25, 0.6);
    f.swapped = false;
    f.index = (f.index + 1) % images.length;
    f.img.src = images[f.index];
  }

  function tick(dt, t) {
    if (!state.running) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (const f of floaters) {
      f.y -= (f.speedY * dt) / 1000;

      // Subtle sway + tiny rotation
      const sway = Math.sin(t / 1100 + f.phase) * f.ampX;
      const rot = f.rotBase + Math.sin(t / 1400 + f.phase) * 6;

      // Swap image once during the flight, to keep the loop varied even with fewer floaters.
      const progress = 1 - clamp((f.y + 120) / (h + 420), 0, 1);
      if (!f.swapped && progress > f.swapAt) {
        f.swapped = true;
        f.index = (f.index + 1) % images.length;
        f.img.src = images[f.index];
      }

      // Fade as it reaches top/bottom
      const edgeFade = clamp(Math.min((f.y + 120) / 220, (h - f.y) / 260), 0, 1);
      f.el.style.opacity = `${0.82 * edgeFade}`;

      f.el.style.transform = `translate3d(${f.x + sway}px, ${f.y}px, 0) rotate(${rot}deg) scale(${f.sizeScale})`;

      if (f.y < -260) respawn(f);
      if (f.x < -400) f.x = w + 200;
      if (f.x > w + 400) f.x = -200;
    }
  }

  window.addEventListener("resize", () => {
    // Keep them distributed after resize
    const w = window.innerWidth;
    for (const f of floaters) f.x = rand(-0.05, 1.05) * w;
  });

  function showLoveAt(x, y) {
    if (!lovePop) return;
    // Keep on-screen; use CSS vars to drive keyframes.
    const pad = 10;
    const estW = 220;
    const estH = 46;
    const nx = clamp(x - estW / 2, pad, window.innerWidth - estW - pad);
    const ny = clamp(y - estH / 2, pad, window.innerHeight - estH - pad);

    lovePop.style.setProperty("--x", `${Math.round(nx)}px`);
    lovePop.style.setProperty("--y", `${Math.round(ny)}px`);
    lovePop.classList.remove("is-on");
    // Force restart animation
    // eslint-disable-next-line no-unused-expressions
    lovePop.offsetHeight;
    lovePop.classList.add("is-on");
  }

  host.addEventListener(
    "pointerdown",
    (e) => {
      const target = e.target instanceof Element ? e.target.closest(".photoFloater") : null;
      if (!target) return;
      // Don't treat as a drag/scroll; it's a quick tap interaction.
      e.preventDefault();
      showLoveAt(e.clientX, e.clientY);
    },
    { passive: false }
  );

  return { tick };
}

function setupConfetti() {
  const canvas = document.getElementById("confetti");
  if (!canvas) return { burst: () => {}, tick: () => {}, resize: () => {} };

  const ctx = canvas.getContext("2d");
  const pieces = [];

  const palette = ["#ff4d8d", "#7c4dff", "#21c7a8", "#ffd166", "#ef476f", "#06d6a0"];

  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function addPiece(x, y, impulse = 1) {
    const size = rand(5, 9) * impulse;
    pieces.push({
      x,
      y,
      vx: rand(-140, 140) * impulse,
      vy: rand(-260, -120) * impulse,
      g: rand(460, 720),
      rot: rand(0, Math.PI),
      vr: rand(-6, 6),
      w: size,
      h: size * rand(0.55, 1.25),
      color: pick(palette),
      life: 0,
      ttl: rand(1200, 2100),
    });
  }

  function burst(strength = 1) {
    if (prefersReducedMotion()) return;
    // "Screen-wide" celebration: spawn from across the top plus a few mid-screen pops.
    const w = window.innerWidth;
    const h = window.innerHeight;

    const topN = Math.floor(220 * strength);
    for (let i = 0; i < topN; i++) {
      addPiece(rand(0, w), rand(-40, 40), strength);
    }

    const pops = Math.floor(3 * strength);
    for (let p = 0; p < pops; p++) {
      const cx = rand(w * 0.15, w * 0.85);
      const cy = rand(h * 0.18, h * 0.45);
      const n = Math.floor(70 * strength);
      for (let i = 0; i < n; i++) addPiece(cx + rand(-90, 90), cy + rand(-40, 60), strength);
    }
  }

  function tick(dt) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (!state.running) return;

    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      p.life += dt;
      p.vy += (p.g * dt) / 1000;
      p.x += (p.vx * dt) / 1000;
      p.y += (p.vy * dt) / 1000;
      p.rot += (p.vr * dt) / 1000;

      const alpha = 1 - clamp(p.life / p.ttl, 0, 1);
      if (alpha <= 0 || p.y > window.innerHeight + 80) {
        pieces.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = alpha * 0.9;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
  }

  window.addEventListener("resize", resize);
  resize();
  return { burst, tick, resize };
}

function main() {
  const celebrateBtn = document.getElementById("celebrateBtn");
  const surpriseBtn = document.getElementById("surpriseBtn");
  const calmBtn = document.getElementById("calmBtn");
  const surpriseModal = document.getElementById("surpriseModal");
  const closeSurprise = document.getElementById("closeSurprise");
  const doneScratch = document.getElementById("doneScratch");

  const photoFloaters = setupPhotoFloaters();
  const floaters = setupFloaters();
  const confetti = setupConfetti();

  if (!prefersReducedMotion()) {
    // small initial burst
    confetti.burst(0.75);
  }

  function setRunning(next) {
    state.running = next;
    if (calmBtn) calmBtn.textContent = next ? "Pausar animações" : "Retomar animações";
  }

  if (celebrateBtn) {
    celebrateBtn.addEventListener("click", () => {
      confetti.burst(1.15);
    });
  }
  if (calmBtn) {
    calmBtn.addEventListener("click", () => {
      setRunning(!state.running);
    });
  }

  // Scratch cards
  const scratchCards = Array.from(document.querySelectorAll("[data-scratch-card]"));
  const scratchCleanup = [];
  const prizeBalloon = document.getElementById("prizeBalloon");
  let prizeShown = false;

  // Procedural "scratch" sound (no external audio file).
  const scratchSound = (() => {
    let ctx = null;
    let noise = null;
    let filter = null;
    let gain = null;
    let isOn = false;
    let lastTouch = 0;

    function ensure() {
      if (ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();

      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1800;
      filter.Q.value = 0.8;

      gain = ctx.createGain();
      gain.gain.value = 0.00001;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    }

    async function start() {
      ensure();
      if (!ctx || !gain) return;
      lastTouch = performance.now();
      if (ctx.state === "suspended") {
        try {
          await ctx.resume();
        } catch {
          // ignore
        }
      }
      if (isOn) return;
      isOn = true;
      // Fade in quickly
      const t = ctx.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0.07, t + 0.03);
    }

    function setIntensity(v) {
      if (!ctx || !gain || !filter) return;
      const t = ctx.currentTime;
      const vv = clamp(v, 0, 1);
      // Keep it soft; phones can get loud.
      const target = 0.04 + vv * 0.05;
      gain.gain.setTargetAtTime(target, t, 0.03);
      filter.frequency.setTargetAtTime(1200 + vv * 1800, t, 0.04);
      lastTouch = performance.now();
    }

    function stop() {
      if (!ctx || !gain) return;
      if (!isOn) return;
      isOn = false;
      const t = ctx.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setTargetAtTime(0.00001, t, 0.03);
    }

    // Safety: if we don't get move events (touch), auto-stop.
    function watchdog() {
      if (isOn && performance.now() - lastTouch > 140) stop();
      requestAnimationFrame(watchdog);
    }
    requestAnimationFrame(watchdog);

    return { start, stop, setIntensity };
  })();

  function paintScratchCover(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);

    // Shimmery "scratch" foil
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "rgba(235, 235, 245, 0.98)");
    g.addColorStop(0.35, "rgba(212, 212, 228, 0.98)");
    g.addColorStop(0.65, "rgba(244, 244, 252, 0.98)");
    g.addColorStop(1, "rgba(210, 210, 226, 0.98)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Subtle diagonal lines
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = 1;
    for (let x = -h; x < w + h; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + h, h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Text hint
    ctx.fillStyle = "rgba(35, 31, 46, 0.62)";
    ctx.font = "700 22px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("RASPE AQUI", w / 2, h / 2);
  }

  function percentCleared(canvas, sampleStep = 14) {
    // Estimate cleared area by sampling alpha channel.
    // Canvas pixels are at device pixel resolution; sampleStep keeps it fast.
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const w = canvas.width;
    const h = canvas.height;
    const img = ctx.getImageData(0, 0, w, h).data;
    let total = 0;
    let cleared = 0;
    for (let y = 0; y < h; y += sampleStep) {
      for (let x = 0; x < w; x += sampleStep) {
        total++;
        const a = img[(y * w + x) * 4 + 3];
        if (a < 12) cleared++;
      }
    }
    return total ? cleared / total : 0;
  }

  function maybeShowPrizeBalloon() {
    if (!prizeBalloon || prizeShown) return;
    prizeShown = true;
    prizeBalloon.hidden = false;
    // Small celebration feedback
    confetti.burst(0.9);
  }

  function setupScratchCard(cardEl) {
    const canvas = cardEl.querySelector("canvas");
    if (!canvas) return () => {};
    const ctx = canvas.getContext("2d");
    const scratchId = cardEl.getAttribute("data-scratch-id");
    const PRIZE_THRESHOLD = 0.56;
    let lastCompletionCheck = 0;

    function resizeCanvasToCSS() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintScratchCover(ctx, rect.width, rect.height);
    }

    let isDown = false;
    let last = null;

    function scratchAt(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function onDown(e) {
      isDown = true;
      last = { x: e.clientX, y: e.clientY };
      scratchAt(e.clientX, e.clientY);
      scratchSound.start();
      scratchSound.setIntensity(0.6);
      e.preventDefault();
    }
    function onMove(e) {
      if (!isDown) return;
      if (last) {
        // interpolate a bit for smoother scratch
        const steps = 6;
        for (let i = 1; i <= steps; i++) {
          const ix = last.x + ((e.clientX - last.x) * i) / steps;
          const iy = last.y + ((e.clientY - last.y) * i) / steps;
          scratchAt(ix, iy);
        }
      } else {
        scratchAt(e.clientX, e.clientY);
      }
      // Intensity based on movement speed
      const dx = last ? e.clientX - last.x : 0;
      const dy = last ? e.clientY - last.y : 0;
      const dist = Math.sqrt(dx * dx + dy * dy);
      scratchSound.setIntensity(clamp(dist / 30, 0.15, 1));
      last = { x: e.clientX, y: e.clientY };

      // Check completion while scratching (throttled).
      if (scratchId === "3" && !prizeShown) {
        const now = performance.now();
        if (now - lastCompletionCheck > 140) {
          lastCompletionCheck = now;
          const pct = percentCleared(canvas, 18);
          if (pct >= PRIZE_THRESHOLD) maybeShowPrizeBalloon();
        }
      }

      e.preventDefault();
    }
    function onUp() {
      isDown = false;
      last = null;
      scratchSound.stop();
      // If this is the 3rd card, check completion on release.
      if (scratchId === "3" && !prizeShown) {
        // Threshold: "raspou toda" but allow tiny leftovers.
        const pct = percentCleared(canvas, 18);
        if (pct >= PRIZE_THRESHOLD) maybeShowPrizeBalloon();
      }
    }

    canvas.addEventListener("pointerdown", onDown, { passive: false });
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("resize", resizeCanvasToCSS);

    // Initial size after layout
    setTimeout(resizeCanvasToCSS, 0);

    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", resizeCanvasToCSS);
    };
  }

  function openModal() {
    if (!surpriseModal) return;
    surpriseModal.classList.add("is-open");
    surpriseModal.setAttribute("aria-hidden", "false");
    prizeShown = false;
    if (prizeBalloon) prizeBalloon.hidden = true;
    // Setup scratch cards on open (ensures correct sizes)
    scratchCleanup.splice(0, scratchCleanup.length).forEach((fn) => fn());
    for (const card of scratchCards) scratchCleanup.push(setupScratchCard(card));
  }

  function closeModal() {
    if (!surpriseModal) return;
    surpriseModal.classList.remove("is-open");
    surpriseModal.setAttribute("aria-hidden", "true");
    prizeShown = false;
    if (prizeBalloon) prizeBalloon.hidden = true;
    scratchCleanup.splice(0, scratchCleanup.length).forEach((fn) => fn());
    scratchSound.stop();
  }

  if (surpriseBtn) surpriseBtn.addEventListener("click", openModal);
  if (closeSurprise) closeSurprise.addEventListener("click", closeModal);
  if (doneScratch) doneScratch.addEventListener("click", closeModal);

  if (surpriseModal) {
    surpriseModal.addEventListener("click", (e) => {
      const t = e.target;
      if (t instanceof Element && t.getAttribute("data-close") === "true") closeModal();
    });
  }

  let last = performance.now();
  function loop(now) {
    const dt = now - last;
    last = now;
    photoFloaters.tick(dt, now);
    floaters.tick(dt, now);
    confetti.tick(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Keyboard convenience
  window.addEventListener("keydown", (e) => {
    if (e.key === "c" || e.key === "C") confetti.burst(1.0);
    if (e.key === "p" || e.key === "P") setRunning(!state.running);
  });
}

document.addEventListener("DOMContentLoaded", main);
