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

    if smtp_server and smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"[GYM SISTEM] Reporte de Error: {nivel} - Módulo {modulo}"
            msg['From'] = smtp_sender
            msg['To'] = smtp_recipient
            
            part = MIMEText(html_body, 'html', 'utf-8')
            msg.attach(part)
            
            server = smtplib.SMTP(smtp_server, smtp_port)
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
