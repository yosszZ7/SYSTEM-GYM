from ConexionBD import ConectarBD

def ListarVentas():
    """
    Retorna la lista de ventas realizadas con detalles del cliente y productos.
    En éxito: (True, lista_de_ventas)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarVentas")

        # Obtener nombres de las columnas
        Columnas = [desc[0] for desc in Cursor.description]

        # Convertir filas a lista de diccionarios
        Filas = Cursor.fetchall()
        Ventas = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Ventas

    except Exception as Error:
        return False, f"Error al listar ventas: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()
