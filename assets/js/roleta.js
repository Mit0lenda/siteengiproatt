// Só precisa registrar uma vez
  gsap.registerPlugin(ScrollTrigger);

  function startClientLoop() {
    // lê px por segundo do CSS
    const pxPerSecond = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--marquee-speed')) || 100;

    // para cada track (originais e clones)...
    gsap.utils.toArray(".client-track").forEach(track => {
      const trackWidth = track.offsetWidth;
      // duração em segundos = largura(px) / pxPorSegundo
      const duration = trackWidth / pxPerSecond;

      // anima
      gsap.to(track, {
        x: -trackWidth,
        ease: "none",
        duration,
        repeat: -1
      });
    });
  }

  // inicia quando a seção #clientes aparecer
  ScrollTrigger.create({
    trigger: "#clientes",
    start: "top 80%",
    onEnter: startClientLoop,
    once: true
  });
document.addEventListener("DOMContentLoaded", function() {
  const tracks = document.querySelectorAll('.client-track');
  tracks.forEach(track => {
    track.innerHTML += track.innerHTML; // Duplica o conteúdo
  });
});
  document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".client-track");
    const items = Array.from(track.children);

    // Duplicar os itens para criar o efeito de loop
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      track.appendChild(clone);
    });
  });