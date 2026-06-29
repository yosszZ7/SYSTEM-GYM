from ConexionBD import ConectarBD

def ListarEntrenadores():
    """
    Retorna la lista de empleados que tienen el cargo de entrenador.
    En éxito: (True, lista_entrenadores)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        # Usamos el procedimiento SpListarEntrenadores que ya existe en SQL
        Cursor.execute("EXEC SpListarEntrenadores")

        Columnas = [desc[0] for desc in Cursor.description]
        Filas = Cursor.fetchall()
        Entrenadores = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Entrenadores

    except Exception as Error:
        return False, f"Error al listar entrenadores: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()