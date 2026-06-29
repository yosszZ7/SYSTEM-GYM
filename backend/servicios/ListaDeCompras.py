from ConexionBD import ConectarBD

def ListarCompras():
    """
    Retorna una lista de todas las compras realizadas.
    En caso de éxito: (True, lista_de_compras)
    En caso de error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarCompras")
        Filas = Cursor.fetchall()

        # Convertir a lista de diccionarios
        Columnas = [desc[0] for desc in Cursor.description]
        Compras = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Compras

    except Exception as Error:
        return False, f"Error al listar compras: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()