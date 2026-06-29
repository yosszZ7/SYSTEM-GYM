from ConexionBD import ConectarBD

def ActualizarGrupoMuscular(IdGrupoMuscular, NombreGrupo, Descripcion=None):
    """
    Actualiza los datos de un grupo muscular existente.
    Retorna: (success, mensaje)
    """
    if not IdGrupoMuscular or IdGrupoMuscular <= 0:
        return False, "ID de grupo muscular inválido."
    if not NombreGrupo or not NombreGrupo.strip():
        return False, "El nombre del grupo muscular es obligatorio."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute(
            "EXEC SpActualizarGrupoMuscular ?, ?, ?",
            (IdGrupoMuscular, NombreGrupo, Descripcion)
        )
        Conexion.commit()
        return True, "Grupo muscular actualizado correctamente."

    except Exception as Error:
        return False, f"Error al actualizar grupo muscular: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()