from ConexionBD import ConectarBD

def BuscarProductoPorNombre(Nombre):
    if not Nombre or not Nombre.strip():
        return False, "Debe ingresar un nombre."
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar."
        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpBuscarProductoPorNombre ?", (Nombre,))
        columnas = [desc[0] for desc in Cursor.description] if Cursor.description else []
        filas = Cursor.fetchall()
        productos = [dict(zip(columnas, fila)) for fila in filas] if columnas else []
        return True, productos
    except Exception as e:
        return False, f"Error: {str(e)}"
    finally:
        if Conexion:
            Conexion.close()