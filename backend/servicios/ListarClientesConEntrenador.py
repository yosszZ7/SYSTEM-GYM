from ConexionBD import ConectarBD

def ListarClientesConEntrenador():
    """
    Retorna la lista de clientes con su entrenador asignado.
    En éxito: (True, lista_clientes)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarClientesConEntrenador")

        Columnas = [desc[0] for desc in Cursor.description]
        Filas = Cursor.fetchall()
        Clientes = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Clientes

    except Exception as Error:
        return False, f"Error al listar clientes con entrenador: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()