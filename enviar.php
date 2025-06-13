<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $nome = $_POST['contactName'] ?? '';
  $email = $_POST['contactEmail'] ?? '';
  $telefone = $_POST['contactPhone'] ?? '';
  $mensagem = $_POST['contactMensagem'] ?? '—';

  $destino = "antonio@engipro.com.br";
  $assunto = "Novo contato via site – ENGIPRO";
  $corpo = "Nome: $nome\nEmail: $email\nTelefone: $telefone\nMensagem:\n$mensagem";

  $headers = "From: contato@engipro.com.br\r\n";
  $headers .= "Reply-To: $email\r\n";

  if (mail($destino, $assunto, $corpo, $headers)) {
    echo "<script>alert('Mensagem enviada com sucesso!'); window.location.href='index.html';</script>";
  } else {
    echo "<script>alert('Erro ao enviar. Tente novamente.'); history.back();</script>";
  }
}
?>
