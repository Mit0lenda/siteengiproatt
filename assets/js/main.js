/*!
 *  ENGIPRO – script principal
 *  Author: Codaryn · 2024-25
 *  Reúne Social-Cards, carrossel de clientes, animações GSAP
 *  e acessibilidade do botão-hambúrguer.
 *  Dep.: GSAP (v3 +) + ScrollTrigger
 */
(() => {
/* ============================================================== */
/* 1 ▸ Verificações iniciais                                       */
/* ============================================================== */
if (!window.gsap) {
  console.warn("GSAP não encontrado — animações desabilitadas.");
  return;
}
const { gsap } = window;
if (gsap && !gsap.core.globals().ScrollTrigger) {
  console.warn("ScrollTrigger não encontrado — animações de scroll ignoradas.");
}
gsap.registerPlugin(ScrollTrigger);

/* ============================================================== */
/* 2 ▸ Social-cards (cai para baixo)                               */
/* ============================================================== */
function initSocialCards () {
  document.querySelectorAll(".social-card").forEach(card => {
    const front  = card.querySelector(".card-front");
    const reveal = card.querySelector(".card-reveal");
    if (!front || !reveal) return;                 // segurança

    /* —— mede alturas sempre que necessário —— */
    const heights = () => ({
      hFront : front .offsetHeight,
      hReveal: reveal.offsetHeight
    });

    let { hFront, hReveal } = heights();

    /* timeline guardada para abrir/fechar ------------- */
    const tl = gsap.timeline({ paused:true })
      .to(card,   { height: () => hFront + hReveal, duration:.4, ease:"power2.out" }, 0)
      .to(reveal, { opacity:1, duration:.2,          ease:"power2.out" },             .1);

    const open  = () => { ({ hFront, hReveal } = heights()); tl.play(0); };
    const close = () => tl.reverse();

    /* —— eventos —— */
    card.addEventListener("mouseenter", open);
    card.addEventListener("mouseleave", close);
    card.addEventListener("focus"    , open);
    card.addEventListener("blur"     , close);
    card.addEventListener("keydown", e => e.key === "Escape" && close());
    window.addEventListener("resize", () => !tl.isActive() && close());
  });
}

/* ============================================================== */
/* 3 ▸ Carrossel de clientes (loop infinito, velocidade variável) */
/* ============================================================== */
function startClientLoop (tracks){
  const speed = parseFloat(getComputedStyle(document.documentElement)
                 .getPropertyValue('--marquee-speed')) || 40; // px/s

  tracks.forEach(track=>{
    const slide = track.scrollWidth / 2;          // largura do lote original
    const dur   = slide / speed;                  // s = d / v

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

  // duplica cada faixa para não haver "buraco"
  tracks.forEach(t => t.insertAdjacentHTML("beforeend", t.innerHTML.trim()));

  ScrollTrigger.create({
    trigger:"#clientes",
    start  :"top 80%",
    once   : true,
    onEnter: () => startClientLoop(tracks)
  });
}

/* ============================================================== */
/* 4 ▸ Animações gerais (Hero + fade-in de seções)                 */
/* ============================================================== */
function initPageAnimations () {
  /* —— Hero —— */
  gsap.timeline()
      .from("#hero h1",          { y:-30, opacity:0, duration:1,   ease:"power2.out" })
      .from("#hero .btn",        { x:-20, opacity:0, duration:.6,  stagger:.2, ease:"power2.out" }, "-=.6");

  /* —— demais seções —— */
  gsap.utils.toArray("section").forEach(sec=>{
    gsap.from(sec, {
      scrollTrigger:{ trigger:sec, start:"top 80%" },
      y:40, opacity:0, duration:1, ease:"power2.out"
    });
  });
}

/* ============================================================== */
/* 5 ▸ Botão-Hambúrguer acessível                                  */
/* ============================================================== */
function activateMobileMenu () {
  const cb   = document.getElementById("menu-toggle");        // id exato do input
  const nav  = document.getElementById("mainNav");
  const icon = document.querySelector("label[for='menu-toggle']");
  if (!cb || !nav || !icon) return;

  const sync = () => icon.setAttribute("aria-expanded", cb.checked);
  cb.addEventListener("change", sync); sync();

  /* fecha após clicar em qualquer link (mobile) */
  nav.querySelectorAll("a").forEach(a=>{
    a.addEventListener("click", () => {
      if (window.innerWidth < 992) { cb.checked = false; sync(); }
    });
  });
}

/* ============================================================== */
/* 6 ▸ DOM READY – inicialização                                   */
/* ============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  activateMobileMenu();
  initSocialCards();
  initClientCarousel();
  initPageAnimations();
});

})();
