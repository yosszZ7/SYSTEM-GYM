from ConexionBD import ConectarBD

def BuscarEjercicioPorNombre(Nombre):
    """
    Busca ejercicios por coincidencia en el nombre.
    En éxito: (True, lista_ejercicios)
    En error: (False, mensaje_error)
    """
    if not Nombre or not Nombre.strip():
        return False, "Debe ingresar un nombre de ejercicio."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpBuscarEjercicioPorNombre ?", (Nombre,))

        Columnas = [desc[0] for desc in Cursor.description]
        Filas = Cursor.fetchall()
        Ejercicios = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Ejercicios

    except Exception as Error:
        return False, f"Error al buscar ejercicio: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()