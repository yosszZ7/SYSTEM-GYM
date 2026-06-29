from ConexionBD import ConectarBD

def ListarMovimientosInventario():
    """
    Retorna el historial de movimientos de inventario (entradas y salidas).
    En éxito: (True, lista_de_movimientos)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarMovimientosInventario")

        # Obtener nombres de las columnas
        Columnas = [desc[0] for desc in Cursor.description]

        # Convertir filas a lista de diccionarios
        Filas = Cursor.fetchall()
        Movimientos = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Movimientos

    except Exception as Error:
        return False, f"Error al listar movimientos de inventario: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()