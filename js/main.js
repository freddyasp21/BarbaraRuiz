const WHATSAPP_NUMBER = document.getElementById("whatsappBtn")?.dataset.phone || "34652953198";

const preloader = document.getElementById("preloader");
const header = document.getElementById("header");
const menuBtn = document.getElementById("menuBtn");
const menuOverlay = document.getElementById("menuOverlay");
const year = document.getElementById("year");

if (year) year.textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis;

function scrollToEl(el) {
  if (!el) return;
  const offset = -72;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.1 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("is-ready");
  const start = () => {
    preloader?.classList.add("is-done");
    if (window.gsap && !reduceMotion) {
      gsap.to(preloader, {
        yPercent: -100,
        duration: 0.85,
        ease: "power4.inOut",
        onComplete: () => preloader?.remove(),
      });
      intro();
    } else {
      preloader?.remove();
      if (window.gsap) intro();
    }
    const hashEl = location.hash ? document.querySelector(location.hash) : null;
    if (hashEl) setTimeout(() => scrollToEl(hashEl), 200);
  };
  setTimeout(start, reduceMotion ? 0 : 650);
});

function intro() {
  const lines = document.querySelectorAll(".hero__title .line");
  lines.forEach((line) => {
    const text = line.textContent;
    line.textContent = "";
    [...text].forEach((ch) => {
      const span = document.createElement("span");
      span.style.display = "inline-block";
      const inner = document.createElement("span");
      inner.style.display = "inline-block";
      inner.textContent = ch === " " ? "\u00a0" : ch;
      span.appendChild(inner);
      line.appendChild(span);
    });
  });

  const tl = gsap.timeline();
  tl.from(".header", { y: -30, opacity: 0, duration: 0.8, ease: "power3.out" })
    .from(".hero__title .line span span", {
      yPercent: 120,
      duration: 1,
      stagger: 0.018,
      ease: "power4.out",
    }, "-=0.4")
    .from(".hero__sub, .hero__actions, .eyebrow", {
      y: 24,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out",
    }, "-=0.6");
}

if (window.gsap && window.ScrollTrigger && !reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("has-anim");

  gsap.utils.toArray(".reveal, .section-title, .section-lead, .svc, .leaf-card, .pill").forEach((el) => {
    gsap.from(el, {
      y: 36,
      duration: 0.85,
      ease: "power3.out",
      immediateRender: false,
      scrollTrigger: {
        trigger: el,
        start: "top 92%",
        once: true,
      },
    });
  });

  gsap.to(".cta-band__bg", {
    yPercent: 18,
    ease: "none",
    scrollTrigger: { trigger: ".cta-band", start: "top bottom", end: "bottom top", scrub: true },
  });
}

if (window.Lenis && !reduceMotion) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  if (window.gsap && window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
  window.addEventListener("load", () => {
    lenis.resize();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
}

let lastY = 0;
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  header?.classList.toggle("is-scrolled", y > 12);
  header?.classList.toggle("is-hidden", y > lastY && y > 160 && !document.body.classList.contains("menu-open"));
  lastY = y;
}, { passive: true });

function toggleMenu(open) {
  const willOpen = open ?? !menuOverlay.classList.contains("is-open");
  menuOverlay.classList.toggle("is-open", willOpen);
  menuBtn.classList.toggle("is-open", willOpen);
  document.body.classList.toggle("menu-open", willOpen);
  menuBtn.setAttribute("aria-expanded", String(willOpen));
}

menuBtn?.addEventListener("click", () => toggleMenu());
menuOverlay?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = id && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    scrollToEl(target);
    history.replaceState(null, "", id);
  });
});

function initProjectCarousel() {
  const track = document.getElementById("projectSlider");
  if (!track) return;

  const originals = [...track.children];
  const count = originals.length;
  originals.forEach((el) => track.appendChild(el.cloneNode(true)));
  originals.slice().reverse().forEach((el) => track.insertBefore(el.cloneNode(true), track.firstChild));

  const step = () => {
    const slide = track.querySelector(".slide");
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 28;
    return slide.offsetWidth + gap;
  };

  const jumpToMiddle = () => {
    track.style.scrollBehavior = "auto";
    track.scrollLeft = step() * count;
    track.style.scrollBehavior = "";
  };

  requestAnimationFrame(jumpToMiddle);

  const wrap = () => {
    const w = step();
    const block = w * count;
    if (block < 10) return;
    if (track.scrollLeft < block) {
      track.style.scrollBehavior = "auto";
      track.scrollLeft += block;
      track.style.scrollBehavior = "";
    } else if (track.scrollLeft >= block * 2) {
      track.style.scrollBehavior = "auto";
      track.scrollLeft -= block;
      track.style.scrollBehavior = "";
    }
  };

  let scrollTimer;
  track.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(wrap, 90);
  }, { passive: true });

  const go = (dir) => {
    track.scrollBy({ left: dir * step(), behavior: "smooth" });
  };

  document.getElementById("prevProject")?.addEventListener("click", () => go(-1));
  document.getElementById("nextProject")?.addEventListener("click", () => go(1));

  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  track.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button")) return;
    isDown = true;
    startX = e.pageX;
    scrollStart = track.scrollLeft;
    track.classList.add("is-dragging");
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    track.scrollLeft = scrollStart - (e.pageX - startX);
  });
  const stopDrag = () => {
    isDown = false;
    track.classList.remove("is-dragging");
    wrap();
  };
  track.addEventListener("pointerup", stopDrag);
  track.addEventListener("pointercancel", stopDrag);
}

