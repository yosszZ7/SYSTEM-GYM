from ConexionBD import ConectarBD

def ListarDetalleRutina(IdRutinaCliente):
    """
    Retorna el detalle completo de una rutina (todos los días y ejercicios).
    En éxito: (True, lista_detalle)
    En error: (False, mensaje_error)
    """
    if not IdRutinaCliente or IdRutinaCliente <= 0:
        return False, "ID de rutina inválido."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarDetalleRutina ?", (IdRutinaCliente,))

        Columnas = [desc[0] for desc in Cursor.description]
        Filas = Cursor.fetchall()
        Detalle = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Detalle

    except Exception as Error:
        return False, f"Error al listar detalle de la rutina: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()