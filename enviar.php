<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // Campos obrigatórios
  $nome = $_POST['contactName'] ?? '';
  $email = $_POST['contactEmail'] ?? '';
  $telefone = $_POST['contactPhone'] ?? '';
  $mensagem = $_POST['contactMensagem'] ?? '';
  
  // Campos opcionais
  $cep = $_POST['contactCep'] ?? '';
  $numeroLocal = $_POST['contactNumeroLocal'] ?? '';
  $fabricante = $_POST['contactFabricante'] ?? '';
  $andares = $_POST['contactAndares'] ?? '';
  $qtdElevadores = $_POST['contactQtdElevadores'] ?? '';
  $capacidade = $_POST['contactCapacidade'] ?? '';

  // Validação básica
  if (empty($nome) || empty($email) || empty($telefone)) {
    echo "<script>alert('Por favor, preencha todos os campos obrigatórios.'); history.back();</script>";
    exit;
  }

  $destino = "antonio@engipro.com.br";
  $assunto = "Novo contato via site – ENGIPRO";
  
  // Monta o corpo do email
  $corpo = "=== CONTATO VIA SITE ENGIPRO ===\n\n";
  $corpo .= "DADOS DE CONTATO:\n";
  $corpo .= "Nome: $nome\n";
  $corpo .= "Email: $email\n";
  $corpo .= "Telefone: $telefone\n\n";
  
  if (!empty($cep) || !empty($numeroLocal) || !empty($fabricante) || !empty($andares) || !empty($qtdElevadores) || !empty($capacidade)) {
    $corpo .= "INFORMAÇÕES DO EQUIPAMENTO:\n";
    if (!empty($cep)) $corpo .= "CEP: $cep\n";
    if (!empty($numeroLocal)) $corpo .= "Número do Local: $numeroLocal\n";
    if (!empty($fabricante)) $corpo .= "Fabricante: $fabricante\n";
    if (!empty($andares)) $corpo .= "Número de Andares: $andares\n";
    if (!empty($qtdElevadores)) $corpo .= "Quantidade de Elevadores: $qtdElevadores\n";
    if (!empty($capacidade)) $corpo .= "Capacidade: $capacidade\n";
    $corpo .= "\n";
  }
  
  if (!empty($mensagem)) {
    $corpo .= "MENSAGEM:\n$mensagem\n\n";
  }
  
  $corpo .= "=== FIM ===";

  $headers = "From: contato@engipro.com.br\r\n";
  $headers .= "Reply-To: $email\r\n";
  $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

  if (mail($destino, $assunto, $corpo, $headers)) {
    echo "<script>alert('Mensagem enviada com sucesso! Entraremos em contato em breve.'); window.location.href='index.html';</script>";
  } else {
    echo "<script>alert('Erro ao enviar mensagem. Tente novamente ou entre em contato por telefone.'); history.back();</script>";
  }
}
?>
