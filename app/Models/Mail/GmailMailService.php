<?php

namespace App\Models\Mail;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/**
 * Gmail Mail Service - Envía correos usando Gmail SMTP con PHPMailer
 * 
 * Optimizado para evitar SPAM y llegar a la bandeja de entrada
 * Usa configuración profesional de SMTP TLS
 */
class GmailMailService
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
     * Envía correo genérico usando Gmail SMTP
     */
    public function send(string $toEmail, string $toName, string $subject, string $htmlContent): bool
    {
        try {
            $mail = new PHPMailer(true);

            // Servidor SMTP
            $mail->isSMTP();
            $mail->Host = $this->smtpHost;
            $mail->SMTPAuth = true;
            $mail->Username = $this->smtpUsername;
            $mail->Password = $this->smtpPassword;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $this->smtpPort;

            // Timeouts
            $mail->Timeout = 10;
            $mail->SMTPKeepAlive = true;

            // Remitente
            $mail->setFrom($this->fromEmail, $this->fromName);
            $mail->addReplyTo($this->fromEmail, $this->fromName);

            // Destinatario
            $mail->addAddress($toEmail, $toName);

            // Contenido
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $htmlContent;
            $mail->CharSet = 'UTF-8';

            // Headers adicionales para evitar SPAM
            $mail->addCustomHeader('X-Priority', '3');
            $mail->addCustomHeader('X-Mailer', 'PHPMailer/PARCE');

            // Enviar
            $result = $mail->send();

            if ($result) {
                error_log("Email sent successfully via Gmail to $toEmail");
                return true;
            }

            error_log("Gmail send failed: " . $mail->ErrorInfo);
            return false;

        } catch (Exception $e) {
            error_log("Gmail Mail Service Error: " . $e->getMessage());
            return false;
        } catch (\Exception $e) {
            error_log("Gmail Mail Service Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Template HTML para correo de recuperación de contraseña
     */
    private function getPasswordResetEmailTemplate(string $name, string $resetLink): string
    {
        $escapedName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
        $escapedLink = htmlspecialchars($resetLink, ENT_QUOTES, 'UTF-8');

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; font-weight: bold; letter-spacing: -0.5px; }
        .header-subtitle { font-size: 14px; margin-top: 8px; opacity: 0.9; }
        .content { padding: 50px 30px; color: #333; }
        .greeting { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1a1a2e; }
        .message { font-size: 15px; line-height: 1.8; color: #666; margin-bottom: 35px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #d4a574 0%, #c29560 100%); color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 30px 0; text-align: center; border: none; cursor: pointer; font-size: 16px; box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3); transition: transform 0.2s; }
        .cta-button:hover { transform: translateY(-2px); }
        .link-section { background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #d4a574; }
        .link-label { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; font-weight: 600; }
        .link-text { font-size: 12px; word-break: break-all; color: #0066cc; font-family: 'Courier New', monospace; background: #fff; padding: 12px; border-radius: 4px; overflow-x: auto; }
        .footer { background-color: #f5f5f5; padding: 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; }
        .security-note { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 18px; margin: 30px 0; border-radius: 6px; font-size: 13px; color: #856404; line-height: 1.6; }
        .divider { height: 1px; background-color: #e0e0e0; margin: 20px 0; }
        .footer p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>P.A.R.C.E</h1>
            <p class="header-subtitle">Plataforma de Asistencia Rápida para Conductores en Emergencia</p>
        </div>

        <div class="content">
            <div class="greeting">¡Hola {$escapedName}!</div>

            <div class="message">
                Recibimos una solicitud para recuperar tu contraseña en P.A.R.C.E. 
                Haz clic en el botón de abajo para establecer una nueva contraseña segura.
            </div>

            <center>
                <a href="{$escapedLink}" class="cta-button">Recuperar Contraseña</a>
            </center>

            <div class="link-section">
                <div class="link-label">O copia este enlace:</div>
                <div class="link-text">{$escapedLink}</div>
            </div>

            <div class="divider"></div>

            <div class="security-note">
                <strong>🔒 Nota de Seguridad:</strong><br>
                Este enlace expirará en 24 horas. Si no solicitaste esta recuperación, 
                ignora este correo y tu contraseña permanecerá sin cambios. 
                Nunca compartamos tu contraseña por correo.
            </div>

            <div class="message" style="font-size: 13px; color: #999;">
                <strong>Pasos a seguir:</strong>
                <ol style="margin: 10px 0; padding-left: 20px;">
                    <li>Haz clic en "Recuperar Contraseña"</li>
                    <li>Ingresa tu nueva contraseña</li>
                    <li>Confirma tu nueva contraseña</li>
                    <li>¡Listo! Inicia sesión con tu nueva contraseña</li>
                </ol>
            </div>
        </div>

        <div class="footer">
            <p><strong>P.A.R.C.E</strong></p>
            <p>© 2026 - Plataforma de Asistencia Rápida para Conductores en Emergencia</p>
            <p style="margin-top: 15px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
                Si tienes preguntas, responde a este correo o contáctanos a support@parcedemo.local
            </p>
        </div>
    </div>
</body>
</html>
HTML;
    }
}
