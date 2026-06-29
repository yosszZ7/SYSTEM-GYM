from ConexionBD import ConectarBD

def ListarEjercicios():
    """
    Retorna la lista de todos los ejercicios con su grupo muscular.
    En éxito: (True, lista_ejercicios)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarEjercicios")

        Columnas = [desc[0] for desc in Cursor.description]
        Filas = Cursor.fetchall()
        Ejercicios = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Ejercicios

    except Exception as Error:
        return False, f"Error al listar ejercicios: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()