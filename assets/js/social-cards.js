// assets/js/social-cards.js
// GSAP reveal effect for social cards
// assets/js/social-cards.js
// GSAP dropdown reveal effect for social cards (abre para baixo)
if (window.gsap) {
  document.querySelectorAll('.social-card').forEach(card => {
    const front = card.querySelector('.card-front');
    const reveal = card.querySelector('.card-reveal');
    if (!front || !reveal) return;

    // Inicial: card com altura só do front, reveal oculto abaixo
    const frontHeight = front.offsetHeight;
    const revealHeight = reveal.offsetHeight;
    gsap.set(card, { height: frontHeight });
    gsap.set(reveal, { y: 0, top: frontHeight, opacity: 0, position: 'absolute', width: '100%' });

    // Timeline: expande card e revela .card-reveal deslizando para baixo
    const tl = gsap.timeline({ paused: true });
    tl.to(card, { height: frontHeight + revealHeight, duration: 0.4, ease: 'power2.out' }, 0)
      .to(reveal, { opacity: 1, duration: 0.2, ease: 'power2.out' }, 0.1)
      .to(reveal, { y: 0 }, 0.1);

    // Volta ao normal
    function closeCard() {
      tl.reverse();
    }
    function openCard() {
      // Recalcula altura se responsivo
      const newFrontHeight = front.offsetHeight;
      const newRevealHeight = reveal.offsetHeight;
      tl.clear();
      tl.to(card, { height: newFrontHeight + newRevealHeight, duration: 0.4, ease: 'power2.out' }, 0)
        .to(reveal, { opacity: 1, duration: 0.2, ease: 'power2.out' }, 0.1)
        .to(reveal, { y: 0 }, 0.1);
      tl.play(0);
    }

    card.addEventListener('mouseenter', openCard);
    card.addEventListener('mouseleave', closeCard);
    card.addEventListener('focus', openCard);
    card.addEventListener('blur', closeCard);
    // Acessibilidade: fecha ao pressionar Esc
    card.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeCard();
    });
    // Responsivo: ajusta altura ao redimensionar
    window.addEventListener('resize', () => {
      if (!tl.isActive() && card.offsetHeight !== front.offsetHeight) {
        gsap.set(card, { height: front.offsetHeight });
        gsap.set(reveal, { top: front.offsetHeight });
      }
    });
  });
}
