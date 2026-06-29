from ConexionBD import ConectarBD

def ListarEmpleados():
    """
    Retorna lista de empleados con sus datos y cargo.
    En éxito: (True, lista_empleados)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarEmpleados")
        Filas = Cursor.fetchall()
        Columnas = [desc[0] for desc in Cursor.description]
        Empleados = [dict(zip(Columnas, fila)) for fila in Filas]
        return True, Empleados

    except Exception as Error:
        return False, f"Error al listar empleados: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()