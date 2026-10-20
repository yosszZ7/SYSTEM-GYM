from ConexionBD import ConectarBD

def VerificarTokenRecuperacion(token):
    """
    Verifica si un token de recuperación es válido, no ha sido usado y no ha expirado.
    Retorna: (success, datos_o_error)
    """
    if not token or not str(token).strip():
        return False, "Token de recuperación no proporcionado."

    conexion = None
    try:
        conexion = ConectarBD()
        if conexion is None:
            return False, "No se pudo conectar con la base de datos."

        cursor = conexion.cursor()
        query = """
            SELECT 
                r.IdRecuperacion,
                r.IdUsuario,
                r.Correo,
                r.Codigo,
                r.FechaExpiracion,
                r.Usado,
                u.NombreUsuario,
                COALESCE(c.PrimerNombre + ' ' + c.PrimerApellido, e.PrimerNombre + ' ' + e.PrimerApellido, u.NombreUsuario) AS NombreCompleto
            FROM RecuperacionContrasena r
            INNER JOIN Usuario u ON r.IdUsuario = u.IdUsuario
            LEFT JOIN Cliente c ON u.IdCliente = c.IdCliente
            LEFT JOIN Empleado e ON u.IdEmpleado = e.IdEmpleado
            WHERE r.Token = ?
        """
        cursor.execute(query, (str(token).strip(),))
        fila = cursor.fetchone()

        if not fila:
            return False, "El enlace de recuperación no es válido o no existe."

        id_recuperacion, id_usuario, correo, codigo, fecha_exp, usado, nombre_usuario, nombre_completo = fila

        if usado:
            return False, "Este enlace de recuperación ya fue utilizado previamente. Si necesitas restablecer tu contraseña nuevamente, solicita un nuevo enlace."

        # Verificar si expiró
        cursor.execute("SELECT CASE WHEN ? < SYSDATETIME() THEN 1 ELSE 0 END", (fecha_exp,))
        ha_expirado = cursor.fetchone()[0]
        if ha_expirado:
            return False, "Este enlace de recuperación ha expirado por tiempo de seguridad (máximo 30 minutos). Por favor solicita uno nuevo."

        datos = {
            'IdRecuperacion': id_recuperacion,
            'IdUsuario': id_usuario,
            'Correo': correo,
            'Codigo': codigo,
            'NombreUsuario': nombre_usuario,
            'NombreCompleto': nombre_completo or nombre_usuario
        }
        return True, datos

    except Exception as err:
        return False, f"Error al verificar el token de recuperación: {str(err)}"
    finally:
        if conexion:
            conexion.close()
