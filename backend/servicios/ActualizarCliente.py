from ConexionBD import ConectarBD

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
        return False, f"Error: {str(e)}"
    finally:
        if Conexion:
            Conexion.close()