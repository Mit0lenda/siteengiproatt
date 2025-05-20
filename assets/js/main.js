document.addEventListener("DOMContentLoaded", () => {
  // Carregar HEADER
  fetch('/includes/header.html')
    .then(res => res.text())
    .then(html => {
      const header = document.getElementById('header-placeholder');
      if (header) {
        header.innerHTML = html;

        // Depois que o header for carregado, ativa os eventos do menu
        ativarMenuMobile();
      }
    });

  // Carregar FOOTER
  fetch('/includes/footer.html')
    .then(res => res.text())
    .then(html => {
      const footer = document.getElementById('footer-placeholder');
      if (footer) footer.innerHTML = html;
    });
  
  // ====================
  // Animações GSAP
  // ====================
  // Registrar plugin ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);
  // Hero timeline
  const heroTl = gsap.timeline();
  heroTl.from('#heroTitle', { y: -30, opacity: 0, duration: 1, ease: 'power2.out' })
        .from('#heroButtons a', { x: -20, opacity: 0, stagger: 0.2, duration: 0.6, ease: 'power2.out' }, '-=0.6');
  // Scroll-based fade-in para seções
  document.querySelectorAll('section').forEach(section => {
    gsap.from(section, {
      scrollTrigger: { trigger: section, start: 'top 80%' },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power2.out'
    });
  });
});

// Função para ativar o menu mobile após o header estar disponível
function ativarMenuMobile() {
  const toggleBtn = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");

  if (toggleBtn && nav) {
    toggleBtn.addEventListener("click", () => {
      nav.classList.toggle("hidden");
    });

    // (Opcional) Fecha o menu ao clicar em um link no mobile
    const links = nav.querySelectorAll("a");
    links.forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth < 1024) {
          nav.classList.add("hidden");
        }
      });
    });
  }
}
