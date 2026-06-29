from ConexionBD import ConectarBD

def ListarDiasSemana():
    """
    Retorna la lista de días de la semana (catálogo fijo: lunes a domingo).
    En éxito: (True, lista_dias)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarDiasSemana")

        Columnas = [desc[0] for desc in Cursor.description]
        Filas = Cursor.fetchall()
        Dias = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Dias

    except Exception as Error:
        return False, f"Error al listar días de la semana: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()