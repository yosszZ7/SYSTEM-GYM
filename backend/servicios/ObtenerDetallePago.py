from ConexionBD import ConectarBD

def ObtenerDetallePago(IdPago):
    """
    Retorna el detalle completo de un pago específico por su IdPagos.
    En éxito: (True, dict_pago)
    En error: (False, mensaje_error)
    """
    if not IdPago or int(IdPago) <= 0:
        return False, "ID de pago inválido."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("""
            SELECT
                P.IdPagos,
                P.IdCliente,
                C.PrimerNombre,
                C.PrimerApellido,
                CONCAT_WS(' ', NULLIF(C.PrimerNombre,''), NULLIF(C.SegundoNombre,''), NULLIF(C.PrimerApellido,''), NULLIF(C.SegundoApellido,'')) AS NombreCliente,
                C.Telefono,
                C.Correo,
                P.IdMembresia,
                M.NombreMembresia,
                M.Tipo AS TipoMembresia,
                M.DuracionDias,
                P.Monto,
                P.FechaPago,
                MP.IdMetodoPago,
                MP.NombreMetodo
            FROM Pagos P
            INNER JOIN Cliente C
                ON P.IdCliente = C.IdCliente
            INNER JOIN Membresia M
                ON P.IdMembresia = M.IdMembresia
            INNER JOIN MetodoPago MP
                ON P.IdMetodoPago = MP.IdMetodoPago
            WHERE P.IdPagos = ?
        """, (int(IdPago),))

        if not Cursor.description:
            return False, "Pago no encontrado."

        Columnas = [desc[0] for desc in Cursor.description]
        Fila = Cursor.fetchone()
        if not Fila:
            return False, "Pago no encontrado."

        Pago = dict(zip(Columnas, Fila))
        return True, Pago

    except Exception as Error:
        return False, f"Error al obtener detalle del pago: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()
