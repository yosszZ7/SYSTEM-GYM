from ConexionBD import ConectarBD

def ListarEjerciciosPorGrupo(IdGrupoMuscular):
    """
    Retorna los ejercicios que pertenecen a un grupo muscular específico.
    En éxito: (True, lista_ejercicios)
    En error: (False, mensaje_error)
    """
    if not IdGrupoMuscular or IdGrupoMuscular <= 0:
        return False, "ID de grupo muscular inválido."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarEjerciciosPorGrupo ?", (IdGrupoMuscular,))

        Columnas = [desc[0] for desc in Cursor.description]
        Filas = Cursor.fetchall()
        Ejercicios = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Ejercicios

    except Exception as Error:
        return False, f"Error al listar ejercicios por grupo: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()