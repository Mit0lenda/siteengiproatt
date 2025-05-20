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

// Registro do plugin GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Quando o DOM estiver carregado, duplica o conteúdo de cada track e inicia a animação ao entrar na viewport
document.addEventListener("DOMContentLoaded", () => {
  const tracks = document.querySelectorAll('.client-track');
  // Duplica cada faixa para loop contínuo
  tracks.forEach(track => {
    track.innerHTML += track.innerHTML;
  });

  // Cria o ScrollTrigger para iniciar a animação quando a seção Clientes aparecer
  ScrollTrigger.create({
    trigger: "#clientes",
    start: "top 80%",
    onEnter: () => startClientLoop(tracks),
    once: true
  });
});

/**
 * Inicia o loop de animação em cada track GSAP
 * @param {NodeListOf<Element>} tracks
 */
function startClientLoop(tracks) {
  const pxPerSecond = parseFloat(getComputedStyle(document.documentElement)
    .getPropertyValue('--marquee-speed')) || 100;

  tracks.forEach(track => {
    // track.offsetWidth já contém largura duplicada, usamos metade para deslocar
    const totalWidth = track.offsetWidth;
    const shiftWidth = totalWidth / 2;
    const duration = shiftWidth / pxPerSecond;

    // Animação contínua com GSAP
    gsap.to(track, {
      x: -shiftWidth,
      ease: 'none',
      duration: duration,
      repeat: -1
    });
  });
}