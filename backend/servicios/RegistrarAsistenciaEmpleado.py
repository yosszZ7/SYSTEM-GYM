from ConexionBD import ConectarBD

def RegistrarAsistenciaEmpleado(IdEmpleado, HoraEntrada, HoraSalida):
    """
    Registra la asistencia de un empleado (fecha actual, hora entrada y salida).
    Retorna: (success, mensaje)
    """
    if not IdEmpleado or IdEmpleado <= 0:
        return False, "ID de empleado inválido."
    if not HoraEntrada or not HoraSalida:
        return False, "Debe proporcionar hora de entrada y salida."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute(
            "EXEC SpRegistrarAsistenciaEmpleado ?, ?, ?",
            (IdEmpleado, HoraEntrada, HoraSalida)
        )
        Conexion.commit()
        return True, "Asistencia de empleado registrada correctamente."

    except Exception as Error:
        return False, f"Error al registrar asistencia de empleado: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()