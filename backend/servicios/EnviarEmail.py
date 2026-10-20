import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def EnviarEmailReporteError(id_reporte, modulo, nivel, descripcion, ruta, usuario_reporta, fecha, destinatario=None):
    """
    Intenta enviar un correo electrónico con los detalles del error reportado.
    Si SMTP no está configurado o falla, guarda una previsualización en 'static/emails/'.
    Retorna: (success, mensaje, local_file_path_or_none)
    """
    # 1. Cargar dotenv si está disponible y recuperar variables con fallbacks
    try:
        from dotenv import load_dotenv
        # Buscar el .env en la raiz (dos directorios hacia arriba de backend/servicios)
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        load_dotenv(os.path.join(root_dir, '.env'))
    except Exception:
        pass

    smtp_server = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    try:
        smtp_port = int(os.environ.get('MAIL_PORT', 587))
    except (TypeError, ValueError):
        smtp_port = 587
    smtp_user = os.environ.get('MAIL_USERNAME', 'suarezyostin967@gmail.com')
    smtp_pass = os.environ.get('MAIL_PASSWORD', 'wzgsckdgwbhskyie')
    smtp_sender = os.environ.get('MAIL_DEFAULT_SENDER', 'suarezyostin967@gmail.com')
    smtp_recipient = destinatario if destinatario else os.environ.get('MAIL_ADMIN_RECIPIENT', 'suarezyostin967@gmail.com')
    
    # 2. Cargar CSS dinámicamente desde static/css/style.css extrayendo el bloque de email
    css_content = ""
    try:
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        css_path = os.path.join(root_dir, 'static', 'css', 'style.css')
        if os.path.exists(css_path):
            with open(css_path, 'r', encoding='utf-8') as css_file:
                full_css = css_file.read()
                marker = "/* --- EMAIL STYLES --- */"
                if marker in full_css:
                    css_content = full_css.split(marker)[1].strip()
                else:
                    css_content = full_css
    except Exception as e:
        print(f"No se pudo cargar el CSS desde static: {e}")

    # 3. Generar el contenido HTML del correo
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
{css_content}
        </style>
    </head>
    <body class="email-body">
        <div class="email-card">
            <div class="email-header">
                <h2>⚠️ REPORTE DE ERROR DETECTADO</h2>
            </div>
            <div class="email-content">
                <p>Se ha registrado un nuevo reporte de fallo en <strong>GYM SISTEM</strong> con los siguientes detalles:</p>
                
                <table class="email-meta-table">
                    <tr>
                        <td class="label">ID Reporte</td>
                        <td>#{id_reporte}</td>
                    </tr>
                    <tr>
                        <td class="label">Módulo Afectado</td>
                        <td><strong>{modulo}</strong></td>
                    </tr>
                    <tr>
                        <td class="label">Prioridad / Nivel</td>
                        <td>
                            <span class="email-badge email-badge-{nivel.lower()}">{nivel}</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="label">Reportado por</td>
                        <td>{usuario_reporta}</td>
                    </tr>
                    <tr>
                        <td class="label">Fecha y Hora</td>
                        <td>{fecha}</td>
                    </tr>
                </table>
                
                <h3 style="margin-top: 20px; color: #0f172a; font-size: 15px;">Descripción del Error:</h3>
                <div class="email-desc-box">{descripcion}</div>
            </div>
            <div class="email-footer">
                Este correo fue autogenerado por el sistema de soporte técnico de GYM SISTEM.
            </div>
        </div>
    </body>
    </html>
    """

    # Render bloquea puertos SMTP en el plan gratuito. Si estamos en Render, omitimos SMTP directo para evitar timeouts.
    es_render = os.environ.get('RENDER') == 'true'
    
    if smtp_server and smtp_user and smtp_pass and not es_render:
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"[GYM SISTEM] Reporte de Error: {nivel} - Módulo {modulo}"
            msg['From'] = smtp_sender
            msg['To'] = smtp_recipient
            
            part = MIMEText(html_body, 'html', 'utf-8')
            msg.attach(part)
            
            # Establecemos un timeout corto de 3 segundos para evitar colgar la petición
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=3)
            if smtp_port == 587:
                server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_sender, [smtp_recipient], msg.as_string())
            server.quit()
            
            return True, "Notificación enviada exitosamente por correo al administrador.", None
        except Exception as smtp_err:
            print(f"Fallo de envío SMTP real, se procede a la simulación local: {smtp_err}")
            
    try:
        email_dir = os.path.join('static', 'emails')
        if not os.path.exists(email_dir):
            os.makedirs(email_dir)
            
        file_name = f"reporte_error_{id_reporte}.html"
        file_path = os.path.join(email_dir, file_name)
        
        with open(file_path, 'w', encoding='utf-8') as email_file:
            email_file.write(html_body)
            
        relative_path = f"/static/emails/{file_name}"
        return True, f"SMTP no configurado/offline. Reporte guardado y correo simulado en: {relative_path}", relative_path
    except Exception as io_err:
        return False, f"Error al generar la simulación local del correo: {str(io_err)}", None


def EnviarEmailRecuperacionContrasena(destinatario, nombre_usuario, enlace_recuperacion, codigo):
    """
    Envía un correo electrónico con el enlace y código para restablecer la contraseña.
    Si SMTP falla o está en Render, guarda una previsualización en 'static/emails/'.
    Retorna: (success, mensaje, local_file_path_or_none)
    """
    try:
        from dotenv import load_dotenv
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        load_dotenv(os.path.join(root_dir, '.env'))
    except Exception:
        pass

    smtp_server = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    try:
        smtp_port = int(os.environ.get('MAIL_PORT', 587))
    except (TypeError, ValueError):
        smtp_port = 587
    smtp_user = os.environ.get('MAIL_USERNAME', 'suarezyostin967@gmail.com')
    smtp_pass = os.environ.get('MAIL_PASSWORD', 'wzgsckdgwbhskyie')
    smtp_sender = os.environ.get('MAIL_DEFAULT_SENDER', 'suarezyostin967@gmail.com')

    html_body = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de Contraseña - WORLD GYM</title>
    <style>
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #FAF1E6;
            margin: 0;
            padding: 30px 15px;
            color: #4A3728;
        }}
        .email-container {{
            max-width: 540px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 18px;
            border: 1px solid #EFE6DC;
            box-shadow: 0 10px 30px rgba(74, 55, 40, 0.08);
            overflow: hidden;
        }}
        .email-header {{
            background: linear-gradient(135deg, #4A3728 0%, #302116 100%);
            padding: 28px 24px;
            text-align: center;
        }}
        .email-header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            color: #FFFFFF;
            letter-spacing: -0.5px;
        }}
        .email-header h1 span {{
            color: #F28C28;
        }}
        .email-header p {{
            margin: 4px 0 0 0;
            color: #D1C4B5;
            font-size: 13px;
        }}
        .email-body-content {{
            padding: 32px 28px;
        }}
        .email-greeting {{
            font-size: 18px;
            font-weight: 700;
            color: #4A3728;
            margin-bottom: 12px;
        }}
        .email-text {{
            font-size: 14.5px;
            line-height: 1.6;
            color: #6B5545;
            margin-bottom: 22px;
        }}
        .btn-action-container {{
            text-align: center;
            margin: 28px 0;
        }}
        .btn-action {{
            display: inline-block;
            background: linear-gradient(135deg, #F28C28 0%, #D77218 100%);
            color: #FFFFFF !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
            box-shadow: 0 4px 14px rgba(242, 140, 40, 0.35);
        }}
        .code-box {{
            background: #FFFDF9;
            border: 1.5px dashed #F28C28;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            margin: 22px 0;
        }}
        .code-box span {{
            display: block;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 700;
            color: #8B6F5A;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }}
        .code-box strong {{
            font-size: 26px;
            letter-spacing: 6px;
            color: #F28C28;
            font-family: monospace;
        }}
        .security-note {{
            background: #FDF8F3;
            border-left: 4px solid #F28C28;
            padding: 12px 14px;
            border-radius: 6px;
            font-size: 12.5px;
            color: #7A5F4B;
            line-height: 1.5;
            margin-top: 24px;
        }}
        .email-footer {{
            background: #FAF1E6;
            padding: 18px 24px;
            text-align: center;
            border-top: 1px solid #EFE6DC;
            font-size: 12px;
            color: #8B6F5A;
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>WORLD <span>GYM</span></h1>
            <p>Sistema de Gestión Fitness</p>
        </div>
        <div class="email-body-content">
            <div class="email-greeting">¡Hola, {nombre_usuario}!</div>
            <p class="email-text">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>WORLD GYM</strong>.
                Para crear una nueva contraseña y recuperar tu acceso, haz clic en el siguiente botón:
            </p>
            <div class="btn-action-container">
                <a href="{enlace_recuperacion}" class="btn-action" target="_blank">
                    Restablecer mi Contraseña
                </a>
            </div>
            <div class="code-box">
                <span>Tu código de verificación de 6 dígitos</span>
                <strong>{codigo}</strong>
            </div>
            <div class="security-note">
                ⏱️ <strong>Importante:</strong> Este enlace y código son válidos durante <strong>30 minutos</strong>. Si tú no realizaste esta solicitud, puedes ignorar este mensaje de forma segura; tu contraseña actual no será modificada.
            </div>
        </div>
        <div class="email-footer">
            WORLD GYM &bull; Notificación Oficial de Seguridad &bull; Managua, Nicaragua
        </div>
    </div>
</body>
</html>"""

    es_render = os.environ.get('RENDER') == 'true'
    
    if smtp_server and smtp_user and smtp_pass and not es_render:
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "🔐 [WORLD GYM] Restablece tu contraseña"
            msg['From'] = smtp_sender
            msg['To'] = destinatario
            
            part = MIMEText(html_body, 'html', 'utf-8')
            msg.attach(part)
            
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=4)
            if smtp_port == 587:
                server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_sender, [destinatario], msg.as_string())
            server.quit()
            
            return True, "Enlace e instrucciones de recuperación enviadas a tu correo electrónico.", None
        except Exception as smtp_err:
            print(f"Envío SMTP falló, se procede a guardar previsualización local: {smtp_err}")

    # Fallback local preview (útil para pruebas y Render)
    try:
        email_dir = os.path.join('static', 'emails')
        if not os.path.exists(email_dir):
            os.makedirs(email_dir)
            
        file_name = f"recuperacion_{codigo}.html"
        file_path = os.path.join(email_dir, file_name)
        
        with open(file_path, 'w', encoding='utf-8') as email_file:
            email_file.write(html_body)
            
        relative_path = f"/static/emails/{file_name}"
        return True, "Instrucciones de recuperación generadas correctamente.", relative_path
    except Exception as io_err:
        return False, f"Error al generar correo de recuperación: {str(io_err)}", None

