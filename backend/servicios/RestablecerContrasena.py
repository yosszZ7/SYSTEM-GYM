from ConexionBD import ConectarBD
try:
    from backend.servicios.VerificarTokenRecuperacion import VerificarTokenRecuperacion
except ImportError:
    from servicios.VerificarTokenRecuperacion import VerificarTokenRecuperacion

def RestablecerContrasenaConToken(token, nueva_contrasena, confirmar_contrasena):
    """
    Restablece la contraseña de un usuario validando el token de seguridad.
    Actualiza la tabla Usuario y marca el token como utilizado.
    Retorna: (success, mensaje)
    """
    if not token or not str(token).strip():
        return False, "Token de recuperación no válido."

    if not nueva_contrasena or len(str(nueva_contrasena)) < 6:
        return False, "La nueva contraseña debe tener al menos 6 caracteres."

    if nueva_contrasena != confirmar_contrasena:
        return False, "Las contraseñas no coinciden. Por favor, verifícalas."

    # 1. Verificar validez del token
    valido, info = VerificarTokenRecuperacion(token)
    if not valido:
        return False, info

    id_usuario = info['IdUsuario']
    id_recuperacion = info['IdRecuperacion']

    conexion = None
    try:
        conexion = ConectarBD()
        if conexion is None:
            return False, "No se pudo conectar con la base de datos."

        cursor = conexion.cursor()

        # 2. Ejecutar SpRestablecerContrasena
        cursor.execute("EXEC SpRestablecerContrasena ?, ?", (id_usuario, str(nueva_contrasena)))

        # 3. Marcar el token como usado
        cursor.execute("""
            UPDATE RecuperacionContrasena 
            SET Usado = 1, FechaUso = SYSDATETIME() 
            WHERE IdRecuperacion = ?
        """, (id_recuperacion,))

        conexion.commit()
        return True, "Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."

    except Exception as err:
        return False, f"Error al actualizar la contraseña: {str(err)}"
    finally:
        if conexion:
            conexion.close()
