from ConexionBD import ConectarBD

def AsignarMembresia(IdCliente, IdMembresia, IdMetodoPago, Monto):
    if not IdCliente or IdCliente <= 0:
        return False, "ID de cliente inválido."
    if not IdMembresia or IdMembresia <= 0:
        return False, "ID de membresía inválido."
    # ... otras validaciones
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar."
        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpAsignarMembresia ?, ?, ?, ?",
                       (IdCliente, IdMembresia, IdMetodoPago, Monto))
        Conexion.commit()
        return True, "Membresía asignada correctamente."
    except Exception as e:
        return False, f"Error: {str(e)}"
    finally:
        if Conexion:
            Conexion.close()