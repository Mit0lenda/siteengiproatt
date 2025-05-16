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
