from ConexionBD import ConectarBD

def EliminarLogicoUsuario(IdUsuario):
    """
    Desactiva un usuario (baja lógica).
    Retorna: (success, mensaje)
    """
    if not IdUsuario or IdUsuario <= 0:
        return False, "ID de usuario inválido."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpEliminarLogicoUsuario ?", (IdUsuario,))
        Conexion.commit()

        return True, "Usuario desactivado correctamente."

    except Exception as Error:
        return False, f"Error al desactivar usuario: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()
