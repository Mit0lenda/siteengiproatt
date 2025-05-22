/*!
 *  ENGIPRO – script principal
 *  Author: Codaryn · 2024-25
 *  Dep.: GSAP v3 (+ ScrollTrigger)  &  Bootstrap 5 bundle
 */
(() => {
/* ============================================================== */
/* 0 ▸ Sanity-check GSAP + ScrollTrigger                          */
/* ============================================================== */
if (!window.gsap) {
  console.warn("GSAP não encontrado — animações desabilitadas."); return;
}
const { gsap } = window;
if (!gsap.core.globals().ScrollTrigger) {
  console.warn("ScrollTrigger não encontrado — animações de scroll ignoradas.");
}
gsap.registerPlugin(ScrollTrigger);

/* ============================================================== */
/* 1 ▸ Social-cards (flip-down)                                   */
/* ============================================================== */
function initSocialCards () {
  document.querySelectorAll(".social-card").forEach(card => {
    const front  = card.querySelector(".card-front");
    const reveal = card.querySelector(".card-reveal");
    if (!front || !reveal) return;

    const getHeights = () => ({
      hFront : front .offsetHeight,
      hReveal: reveal.offsetHeight
    });
    let { hFront, hReveal } = getHeights();

    const tl = gsap.timeline({ paused:true })
      .to(card,   { height: () => hFront + hReveal, duration:.4, ease:"power2.out" }, 0)
      .to(reveal, { opacity:1,                   duration:.2, ease:"power2.out" }, .1);

    const open  = () => { ({ hFront, hReveal } = getHeights()); tl.play(0); };
    const close = () => tl.reverse();

    card.addEventListener("mouseenter", open);
    card.addEventListener("mouseleave", close);
    card.addEventListener("focus"    , open);
    card.addEventListener("blur"     , close);
    card.addEventListener("keydown"  , e => e.key === "Escape" && close());
    window.addEventListener("resize" , () => !tl.isActive() && close());
  });
}

/* ============================================================== */
/* 2 ▸ Carrossel de clientes (marquee infinito)                   */
/* ============================================================== */
function startClientLoop (tracks){
  const speed = parseFloat(getComputedStyle(document.documentElement)
                 .getPropertyValue('--marquee-speed')) || 40;   // px/s

  tracks.forEach(track => {
    const slide = track.scrollWidth / 2;            // largura do lote original (duplicado depois)
    const dur   = slide / speed;                    // s = d / v

    gsap.fromTo(track, { x:0 }, {
      x: -slide,
      duration: dur,
      ease: "none",
      repeat: -1
    });
  });
}

function initClientCarousel () {
  const tracks = document.querySelectorAll(".client-track");
  tracks.forEach(t => t.insertAdjacentHTML("beforeend", t.innerHTML.trim())); // duplica

  ScrollTrigger.create({
    trigger:"#clientes",
    start  :"top 80%",
    once   : true,
    onEnter: () => startClientLoop(tracks)
  });
}

/* ============================================================== */
/* 3 ▸ Animações gerais                                           */
/* ============================================================== */
function initPageAnimations () {
  // Hero
  gsap.timeline()
      .from("#hero h1",    { y:-30, opacity:0, duration:1,  ease:"power2.out" })
      .from("#hero .btn",  { x:-20, opacity:0, duration:.6, stagger:.2, ease:"power2.out" }, "-=.6");

  // Fade-in das seções
  gsap.utils.toArray("section").forEach(sec=>{
    gsap.from(sec, {
      scrollTrigger:{ trigger:sec, start:"top 80%" },
      y:40, opacity:0, duration:1, ease:"power2.out"
    });
  });
}

/* ============================================================== */
/* 4 ▸ Fecha menu mobile ao clicar em um link                      */
/* ============================================================== */
function autoCloseMobileMenu () {
  const nav      = document.getElementById("mainNav");
  if (!nav) return;

  nav.querySelectorAll(".nav-link").forEach(link=>{
    link.addEventListener("click", () => {
      const bsColl = bootstrap.Collapse.getInstance(nav);
      if (bsColl && window.innerWidth < 992) bsColl.hide();
    });
  });
}

/* ============================================================== */
/* 5 ▸ DOM ready                                                  */
/* ============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initSocialCards();
  initClientCarousel();
  initPageAnimations();
  autoCloseMobileMenu();
});

})();
// MENU LATERAL COM GSAP
const menuButton = document.querySelector(".menu-toggle");
const slideMenu = document.querySelector("#navigation-slide");

const menuAnim = gsap.timeline({ paused: true, reversed: true });
gsap.set(slideMenu, { xPercent: 100, autoAlpha: 0 });

menuAnim
  .to(slideMenu, {
    xPercent: 0,
    autoAlpha: 1,
    duration: 0.4,
    ease: "power2.out"
  });

menuButton.addEventListener("click", () => {
  document.body.classList.toggle("showNavigationSlide");
  menuAnim.reversed() ? menuAnim.play() : menuAnim.reverse();
});
document.addEventListener("click", (e) => {
  if (document.body.classList.contains("showNavigationSlide") && !slideMenu.contains(e.target) && !menuButton.contains(e.target)) {
    menuAnim.reverse();
    document.body.classList.remove("showNavigationSlide");
  }
});

