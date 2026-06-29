from ConexionBD import ConectarBD

def FinalizarRutinaCliente(IdCliente, FechaFinManual=None):
    """
    Finaliza manualmente la rutina activa del cliente.
    Si no se especifica FechaFinManual, se usa la fecha actual.
    Retorna: (success, mensaje)
    """
    if not IdCliente or IdCliente <= 0:
        return False, "ID de cliente inválido."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpFinalizarRutinaCliente ?, ?", (IdCliente, FechaFinManual))
        Conexion.commit()
        return True, "Rutina finalizada correctamente."

    except Exception as Error:
        return False, f"Error al finalizar rutina: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()