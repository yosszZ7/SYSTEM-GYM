from ConexionBD import ConectarBD

def InfoRutinaActiva(IdCliente):
    """
    Retorna información resumida de la rutina activa (incluye días restantes).
    En éxito: (True, datos_rutina) o (True, None) si no tiene rutina activa.
    En error: (False, mensaje_error)
    """
    if not IdCliente or IdCliente <= 0:
        return False, "ID de cliente inválido."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpInfoRutinaActiva ?", (IdCliente,))

        Columnas = [desc[0] for desc in Cursor.description]
        Fila = Cursor.fetchone()
        if Fila:
            info = dict(zip(Columnas, Fila))
            return True, info
        else:
            return True, None

    except Exception as Error:
        return False, f"Error al obtener información de la rutina activa: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()