initProjectCarousel();

document.getElementById("contactForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const name = data.get("name");
  const type = data.get("type");
  const message = data.get("message");
  const text = `Hola Bárbara, soy ${name}. Necesito: ${type}. ${message}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
});

(function initHeroLiquid() {
  const hero = document.querySelector(".hero");
  const canvas = document.getElementById("heroLiquid");
  if (!hero || !canvas || reduceMotion) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  const blobs = [
    { restX: 0.06, restY: 0.50, r: 0.52, color: [122, 46, 114], speed: 0.045, x: 0.06, y: 0.50 },
    { restX: 0.26, restY: 0.42, r: 0.46, color: [194, 47, 119], speed: 0.058, x: 0.26, y: 0.42 },
    { restX: 0.50, restY: 0.50, r: 0.54, color: [206, 214, 123], speed: 0.050, x: 0.50, y: 0.50 },
    { restX: 0.68, restY: 0.40, r: 0.42, color: [242, 228, 167], speed: 0.070, x: 0.68, y: 0.40 },
    { restX: 0.92, restY: 0.52, r: 0.50, color: [225, 90, 69], speed: 0.052, x: 0.92, y: 0.52 },
    { restX: 0.40, restY: 0.78, r: 0.32, color: [194, 47, 119], speed: 0.064, x: 0.40, y: 0.78 },
  ];

  const rgba = (rgb, a) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;

  let mx = 0.5;
  let my = 0.5;
  let smx = 0.5;
  let smy = 0.5;
  let hovering = false;
  let visible = true;
  let t = 0;
  let w = 0;
  let h = 0;

  function resize() {
    const rect = hero.getBoundingClientRect();
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    canvas.width = w;
    canvas.height = h;
  }

  function onPointer(e) {
    const rect = hero.getBoundingClientRect();
    mx = (e.clientX - rect.left) / rect.width;
    my = (e.clientY - rect.top) / rect.height;
    hovering = true;
  }

  hero.addEventListener("pointermove", onPointer);
  hero.addEventListener("pointerleave", () => {
    hovering = false;
  });

  new ResizeObserver(resize).observe(hero);
  resize();

  const io = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? true;
  }, { threshold: 0.05 });
  io.observe(hero);

  hero.classList.add("is-liquid");

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;

    t += 0.01;
    smx += (mx - smx) * 0.08;
    smy += (my - smy) * 0.08;

    ctx.filter = "none";
    const base = ctx.createLinearGradient(0, 0, w, 0);
    base.addColorStop(0, "#7a2e72");
    base.addColorStop(0.22, "#c22f77");
    base.addColorStop(0.48, "#ced67b");
    base.addColorStop(0.66, "#f2e4a7");
    base.addColorStop(1, "#e15a45");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    ctx.filter = `blur(${Math.max(36, Math.min(w, h) * 0.07)}px)`;

    blobs.forEach((b, i) => {
      const wanderX = Math.sin(t * (0.55 + i * 0.11) + i * 1.4) * 0.07;
      const wanderY = Math.cos(t * (0.42 + i * 0.09) + i * 2.1) * 0.06;
      let targetX = b.restX + wanderX;
      let targetY = b.restY + wanderY;

      if (hovering) {
        const dx = smx - targetX;
        const dy = smy - targetY;
        const dist = Math.hypot(dx, dy) || 0.001;
        const influence = Math.max(0, 1 - dist * 1.15);
        targetX += dx * (0.28 + influence * 0.4);
        targetY += dy * (0.28 + influence * 0.4);
        const push = influence * 0.12;
        targetX -= (dx / dist) * push;
        targetY -= (dy / dist) * push;
      }

      b.x += (targetX - b.x) * b.speed;
      b.y += (targetY - b.y) * b.speed;

      const radius = Math.max(w, h) * b.r * (1 + Math.sin(t * 0.8 + i) * 0.06);
      const gx = b.x * w;
      const gy = b.y * h;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius);
      g.addColorStop(0, rgba(b.color, 1));
      g.addColorStop(0.55, rgba(b.color, 0.7));
      g.addColorStop(1, rgba(b.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(gx, gy, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    if (hovering) {
      const gx = smx * w;
      const gy = smy * h;
      const radius = Math.max(w, h) * 0.26;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius);
      g.addColorStop(0, "rgba(242, 228, 167, 0.45)");
      g.addColorStop(1, "rgba(242, 228, 167, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(gx, gy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.filter = "none";
  }

  requestAnimationFrame(frame);
})();
