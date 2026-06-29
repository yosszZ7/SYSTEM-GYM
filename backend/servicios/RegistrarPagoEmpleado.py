from ConexionBD import ConectarBD

def RegistrarPagoEmpleado(IdEmpleado, Monto, IdMetodoPago):
    """
    Registra un pago a un empleado.
    Retorna: (success, mensaje)
    """
    if not IdEmpleado or IdEmpleado <= 0:
        return False, "ID de empleado inválido."
    if not Monto or Monto <= 0:
        return False, "El monto debe ser mayor a 0."
    if not IdMetodoPago or IdMetodoPago <= 0:
        return False, "Método de pago inválido."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute(
            "EXEC SpRegistrarPagoEmpleado ?, ?, ?",
            (IdEmpleado, Monto, IdMetodoPago)
        )
        Conexion.commit()
        return True, "Pago de empleado registrado correctamente."

    except Exception as Error:
        return False, f"Error al registrar pago de empleado: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()