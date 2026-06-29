from ConexionBD import ConectarBD

def ListarMembresias():
    """
    Retorna lista de tipos de membresía disponibles.
    En éxito: (True, lista_membresias)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarMembresias")
        Filas = Cursor.fetchall()
        Columnas = [desc[0] for desc in Cursor.description]
        Membresias = [dict(zip(Columnas, fila)) for fila in Filas]
        return True, Membresias

    except Exception as Error:
        return False, f"Error al listar membresías: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()