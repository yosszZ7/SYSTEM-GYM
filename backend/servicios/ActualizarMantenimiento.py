from ConexionBD import ConectarBD

def ActualizarMantenimiento(IdMantenimiento, IdMaquina, Descripcion, FechaMantenimiento, Estado):
    """
    Actualiza un registro de mantenimiento.
    Retorna: (success, mensaje)
    """
    if not IdMantenimiento or IdMantenimiento <= 0:
        return False, "ID de mantenimiento inválido."
    if not IdMaquina or IdMaquina <= 0:
        return False, "ID de máquina inválido."
    if not Descripcion or not Descripcion.strip():
        return False, "La descripción es obligatoria."
    if not Estado or not Estado.strip():
        return False, "El estado es obligatorio."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        try:
            Cursor.execute(
                "EXEC SpActualizarMantenimiento ?, ?, ?, ?, ?",
                (IdMantenimiento, IdMaquina, Descripcion, FechaMantenimiento, Estado)
            )
            Conexion.commit()
            return True, "Mantenimiento actualizado correctamente."
        except Exception:
            # Fallback SQL directo
            Cursor.execute("""
                UPDATE Mantenimiento 
                SET IdMaquina = ?, Descripcion = ?, FechaMantenimiento = ?, Estado = ?
                WHERE IdMantenimiento = ?
            """, (IdMaquina, Descripcion, FechaMantenimiento, Estado, IdMantenimiento))
            Conexion.commit()
            return True, "Mantenimiento actualizado correctamente (directo)."

    except Exception as Error:
        return False, f"Error al actualizar mantenimiento: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()
