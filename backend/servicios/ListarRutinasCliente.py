from ConexionBD import ConectarBD

def ListarRutinasCliente(IdCliente):
    """
    Retorna el historial de todas las rutinas de un cliente (activas, finalizadas, vencidas).
    En éxito: (True, lista_rutinas)
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
        Cursor.execute("EXEC SpListarRutinasCliente ?", (IdCliente,))

        Columnas = [desc[0] for desc in Cursor.description]
        Filas = Cursor.fetchall()
        Rutinas = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Rutinas

    except Exception as Error:
        return False, f"Error al listar rutinas del cliente: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()