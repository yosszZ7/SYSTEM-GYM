from ConexionBD import ConectarBD

def MarcarTodasLeidas():
    """
    Marca todas las notificaciones como leídas en la base de datos.
    Retorna: (success, mensaje)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpMarcarTodasLeidas")
        Conexion.commit()
        return True, "Todas las notificaciones marcadas como leídas."
    except Exception as e:
        return False, f"Error al marcar notificaciones como leídas: {str(e)}"
    finally:
        if Conexion:
            Conexion.close()
