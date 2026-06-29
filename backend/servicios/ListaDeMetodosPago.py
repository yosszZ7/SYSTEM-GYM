from ConexionBD import ConectarBD

def ListarMetodosPago():
    """
    Retorna la lista de métodos de pago.
    En éxito: (True, lista_de_metodos)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarMetodosPago")

        columnas = [desc[0] for desc in Cursor.description]
        filas = Cursor.fetchall()
        metodos = [dict(zip(columnas, fila)) for fila in filas]
        return True, metodos
    except Exception as e:
        return False, f"Error al listar métodos de pago: {str(e)}"
    finally:
        if Conexion:
            Conexion.close()