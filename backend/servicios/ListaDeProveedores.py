from ConexionBD import ConectarBD

def ListarProveedores():
    """
    Retorna la lista de proveedores registrados.
    En éxito: (True, lista_de_proveedores)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarProveedores")

        # Obtener nombres de las columnas
        Columnas = [desc[0] for desc in Cursor.description]

        # Convertir filas a lista de diccionarios
        Filas = Cursor.fetchall()
        Proveedores = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Proveedores

    except Exception as Error:
        return False, f"Error al listar proveedores: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()