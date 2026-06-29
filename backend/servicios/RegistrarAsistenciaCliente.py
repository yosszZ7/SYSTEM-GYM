from ConexionBD import ConectarBD

def RegistrarAsistenciaCliente(IdCliente):
    """
    Registra la asistencia de un cliente para el día actual.
    Retorna: (success, mensaje)
    """
    if not IdCliente or IdCliente <= 0:
        return False, "ID de cliente inválido."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpRegistrarAsistenciaCliente ?", (IdCliente,))
        Conexion.commit()
        return True, "Asistencia registrada correctamente."

    except Exception as Error:
        return False, f"Error al registrar asistencia: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()