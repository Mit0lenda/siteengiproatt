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

// Envia notificação para Telegram, se variáveis de ambiente estiverem configuradas
function notifyTelegram(string $text): bool
{
    $token  = getenv('TELEGRAM_BOT_TOKEN') ?: '';
    $chatId = getenv('TELEGRAM_CHAT_ID') ?: '';
    if ($token === '' || $chatId === '') {
        return false;
    }
    $url = "https://api.telegram.org/bot{$token}/sendMessage";
    $payload = http_build_query([
        'chat_id' => $chatId,
        'text' => $text,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => 'true',
    ]);
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => $payload,
            'timeout' => 10,
        ]
    ]);
    $result = @file_get_contents($url, false, $ctx);
    return $result !== false;
}

// Armazena submissão em CSV em caso de falha
function storeSubmissionCSV(array $row): void
{
    $dir = __DIR__ . '/storage';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    $file = $dir . '/submissions.csv';
    $isNew = !file_exists($file);
    $fp = @fopen($file, 'a');
    if ($fp === false) {
        logMessage('ERRO: não foi possível abrir o CSV para gravação');
        return;
    }
    if (flock($fp, LOCK_EX)) {
        if ($isNew) {
            fputcsv($fp, array_keys($row));
        }
        fputcsv($fp, array_values($row));
        flock($fp, LOCK_UN);
    }
    fclose($fp);
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
    $alertText = $corpo;

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

        // Primeira tentativa: STARTTLS na porta 587 (mais comum em hospedagens)
        $configureSMTP($mail, PHPMailer::ENCRYPTION_STARTTLS, 587);

        // Remetente e destinatário
        $mail->setFrom('contato@engipro.com.br', 'Site Engipro');
        $mail->Sender = 'contato@engipro.com.br'; // envelope-from
        $mail->addAddress('antonio@engipro.com.br', 'Antonio Engipro');
        $mail->addReplyTo($email, $nome);

        // Conteúdo do email
        $mail->isHTML(false);
        $mail->Subject = 'Novo contato via site - ENGIPRO';
        $mail->Body    = $corpo;
        $mail->AltBody = $corpo;

        logMessage('Tentando enviar email via SMTP (587/STARTTLS)');
        try {
            $mail->send();
            logMessage('Email enviado com sucesso para antonio@engipro.com.br');
            if (notifyTelegram("Novo contato via site ENGIPRO\n" . $alertText)) {
                logMessage('Telegram notificado com sucesso');
            } else {
                logMessage('Telegram não configurado ou falhou');
            }
            echo "<script>alert('Mensagem enviada com sucesso! Entraremos em contato em breve.'); window.location.href='index.html';</script>";
            exit;
        } catch (Exception $e1) {
            // Fallback para SSL/TLS implícito na 465
            logMessage('Falha no envio via 587/STARTTLS. Tentando 465/SSL. Erro: ' . $mail->ErrorInfo);
            $mail->smtpClose();
            $configureSMTP($mail, PHPMailer::ENCRYPTION_SMTPS, 465);

            try {
                $mail->send();
                logMessage('Email enviado com sucesso via 465/SSL para antonio@engipro.com.br');
                if (notifyTelegram("Novo contato via site ENGIPRO\n" . $alertText)) {
                    logMessage('Telegram notificado com sucesso');
                } else {
                    logMessage('Telegram não configurado ou falhou');
                }
                echo "<script>alert('Mensagem enviada com sucesso! Entraremos em contato em breve.'); window.location.href='index.html';</script>";
                exit;
            } catch (Exception $e2) {
                logMessage('ERRO: Falha ao enviar email via ambos os métodos. Último erro: ' . $mail->ErrorInfo);
                // Registrar submissão local e tentar notificar Telegram
                storeSubmissionCSV([
                    'timestamp' => date('c'),
                    'nome' => $nome,
                    'email' => $email,
                    'telefone' => $telefone,
                    'cep' => $cep,
                    'numeroLocal' => $numeroLocal,
                    'fabricante' => $fabricante,
                    'andares' => $andares,
                    'qtdElevadores' => $qtdElevadores,
                    'capacidade' => $capacidade,
                    'mensagem' => $mensagem,
                ]);
                notifyTelegram("Falha no envio por email. Nova submissão armazenada localmente.\n" . $alertText);
                echo "<script>alert('Erro ao enviar mensagem. Tente novamente ou entre em contato por telefone.'); history.back();</script>";
                exit;
            }
        }
    } catch (Exception $e) {
        logMessage('ERRO: Exceção inesperada na configuração/envio: ' . $e->getMessage());
        storeSubmissionCSV([
            'timestamp' => date('c'),
            'nome' => $nome,
            'email' => $email,
            'telefone' => $telefone,
            'cep' => $cep,
            'numeroLocal' => $numeroLocal,
            'fabricante' => $fabricante,
            'andares' => $andares,
            'qtdElevadores' => $qtdElevadores,
            'capacidade' => $capacidade,
            'mensagem' => $mensagem,
        ]);
        notifyTelegram("Exceção ao preparar envio. Submissão armazenada localmente.\n" . $alertText);
        echo "<script>alert('Erro interno ao preparar o envio. Tente novamente mais tarde.'); history.back();</script>";
        exit;
    }
} else {
    logMessage('ERRO: Acesso direto ao script sem POST');
}
?>
