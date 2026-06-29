from ConexionBD import ConectarBD

def RegistrarMantenimiento(IdMaquina, Descripcion, FechaMantenimiento):
    """
    Registra un mantenimiento de una máquina.
    Retorna: (success, mensaje)
    """
    if not IdMaquina or IdMaquina <= 0:
        return False, "ID de máquina inválido."
    if not Descripcion or not Descripcion.strip():
        return False, "La descripción del mantenimiento es obligatoria."
    if not FechaMantenimiento:
        return False, "La fecha de mantenimiento es obligatoria."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute(
            "EXEC SpRegistrarMantenimiento ?, ?, ?",
            (IdMaquina, Descripcion, FechaMantenimiento)
        )
        Conexion.commit()
        return True, "Mantenimiento registrado correctamente."

    except Exception as Error:
        return False, f"Error al registrar mantenimiento: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()