<?php

namespace App\Models\Mail;

/**
 * Mail Service - Envía correos usando Gmail API vía SMTP TLS
 * Funciona en Windows + Apache + XAMPP
 */
class MailService
{
    private string $smtpHost;
    private int $smtpPort;
    private string $smtpUsername;
    private string $smtpPassword;
    private string $fromEmail;
    private string $fromName;

    public function __construct()
    {
        $this->smtpHost = $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com';
        $this->smtpPort = (int)($_ENV['SMTP_PORT'] ?? 587);
        $this->smtpUsername = $_ENV['SMTP_USERNAME'] ?? '';
        $this->smtpPassword = $_ENV['SMTP_PASSWORD'] ?? '';
        $this->fromEmail = $_ENV['SMTP_FROM_EMAIL'] ?? '';
        $this->fromName = $_ENV['SMTP_FROM_NAME'] ?? 'P.A.R.C.E Platform';

        if (empty($this->smtpUsername) || empty($this->smtpPassword)) {
            throw new \Exception('Credenciales SMTP no configuradas: SMTP_USERNAME y SMTP_PASSWORD requeridos');
        }
    }

    /**
     * Envía correo de recuperación de contraseña
     */
    public function sendPasswordResetEmail(string $toEmail, string $toName, string $resetToken): bool
    {
        $resetLink = ($_ENV['APP_URL'] ?? 'http://localhost:5173') . "/reset-password?token={$resetToken}";
        $html = $this->getPasswordResetEmailTemplate($toName, $resetLink);

        return $this->send(
            $toEmail,
            $toName,
            'Recuperar tu contraseña - P.A.R.C.E',
            $html
        );
    }

    /**
     * Envía correo genérico usando SMTP con TLS
     */
    public function send(string $toEmail, string $toName, string $subject, string $htmlContent): bool
    {
        try {
            // Conectar a SMTP con TLS
            $context = stream_context_create([
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true,
                ]
            ]);

            $socket = @stream_socket_client(
                "tcp://{$this->smtpHost}:{$this->smtpPort}",
                $errno,
                $errstr,
                10,
                STREAM_CLIENT_CONNECT,
                $context
            );

            if (!$socket) {
                error_log("SMTP Connection failed: $errstr ($errno)");
                return false;
            }

            // Leer respuesta inicial del servidor
            $response = fgets($socket, 1024);
            if (strpos($response, '220') === false) {
                error_log("SMTP Server error: $response");
                fclose($socket);
                return false;
            }

            // EHLO
            fwrite($socket, "EHLO localhost\r\n");
            $this->readResponse($socket);

            // STARTTLS
            fwrite($socket, "STARTTLS\r\n");
            $response = fgets($socket, 1024);
            if (strpos($response, '220') === false) {
                error_log("STARTTLS failed: $response");
                fclose($socket);
                return false;
            }

            // Iniciar TLS
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                error_log("TLS negotiation failed");
                fclose($socket);
                return false;
            }

            // EHLO después de TLS
            fwrite($socket, "EHLO localhost\r\n");
            $this->readResponse($socket);

            // AUTH LOGIN
            fwrite($socket, "AUTH LOGIN\r\n");
            fgets($socket, 1024);

            // Usuario (base64)
            fwrite($socket, base64_encode($this->smtpUsername) . "\r\n");
            fgets($socket, 1024);

            // Contraseña (base64)
            fwrite($socket, base64_encode($this->smtpPassword) . "\r\n");
            $response = fgets($socket, 1024);
            if (strpos($response, '235') === false) {
                error_log("SMTP Authentication failed");
                fclose($socket);
                return false;
            }

            // MAIL FROM
            fwrite($socket, "MAIL FROM:<{$this->fromEmail}>\r\n");
            $this->readResponse($socket);

            // RCPT TO
            fwrite($socket, "RCPT TO:<{$toEmail}>\r\n");
            $this->readResponse($socket);

            // DATA
            fwrite($socket, "DATA\r\n");
            fgets($socket, 1024);

            // Construir mensaje
            $message = "From: {$this->fromName} <{$this->fromEmail}>\r\n";
            $message .= "To: {$toName} <{$toEmail}>\r\n";
            $message .= "Subject: {$subject}\r\n";
            $message .= "MIME-Version: 1.0\r\n";
            $message .= "Content-Type: text/html; charset=UTF-8\r\n";
            $message .= "\r\n";
            $message .= $htmlContent;
            $message .= "\r\n.\r\n";

            fwrite($socket, $message);
            $response = fgets($socket, 1024);

            if (strpos($response, '250') === false) {
                error_log("SMTP send failed: $response");
                fclose($socket);
                return false;
            }

            // QUIT
            fwrite($socket, "QUIT\r\n");
            fclose($socket);

            error_log("Email sent successfully to $toEmail");
            return true;

        } catch (\Exception $e) {
            error_log("Mail Service Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Lee respuesta SMTP multi-línea
     */
    private function readResponse($socket): string
    {
        $response = '';
        while ($line = fgets($socket, 1024)) {
            $response .= $line;
            if (substr($line, 3, 1) === ' ') {
                break;
            }
        }
        return $response;
    }

    /**
     * Template HTML para correo de recuperación de contraseña
     */
    private function getPasswordResetEmailTemplate(string $name, string $resetLink): string
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #fff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .content {
            padding: 40px 30px;
            color: #333;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .message {
            font-size: 14px;
            line-height: 1.6;
            color: #666;
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            background-color: #d4a574;
            color: white;
            padding: 14px 40px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin: 20px 0;
            transition: background-color 0.3s;
        }
        .cta-button:hover {
            background-color: #c29560;
        }
        .link-section {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .link-label {
            font-size: 12px;
            color: #999;
            margin-bottom: 10px;
        }
        .link-text {
            font-size: 13px;
            word-break: break-all;
            color: #0066cc;
            font-family: monospace;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #e0e0e0;
        }
        .security-note {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 13px;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>P.A.R.C.E</h1>
            <p style="margin: 10px 0 0 0;">Recuperación de Contraseña</p>
        </div>

        <div class="content">
            <div class="greeting">
                ¡Hola {$name}!
            </div>

            <div class="message">
                Recibimos una solicitud para recuperar tu contraseña. Haz clic en el botón de abajo para establecer una nueva contraseña.
            </div>

            <a href="{$resetLink}" class="cta-button">Recuperar Contraseña</a>

            <div class="link-section">
                <div class="link-label">O copia este enlace en tu navegador:</div>
                <div class="link-text">{$resetLink}</div>
            </div>

            <div class="security-note">
                <strong>⚠️ Nota de Seguridad:</strong> Este enlace expirará en 24 horas. Si no solicitaste esta recuperación, ignora este correo. Tu contraseña no ha sido modificada.
            </div>

            <div class="message">
                <strong>Pasos a seguir:</strong>
                <ol style="margin: 10px 0; padding-left: 20px;">
                    <li>Haz clic en el botón "Recuperar Contraseña" o copia el enlace</li>
                    <li>Ingresa tu nueva contraseña</li>
                    <li>Confirma tu nueva contraseña</li>
                    <li>¡Listo! Podrás iniciar sesión con tu nueva contraseña</li>
                </ol>
            </div>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                © 2026 P.A.R.C.E - Plataforma de Asistencia Rápida para Conductores en Emergencia
            </p>
            <p style="margin: 5px 0 0 0; color: #bbb;">
                Si tienes preguntas, contáctanos a support@parcedemo.local
            </p>
        </div>
    </div>
</body>
</html>
HTML;
    }
}
