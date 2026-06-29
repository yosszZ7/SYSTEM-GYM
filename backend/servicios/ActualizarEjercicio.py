from ConexionBD import ConectarBD

def ActualizarEjercicio(IdEjercicio, NombreEjercicio, IdGrupoMuscular, Descripcion=None, VideoUrl=None):
    """
    Actualiza los datos de un ejercicio existente.
    Retorna: (success, mensaje)
    """
    if not IdEjercicio or IdEjercicio <= 0:
        return False, "ID de ejercicio inválido."
    if not NombreEjercicio or not NombreEjercicio.strip():
        return False, "El nombre del ejercicio es obligatorio."
    if not IdGrupoMuscular or IdGrupoMuscular <= 0:
        return False, "Debe seleccionar un grupo muscular válido."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute(
            "EXEC SpActualizarEjercicio ?, ?, ?, ?, ?",
            (IdEjercicio, NombreEjercicio, Descripcion, VideoUrl, IdGrupoMuscular)
        )
        Conexion.commit()
        return True, "Ejercicio actualizado correctamente."

    except Exception as Error:
        return False, f"Error al actualizar ejercicio: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()