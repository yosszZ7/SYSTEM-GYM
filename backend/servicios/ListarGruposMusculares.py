from ConexionBD import ConectarBD

def ListarGruposMusculares():
    """
    Retorna la lista de grupos musculares.
    En éxito: (True, lista_de_grupos)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarGruposMusculares")

        # Obtener nombres de las columnas
        Columnas = [desc[0] for desc in Cursor.description]

        # Convertir filas a lista de diccionarios
        Filas = Cursor.fetchall()
        Grupos = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Grupos

    except Exception as Error:
        return False, f"Error al listar grupos musculares: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()