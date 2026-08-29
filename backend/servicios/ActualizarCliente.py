from ConexionBD import ConectarBD, TraducirErrorBD

def ActualizarCliente(IdCliente, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, Telefono, Correo):
    if not IdCliente or IdCliente <= 0:
        return False, "ID de cliente inválido."
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar."
        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpActualizarCliente ?, ?, ?, ?, ?, ?, ?",
                       (IdCliente, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, Telefono, Correo))
        Conexion.commit()
        return True, "Cliente actualizado correctamente."
    except Exception as e:
        return False, TraducirErrorBD(e, "Error al actualizar cliente")
    finally:
        if Conexion:
            Conexion.close()