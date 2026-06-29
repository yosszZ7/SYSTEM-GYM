from ConexionBD import ConectarBD

def ExtenderRutinaCliente(IdCliente, DiasExtra):
    """
    Extiende la duración de la rutina activa sumando días a la fecha fin actual.
    Retorna: (success, mensaje)
    """
    if not IdCliente or IdCliente <= 0:
        return False, "ID de cliente inválido."
    if not DiasExtra or DiasExtra <= 0:
        return False, "Los días a extender deben ser mayores a 0."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpExtenderRutinaCliente ?, ?", (IdCliente, DiasExtra))
        Conexion.commit()
        return True, "Rutina extendida correctamente."

    except Exception as Error:
        return False, f"Error al extender rutina: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()