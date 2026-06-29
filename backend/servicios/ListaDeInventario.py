from ConexionBD import ConectarBD

def ListarInventario():
    """
    Retorna lista del inventario actual (producto + stock).
    En éxito: (True, lista_inventario)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarInventario")
        Filas = Cursor.fetchall()
        Columnas = [desc[0] for desc in Cursor.description]
        Inventario = [dict(zip(Columnas, fila)) for fila in Filas]
        return True, Inventario

    except Exception as Error:
        return False, f"Error al listar inventario: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()