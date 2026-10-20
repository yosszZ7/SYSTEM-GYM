import secrets
import random
from datetime import datetime, timedelta
from ConexionBD import ConectarBD
try:
    from backend.servicios.EnviarEmail import EnviarEmailRecuperacionContrasena
except ImportError:
    from servicios.EnviarEmail import EnviarEmailRecuperacionContrasena

def SolicitarRecuperacionContrasena(dato_busqueda, base_url=""):
    """
    Procesa la solicitud de recuperación de contraseña (HU-003).
    Valida el usuario o correo, previene abusos con rate-limiting,
    genera un token seguro de 30 minutos y envía el correo con enlace y código.
    Retorna: (success, mensaje, preview_url_or_none)
    """
    if not dato_busqueda or not str(dato_busqueda).strip():
        return False, "Por favor, ingresa tu correo electrónico o nombre de usuario.", None

    valor = str(dato_busqueda).strip()
    conexion = None
    try:
        conexion = ConectarBD()
        if conexion is None:
            return False, "No se pudo conectar con la base de datos.", None

        cursor = conexion.cursor()

        # 1. Buscar el usuario activo por correo (Cliente/Empleado) o por NombreUsuario
        query_usuario = """
            SELECT TOP 1 
                u.IdUsuario, 
                u.NombreUsuario, 
                COALESCE(c.Correo, e.Correo) AS CorreoAsociado,
                COALESCE(c.PrimerNombre + ' ' + c.PrimerApellido, e.PrimerNombre + ' ' + e.PrimerApellido, u.NombreUsuario) AS NombreCompleto
            FROM Usuario u
            LEFT JOIN Cliente c ON u.IdCliente = c.IdCliente
            LEFT JOIN Empleado e ON u.IdEmpleado = e.IdEmpleado
            WHERE u.Estado = 1 AND (c.Correo = ? OR e.Correo = ? OR u.NombreUsuario = ?)
        """
        cursor.execute(query_usuario, (valor, valor, valor))
        fila = cursor.fetchone()

        if not fila:
            # Criterio 2: "No se encontró ninguna cuenta asociada a los datos proporcionados."
            return False, "No se encontró ninguna cuenta asociada a los datos proporcionados.", None

        id_usuario = fila[0]
        nombre_usuario = fila[1]
        correo_destino = fila[2]
        nombre_persona = fila[3] or nombre_usuario

        # Si el correo asociado está vacío pero el nombre de usuario tiene formato de correo
        if not correo_destino and '@' in nombre_usuario:
            correo_destino = nombre_usuario

        if not correo_destino:
            return False, "Tu cuenta no tiene un correo electrónico registrado. Por favor contacta a la administración.", None

        # 2. Control de intentos para evitar abusos (Must Have HU-003)
        # Límite: máximo 3 solicitudes cada 15 minutos
        query_rate_limit = """
            SELECT COUNT(*) 
            FROM RecuperacionContrasena
            WHERE IdUsuario = ? AND FechaCreacion >= DATEADD(minute, -15, SYSDATETIME())
        """
        cursor.execute(query_rate_limit, (id_usuario,))
        intentos_recientes = cursor.fetchone()[0] or 0

        if intentos_recientes >= 3:
            return False, "Has alcanzado el límite de intentos permitidos. Por seguridad, espera 15 minutos antes de volver a intentarlo.", None

        # 3. Generar Token seguro criptográfico y código numérico de 6 dígitos
        token = secrets.token_urlsafe(32)
        codigo = f"{random.randint(100000, 999999)}"
        fecha_expiracion = datetime.now() + timedelta(minutes=30)

        # Invalidar tokens activos anteriores del mismo usuario
        cursor.execute("UPDATE RecuperacionContrasena SET Usado = 1 WHERE IdUsuario = ? AND Usado = 0", (id_usuario,))

        # Registrar el nuevo token en la BD
        query_insert = """
            INSERT INTO RecuperacionContrasena (IdUsuario, Correo, Token, Codigo, FechaExpiracion, Usado, Intentos)
            VALUES (?, ?, ?, ?, ?, 0, 0)
        """
        cursor.execute(query_insert, (id_usuario, correo_destino, token, codigo, fecha_expiracion))
        conexion.commit()

        # 4. Construir enlace completo
        if not base_url:
            base_url = "http://localhost:5000"
        enlace_restablecer = f"{base_url.rstrip('/')}/restablecer_contrasena/{token}"

        # 5. Enviar correo electrónico
        exito_email, msg_email, preview_url = EnviarEmailRecuperacionContrasena(
            destinatario=correo_destino,
            nombre_usuario=nombre_persona,
            enlace_recuperacion=enlace_restablecer,
            codigo=codigo
        )

        return True, "Se han enviado las instrucciones de recuperación a tu correo electrónico.", preview_url

    except Exception as err:
        return False, f"Error al procesar la solicitud de recuperación: {str(err)}", None
    finally:
        if conexion:
            conexion.close()
