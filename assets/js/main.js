/*!
 * ENGIPRO – script principal
 * Author: Codaryn · 2024-25
 * Dep.: GSAP v3 (+ ScrollTrigger)  &  Bootstrap 5 bundle
 */
(() => {
  /* ============================================================== */
  /* 0 ▸ Sanity-check GSAP + ScrollTrigger                          */
  /* ============================================================== */
  if (!window.gsap) {
    console.warn("GSAP não encontrado — animações desabilitadas.");
  } else {
    const { gsap } = window;
    if (!gsap.core.globals().ScrollTrigger) {
      console.warn("ScrollTrigger não encontrado — animações de scroll ignoradas.");
    } else {
      gsap.registerPlugin(ScrollTrigger);
    }
  }

  /* ============================================================== */
  /* 1 ▸ Social-cards (flip-down)                                   */
  /* ============================================================== */
  function initSocialCards () {
    if (!window.gsap) return;
    const { gsap } = window;

    document.querySelectorAll(".social-card").forEach(card => {
      const front  = card.querySelector(".card-front");
      const reveal = card.querySelector(".card-reveal");
      if (!front || !reveal) return;

      const getHeights = () => ({
        hFront : front.offsetHeight,
        hReveal: reveal.offsetHeight
      });
      let { hFront, hReveal } = getHeights();

      gsap.set(reveal, { opacity: 0, height: 0, overflow: 'hidden' });
      gsap.set(card, { height: hFront });

      const tl = gsap.timeline({ paused:true })
        .to(card,   { height: () => hFront + hReveal, duration:.4, ease:"power2.out" }, 0)
        .to(reveal, { height: () => hReveal, opacity:1, duration:.3, ease:"power2.out", delay: 0.1 }, 0);

      const open  = () => {
        ({ hFront, hReveal } = getHeights());
        gsap.set(reveal, { height: 0, opacity: 0 });
        gsap.set(card, { height: hFront });
        tl.play(0);
      };
      const close = () => {
        tl.reverse();
      };

      card.addEventListener("mouseenter", open);
      card.addEventListener("mouseleave", close);
      card.addEventListener("focus"     , open);
      card.addEventListener("blur"      , (e) => {
        if (!card.contains(e.relatedTarget)) {
            close();
        }
      });
      card.addEventListener("keydown"   , e => {
        if (e.key === "Escape" && (tl.isActive() || !tl.reversed())) {
            close();
        }
        if ((e.key === "Enter" || e.key === " ") && document.activeElement === card) {
            e.preventDefault();
            if(tl.reversed() || !tl.isActive()) {
                open();
            } else {
                close();
            }
        }
      });
      window.addEventListener("resize" , () => {
        if (!tl.isActive()) {
            ({ hFront, hReveal } = getHeights());
            gsap.set(card, { height: hFront });
            gsap.set(reveal, { height: 0, opacity: 0 });
            tl.pause(0).reversed(true);
        }
      });
    });
  }

  /* ============================================================== */
  /* 2 ▸ Carrossel de clientes (marquee infinito)                   */
  /* ============================================================== */
  function startClientLoop (tracks){
    if (!window.gsap) return;
    const { gsap } = window;

    const speed = parseFloat(getComputedStyle(document.documentElement)
                   .getPropertyValue('--marquee-speed')) || 40;

    tracks.forEach(track => {
      if (track.children.length === 0) return;
      const slide = track.scrollWidth / 2;
      if (slide === 0) return;
      const dur   = slide / speed;
      if (dur === 0 || !isFinite(dur)) return;

      gsap.fromTo(track, { x:0 }, {
        x: -slide,
        duration: dur,
        ease: "none",
        repeat: -1
      });
    });
  }

  function initClientCarousel () {
    if (!window.gsap || !window.gsap.core.globals().ScrollTrigger) return;
    const { ScrollTrigger } = window.gsap.core.globals();

    const tracks = document.querySelectorAll(".client-track");
    if (tracks.length === 0) return;

    tracks.forEach(t => {
        const originalChildren = Array.from(t.children);
        originalChildren.forEach(child => {
            t.appendChild(child.cloneNode(true));
        });
    });

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
    if (!window.gsap || !window.gsap.core.globals().ScrollTrigger) return;
    const { gsap } = window;
    const { ScrollTrigger } = window.gsap.core.globals();

    if (document.querySelector("#hero h1") && document.querySelector("#hero .btn")) {
      gsap.timeline()
        .from("#hero h1",    { y:-30, opacity:0, duration:1,  ease:"power2.out" })
        .from("#hero .btn",  { x:-20, opacity:0, duration:.6, stagger:.2, ease:"power2.out" }, "-=.6");
    }

    const sections = gsap.utils.toArray("section");
    if (sections.length > 0) {
      sections.forEach(sec=>{
        gsap.from(sec, {
          scrollTrigger:{ trigger:sec, start:"top 85%", end: "bottom 20%", toggleActions: "play none none none"},
          y:50,
          opacity:0,
          duration:0.8,
          ease:"power3.out"
        });
      });
    }
  }

  /* ============================================================== */
  /* 4 ▸ Comportamento dos Dropdowns na Navbar Mobile (CORRIGIDO)   */
  /* ============================================================== */
  function initMobileDropdownHandling() {
    const mainNav = document.getElementById('mainNav');
    if (!mainNav) return;

    const dropdownToggles = mainNav.querySelectorAll('.nav-link.dropdown-toggle');

    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', function(event) {
        // Aplicar lógica apenas em telas mobile (onde o menu está colapsado)
        if (window.innerWidth < 992) {
          event.preventDefault();  // Impede o link de navegar (se href="#")
          event.stopPropagation(); // Impede que o evento se propague e feche o menu principal

          const thisDropdownMenu = this.nextElementSibling; // O .dropdown-menu é o próximo irmão

          // Primeiro, fecha todos os outros submenus que possam estar abertos
          dropdownToggles.forEach(otherToggle => {
            if (otherToggle !== this) { // Não mexe no submenu do toggle atual
              const otherDropdownMenu = otherToggle.nextElementSibling;
              if (otherDropdownMenu && otherDropdownMenu.classList.contains('dropdown-menu') && otherDropdownMenu.classList.contains('show')) {
                otherDropdownMenu.classList.remove('show');
                otherToggle.setAttribute('aria-expanded', 'false');
              }
            }
          });

          // Agora, abre/fecha o submenu do toggle que foi clicado
          if (thisDropdownMenu && thisDropdownMenu.classList.contains('dropdown-menu')) {
            if (thisDropdownMenu.classList.contains('show')) {
              thisDropdownMenu.classList.remove('show');
              this.setAttribute('aria-expanded', 'false');
            } else {
              thisDropdownMenu.classList.add('show');
              this.setAttribute('aria-expanded', 'true');
            }
          }
        }
        // Em telas maiores (desktop), o data-bs-toggle="dropdown" e o CSS de hover cuidarão disso.
      });
    });

    // Fecha o menu mobile principal (#mainNav) APENAS quando um item final é clicado
    // (um .dropdown-item ou um .nav-link que NÃO seja .dropdown-toggle)
    const allFinalLinksInMainNav = mainNav.querySelectorAll('a.dropdown-item, a.nav-link:not(.dropdown-toggle)');
    allFinalLinksInMainNav.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth < 992 && mainNav.classList.contains('show')) {
          if (window.bootstrap && window.bootstrap.Collapse) {
            const bsCollapse = bootstrap.Collapse.getInstance(mainNav);
            if (bsCollapse) {
              bsCollapse.hide();
            }
          }
        }
      });
    });
  }

  /* ============================================================== */
  /* 5 ▸ Atualizar ano no rodapé                                    */
  /* ============================================================== */
  function updateCopyrightYear() {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }

  /* ============================================================== */
  /* 6 ▸ DOM ready                                                  */
  /* ============================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    initSocialCards();
    initClientCarousel();
    initPageAnimations();
    initMobileDropdownHandling(); // Função corrigida para dropdowns
    updateCopyrightYear();

    // Lógica para o MENU LATERAL COM GSAP
    const menuButton = document.querySelector(".menu-toggle");
    const slideMenu = document.querySelector("#navigation-slide");

    if (menuButton && slideMenu && window.gsap) {
        const { gsap } = window;
        gsap.set(slideMenu, { xPercent: 100, autoAlpha: 0 });

        const menuAnim = gsap.timeline({ paused: true, reversed: true })
            .to(slideMenu, {
                xPercent: 0,
                autoAlpha: 1,
                duration: 0.4,
                ease: "power2.out"
            });

        menuButton.addEventListener("click", (e) => {
            e.preventDefault();
            document.body.classList.toggle("showNavigationSlide");
            menuAnim.reversed() ? menuAnim.play() : menuAnim.reverse();
        });

        document.addEventListener("click", (e) => {
            if (document.body.classList.contains("showNavigationSlide") &&
                !slideMenu.contains(e.target) &&
                !menuButton.contains(e.target) &&
                !e.target.closest('.menu-toggle')) {
                menuAnim.reverse();
                document.body.classList.remove("showNavigationSlide");
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && document.body.classList.contains("showNavigationSlide")) {
                menuAnim.reverse();
                document.body.classList.remove("showNavigationSlide");
            }
        });

        slideMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (document.body.classList.contains("showNavigationSlide")) {
                    menuAnim.reverse();
                    document.body.classList.remove("showNavigationSlide");
                }
            });
        });
    } else {
        if (!menuButton) console.warn("Botão .menu-toggle para o menu lateral GSAP não encontrado.");
        if (!slideMenu) console.warn("Elemento #navigation-slide para o menu lateral GSAP não encontrado.");
    }
  });

})();