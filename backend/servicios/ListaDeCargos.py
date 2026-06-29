from ConexionBD import ConectarBD

def ListarCargos():
    """
    Retorna la lista de cargos activos.
    En éxito: (True, lista_de_cargos)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarCargos")

        columnas = [desc[0] for desc in Cursor.description]
        filas = Cursor.fetchall()
        cargos = [dict(zip(columnas, fila)) for fila in filas]
        return True, cargos
    except Exception as e:
        return False, f"Error al listar cargos: {str(e)}"
    finally:
        if Conexion:
            Conexion.close()