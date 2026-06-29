from ConexionBD import ConectarBD

def ListarProductos():
    """
    Retorna la lista de productos con su stock actual.
    En éxito: (True, lista_de_productos)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarProductos")

        # Obtener nombres de las columnas
        Columnas = [desc[0] for desc in Cursor.description]

        # Convertir filas a lista de diccionarios
        Filas = Cursor.fetchall()
        Productos = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Productos

    except Exception as Error:
        return False, f"Error al listar productos: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()