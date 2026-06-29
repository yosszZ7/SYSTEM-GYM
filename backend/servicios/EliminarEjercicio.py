from ConexionBD import ConectarBD

def EliminarEjercicio(IdEjercicio):
    """
    Elimina un ejercicio (solo si no está siendo usado en ninguna rutina).
    Retorna: (success, mensaje)
    """
    if not IdEjercicio or IdEjercicio <= 0:
        return False, "ID de ejercicio inválido."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpEliminarEjercicio ?", (IdEjercicio,))
        Conexion.commit()
        return True, "Ejercicio eliminado correctamente."

    except Exception as Error:
        return False, f"Error al eliminar ejercicio: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()
            