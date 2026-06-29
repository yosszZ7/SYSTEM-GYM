from ConexionBD import ConectarBD

def RegistrarEjercicio(NombreEjercicio, IdGrupoMuscular, Descripcion=None, VideoUrl=None):
    """
    Registra un nuevo ejercicio.
    Retorna: (success, mensaje)
    """
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
            "EXEC SpRegistrarEjercicio ?, ?, ?, ?",
            (NombreEjercicio, Descripcion, VideoUrl, IdGrupoMuscular)
        )
        Conexion.commit()
        return True, "Ejercicio registrado correctamente."

    except Exception as Error:
        return False, f"Error al registrar ejercicio: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()