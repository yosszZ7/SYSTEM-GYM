from ConexionBD import ConectarBD

def ObtenerDetallePagoEmpleado(IdPagoEmpleado):
    """
    Retorna el detalle completo de un pago a empleado por su IdPagoEmpleado.
    En éxito: (True, dict_pago)
    En error: (False, mensaje_error)
    """
    if not IdPagoEmpleado or int(IdPagoEmpleado) <= 0:
        return False, "ID de pago de empleado inválido."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpObtenerDetallePagoEmpleado @IdPagoEmpleado = ?", (int(IdPagoEmpleado),))

        if not Cursor.description:
            return False, "Comprobante de pago no encontrado."

        Columnas = [desc[0] for desc in Cursor.description]
        Fila = Cursor.fetchone()
        if not Fila:
            return False, "Comprobante de pago no encontrado."

        Pago = dict(zip(Columnas, Fila))
        return True, Pago

    except Exception as Error:
        return False, f"Error al obtener detalle del pago de empleado: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()
