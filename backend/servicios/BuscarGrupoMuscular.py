from ConexionBD import ConectarBD

def BuscarGrupoMuscular(Nombre):
    """
    Busca grupos musculares por nombre (coincidencia parcial).
    En éxito: (True, lista_de_grupos)
    En error: (False, mensaje_error)
    """
    if not Nombre or not Nombre.strip():
        return False, "Debe ingresar un nombre de grupo muscular."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpBuscarGrupoMuscular ?", (Nombre,))

        Columnas = [desc[0] for desc in Cursor.description]
        Filas = Cursor.fetchall()
        Grupos = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Grupos

    except Exception as Error:
        return False, f"Error al buscar grupo muscular: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()