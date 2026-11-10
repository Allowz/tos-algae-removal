(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 820px)").matches;

  /* ====================== THREE.JS FLUID SHADER SCENE ===================== */
  let renderer, scene, camera, material;
  let scrollProgress = 0;
  let scrollProgressTarget = 0;

  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: { x: 1, y: 1 } },
    uMouse: { value: { x: 0.5, y: 0.5 } },
    uScroll: { value: 0 },
    uColorA: { value: new (window.THREE.Vector3)() },
    uColorB: { value: new (window.THREE.Vector3)() },
    uDistortion: { value: 2.4 },
    uIntensity: { value: 1.0 },
  };

  const vertexShader = `
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;
    uniform float uTime;
    uniform vec2  uResolution;
    uniform vec2  uMouse;
    uniform float uScroll;
    uniform vec3  uColorA;
    uniform vec3  uColorB;
    uniform float uDistortion;
    uniform float uIntensity;
    varying vec2 vUv;

    float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
    float noise(vec2 p){
      vec2 i = floor(p); vec2 f = fract(p);
      vec2 u = f*f*(3.0-2.0*f);
      return mix(mix(hash(i+vec2(0.,0.)), hash(i+vec2(1.,0.)), u.x),
                 mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0.0; float a = 0.5;
      for(int i=0;i<5;i++){ v += a*noise(p); p = p*2.03 + vec2(1.7,9.2); a *= 0.5; }
      return v;
    }

    void main(){
      vec2 uv = vUv;
      vec2 p = vec2(uv.x, 1.0 - uv.y);
      float t = uTime * 0.12;

      vec2 q = vec2( fbm(p*2.0 + t), fbm(p*2.0 + vec2(5.2,1.3) - t) );
      vec2 r = vec2( fbm(p*3.0 + 4.0*q + vec2(1.7,9.2) + t*0.6),
                     fbm(p*3.0 + 4.0*q + vec2(8.3,2.8) - t*0.6) );
      float f = fbm(p*3.0 + uDistortion*r);

      // Palette: deep calm blue, gently shifting with scroll
      vec3 col = mix(uColorA, uColorB, clamp(uScroll*1.1 + f*0.25, 0.0, 1.0));

      // caustic light
      float vig = sqrt(uv.x*uv.y);
      float caustic = fbm(q*2.0 + uTime)*vig;
      col += vec3(0.15,0.35,0.6)*caustic*0.20*(0.4+uScroll);

      // gentle highlights
      float sparkle = pow(sin(f*18.0 + uTime*1.2)*0.5+0.5, 10.0);
      col += vec3(0.15,0.4,0.7)*sparkle*uIntensity*0.35*(0.3+0.7*uScroll);

      // subtle mouse light
      vec2 md = (uv - uMouse)*vec2(2.2,1.1);
      float mouseGlow = exp(-dot(md,md)*6.0);
      col += vec3(0.3,0.55,0.85)*mouseGlow*0.10;

      float vign = smoothstep(0.9,0.25,length((uv-0.5)*vec2(1.2,1.0)));
      col *= mix(0.7,1.0,vign);
      col = pow(col*0.72+0.28, vec3(0.9));
      gl_FragColor = vec4(col,1.0);
    }
  `;

  function initThree() {
    const canvas = document.getElementById("webgl");
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.6);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(camera);

    material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthTest: false, depthWrite: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    uniforms.uResolution.value.x = window.innerWidth;
    uniforms.uResolution.value.y = window.innerHeight;
    setPalette(0);
  }

  function setPalette(progress) {
    // deep calm navy -> clear royal blue (subtle, sits behind the veil)
    const cA0 = [0.05, 0.10, 0.20], cA1 = [0.04, 0.16, 0.34];
    const cB0 = [0.03, 0.08, 0.22], cB1 = [0.06, 0.20, 0.44];
    uniforms.uColorA.value.set(
      cA0[0] + (cA1[0] - cA0[0]) * progress,
      cA0[1] + (cA1[1] - cA0[1]) * progress,
      cA0[2] + (cA1[2] - cA0[2]) * progress
    );
    uniforms.uColorB.value.set(
      cB0[0] + (cB1[0] - cB0[0]) * progress,
      cB0[1] + (cB1[1] - cB0[1]) * progress,
      cB0[2] + (cB1[2] - cB0[2]) * progress
    );
  }

  function onResize() {
    if (!renderer) return;
    uniforms.uResolution.value.x = window.innerWidth;
    uniforms.uResolution.value.y = window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function render() {
    // eased scroll
    scrollProgress += (scrollProgressTarget - scrollProgress) * 0.06;
    uniforms.uScroll.value = scrollProgress;
    setPalette(scrollProgress);
    uniforms.uTime.value += 0.018;
    renderer && renderer.render(scene, camera);
  }

  /* ============================ LENIS ============================ */
  let lenis = null;
  function initLenis() {
    if (prefersReduced || typeof Lenis === "undefined") return;
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    window.lenis = lenis;
    if (typeof gsap !== "undefined") {
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      lenis.raf(0);
    }
  }

  function onScrollRaw() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? (window.scrollY / max) : 0;
    scrollProgressTarget = p;
  }

  /* ======================= REVEAL ANIMATIONS ======================= */
  function initReveals() {
    if (prefersReduced || typeof gsap === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // hero entrance
    gsap.utils.toArray(".hero-title .line").forEach((el, i) => {
      gsap.fromTo(el, { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.1, ease: "power3.out", delay: 0.2 + i * 0.12 });
    });
    gsap.fromTo(".hero-sub", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.9, ease: "power2.out" });
    gsap.fromTo(".hero-cta", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, delay: 1.05, ease: "power2.out" });
    gsap.fromTo(".hero-tags", { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.3 });

    const reveal = (sel, triggerSel, stagger) => {
      gsap.utils.toArray(sel).forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 34 }, {
          opacity: 1, y: 0, duration: 0.7, delay: i * (stagger || 0.12), ease: "power2.out",
          scrollTrigger: { trigger: triggerSel, start: "top 70%" },
        });
      });
    };
    reveal(".apa-cell", "#problem", 0.14);
    reveal(".cause", "#why", 0.1);
    reveal(".service", ".service-grid", 0.1);
    reveal(".p-step", ".process", 0.1);
    reveal(".trust", ".trust-grid", 0.12);
    reveal(".chapter-head", ".chapter-head", 0.05);
    reveal(".chap-title", ".chap-title", 0.05);

    gsap.fromTo(".result-promise", { opacity: 0, scale: 1.04 },
      { opacity: 1, scale: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".chapter-result", start: "top 68%" } });

    ScrollTrigger.create({
      start: 60, end: 99999, toggleClass: { targets: "#nav", className: "scrolled" },
    });

    // chapter dots
    const stageAt = [0, 0.10, 0.28, 0.45, 0.62, 0.82, 0.95];
    ScrollTrigger.create({
      trigger: document.body, start: 0, end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;
        let idx = 0;
        stageAt.forEach((v, i) => { if (p >= v) idx = i; });
        document.querySelectorAll("#chapterDots span").forEach((d, i) => {
          d.classList.toggle("is-active", i === Math.min(idx, 3));
        });
      },
    });

    // progress bar
    document.body.querySelector("#progressFill");
    ScrollTrigger.create({
      trigger: document.body, start: "top top", end: "bottom bottom",
      onUpdate: (self) => { document.getElementById("progressFill").style.width = (self.progress * 100) + "%"; },
    });
  }

  /* ============================ UI ============================ */
  function initNavigation() {
    const toggle = document.getElementById("menuToggle");
    const menu = document.getElementById("mobileMenu");
    const links = menu.querySelectorAll("a");
    const close = () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      menu.setAttribute("aria-hidden", "true");
      if (lenis) lenis.start();
    };
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.setAttribute("aria-hidden", String(!open));
      if (open && lenis) lenis.stop();
      else if (!open && lenis) lenis.start();
    });
    links.forEach((l) => l.addEventListener("click", close));
  }

  function initBeforeAfter() {
    const range = document.getElementById("baRange");
    const before = document.getElementById("baBefore");
    if (!range || !before) return;
    const clip = (v) => { before.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)"; };
    clip(50);
    range.addEventListener("input", () => clip(parseFloat(range.value)));
  }

  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const $ = (id) => document.getElementById(id);
    const name = $("f-name"), phone = $("f-phone"), serv = $("f-service"), msg = $("f-msg");
    const success = $("formSuccess");
    const note = form.querySelector(".form-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      [name, phone, serv].forEach((f) => {
        const wrap = f.closest(".field");
        const valid = f.value.trim() !== "";
        wrap.classList.toggle("invalid", !valid);
        wrap.querySelector(".err").textContent = valid ? "" : "Please fill this in.";
        if (!valid) ok = false;
      });
      if (phone.value.trim() && phone.value.trim().length < 7) {
        phone.closest(".field").classList.add("invalid");
        phone.closest(".field").querySelector(".err").textContent = "Enter a valid phone number.";
        ok = false;
      }
      if (!ok) return;

      success.querySelector("p").textContent = "Request received. TOS will reach out shortly.";
      success.classList.add("show");
      note.style.display = "none";

      if (!document.querySelector(".wa-form-link")) {
        const wa = document.createElement("a");
        wa.href = "https://wa.me/2348063288510?text=" + encodeURIComponent(
          "Hello TOS, I'm requesting a free assessment.\nName: " + name.value +
          "\nPhone: " + phone.value + "\nService: " + serv.value +
          (msg.value ? "\nMessage: " + msg.value : ""));
        wa.target = "_blank"; wa.rel = "noopener"; wa.className = "btn btn-whatsapp btn-block btn-lg wa-form-link";
        wa.textContent = "Send via WhatsApp";
        form.appendChild(wa);
      }
    });
  }


  /* ======================= THEME TOGGLE ======================= */
  function initThemeToggle(){
    const root=document.documentElement;
    const toggle=document.getElementById("themeToggle");
    const mobile=document.getElementById("mobileThemeToggle");
    const saved=localStorage.getItem("tos-theme");
    const systemLight=window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    const setTheme=(theme)=>{
      const light=theme==="light";
      root.classList.toggle("light-theme",light);
      if(toggle){toggle.setAttribute("aria-pressed",String(light));toggle.setAttribute("aria-label",light?"Switch to dark theme":"Switch to light theme")}
      if(mobile) mobile.textContent=light?"Use dark theme":"Use light theme";
    };
    setTheme(saved || (systemLight?"light":"dark"));
    const flip=()=>{const next=root.classList.contains("light-theme")?"dark":"light";localStorage.setItem("tos-theme",next);setTheme(next)};
    toggle?.addEventListener("click",flip); mobile?.addEventListener("click",flip);
  }

  /* ============================ main ============================ */
  function main() {
    initThemeToggle();
    initThree();
    initNavigation();
    initBeforeAfter();
    initContactForm();
    initLenis();
    if (typeof gsap !== "undefined" && ScrollTrigger) initReveals();

    window.addEventListener("scroll", onScrollRaw, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", (e) => {
      if (prefersReduced || isMobile) return;
      uniforms.uMouse.value.x = e.clientX / window.innerWidth;
      uniforms.uMouse.value.y = 1 - e.clientY / window.innerHeight;
    });

    if (prefersReduced) {
      scrollProgressTarget = 0.5;
      scrollProgress = 0.5;
      uniforms.uScroll.value = 0.5;
    }

    // render loop
    const loop = () => { render(); };
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { cancelAnimationFrame(frameId); }
      else { frameId = requestAnimationFrame(loop); }
    });
    let frameId = requestAnimationFrame(loop);
  }

  document.addEventListener("DOMContentLoaded", main);
})();