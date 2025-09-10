<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require_once 'PHPMailer/src/Exception.php';
require_once 'PHPMailer/src/PHPMailer.php';
require_once 'PHPMailer/src/SMTP.php';

// Log de erros para arquivo local
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/error_log.txt');
error_reporting(E_ALL);

function logMessage($message)
{
    error_log(date('[Y-m-d H:i:s] ') . $message);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    logMessage('Iniciando processamento de novo formulario');

    // Campos obrigatórios
    $nome     = trim($_POST['contactName'] ?? '');
    $email    = trim($_POST['contactEmail'] ?? '');
    $telefone = trim($_POST['contactPhone'] ?? '');
    $mensagem = trim($_POST['contactMensagem'] ?? '');

    logMessage("Dados recebidos - Nome: {$nome}, Email: {$email}, Telefone: {$telefone}");

    // Campos opcionais
    $cep           = trim($_POST['contactCep'] ?? '');
    $numeroLocal   = trim($_POST['contactNumeroLocal'] ?? '');
    $fabricante    = trim($_POST['contactFabricante'] ?? '');
    $andares       = trim($_POST['contactAndares'] ?? '');
    $qtdElevadores = trim($_POST['contactQtdElevadores'] ?? '');
    $capacidade    = trim($_POST['contactCapacidade'] ?? '');

    // Validação básica
    if ($nome === '' || $email === '' || $telefone === '') {
        logMessage('ERRO: Campos obrigatorios faltando');
        echo "<script>alert('Por favor, preencha todos os campos obrigatórios.'); history.back();</script>";
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        logMessage('ERRO: Email inválido informado: ' . $email);
        echo "<script>alert('Email inválido. Verifique e tente novamente.'); history.back();</script>";
        exit;
    }

    // Monta o corpo do email (texto puro)
    $corpo  = "=== CONTATO VIA SITE ENGIPRO ===\n\n";
    $corpo .= "DADOS DE CONTATO:\n";
    $corpo .= "Nome: {$nome}\n";
    $corpo .= "Email: {$email}\n";
    $corpo .= "Telefone: {$telefone}\n\n";

    if ($cep !== '' || $numeroLocal !== '' || $fabricante !== '' || $andares !== '' || $qtdElevadores !== '' || $capacidade !== '') {
        $corpo .= "INFORMAÇÕES DO EQUIPAMENTO:\n";
        if ($cep !== '')           { $corpo .= "CEP: {$cep}\n"; }
        if ($numeroLocal !== '')   { $corpo .= "Número do Local: {$numeroLocal}\n"; }
        if ($fabricante !== '')    { $corpo .= "Fabricante: {$fabricante}\n"; }
        if ($andares !== '')       { $corpo .= "Número de Andares: {$andares}\n"; }
        if ($qtdElevadores !== '') { $corpo .= "Quantidade de Elevadores: {$qtdElevadores}\n"; }
        if ($capacidade !== '')    { $corpo .= "Capacidade: {$capacidade}\n"; }
        $corpo .= "\n";
    }

    if ($mensagem !== '') {
        $corpo .= "MENSAGEM:\n{$mensagem}\n\n";
    }

    $corpo .= "=== FIM ===";

    // Função para configurar SMTP conforme porta/segurança
    $configureSMTP = function (PHPMailer $mail, string $security, int $port) {
        $mail->isSMTP();
        $mail->Host       = 'smtp.hostinger.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'contato@engipro.com.br';
        $mail->Password   = '@Tonhauol372'; // considere mover para variável de ambiente
        $mail->SMTPSecure = $security;      // PHPMailer::ENCRYPTION_SMTPS ou PHPMailer::ENCRYPTION_STARTTLS
        $mail->Port       = $port;
        $mail->CharSet    = 'UTF-8';
        $mail->Timeout    = 15;
        // Removido setLanguage para evitar dependência de arquivos ausentes
    };

    try {
        $mail = new PHPMailer(true);

        // Debug detalhado opcional via ?debug=1
        $mail->SMTPDebug   = (isset($_GET['debug']) && $_GET['debug'] == '1') ? SMTP::DEBUG_SERVER : SMTP::DEBUG_OFF;
        $mail->Debugoutput = static function ($str, $level) {
            error_log(date('[Y-m-d H:i:s] ') . "SMTP[$level] " . trim($str));
        };

        // Primeira tentativa: SSL/TLS implícito porta 465
        $configureSMTP($mail, PHPMailer::ENCRYPTION_SMTPS, 465);

        // Remetente e destinatário
        $mail->setFrom('contato@engipro.com.br', 'Site Engipro');
        $mail->addAddress('antonio@engipro.com.br', 'Antonio Engipro');
        $mail->addReplyTo($email, $nome);

        // Conteúdo do email
        $mail->isHTML(false);
        $mail->Subject = 'Novo contato via site - ENGIPRO';
        $mail->Body    = $corpo;
        $mail->AltBody = $corpo;

        logMessage('Tentando enviar email via SMTP (465/SSL)');
        try {
            $mail->send();
            logMessage('Email enviado com sucesso para antonio@engipro.com.br');
            echo "<script>alert('Mensagem enviada com sucesso! Entraremos em contato em breve.'); window.location.href='index.html';</script>";
            exit;
        } catch (Exception $e1) {
            // Fallback para STARTTLS/587
            logMessage('Falha no envio via 465/SSL. Tentando 587/STARTTLS. Erro: ' . $mail->ErrorInfo);
            $mail->smtpClose();

            $configureSMTP($mail, PHPMailer::ENCRYPTION_STARTTLS, 587);

            try {
                $mail->send();
                logMessage('Email enviado com sucesso via 587/STARTTLS para antonio@engipro.com.br');
                echo "<script>alert('Mensagem enviada com sucesso! Entraremos em contato em breve.'); window.location.href='index.html';</script>";
                exit;
            } catch (Exception $e2) {
                logMessage('ERRO: Falha ao enviar email via ambos os métodos. Último erro: ' . $mail->ErrorInfo);
                echo "<script>alert('Erro ao enviar mensagem. Tente novamente ou entre em contato por telefone.'); history.back();</script>";
                exit;
            }
        }
    } catch (Exception $e) {
        logMessage('ERRO: Exceção inesperada na configuração/envio: ' . $e->getMessage());
        echo "<script>alert('Erro interno ao preparar o envio. Tente novamente mais tarde.'); history.back();</script>";
        exit;
    }
} else {
    logMessage('ERRO: Acesso direto ao script sem POST');
}
?>
