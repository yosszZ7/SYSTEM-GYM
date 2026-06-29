from ConexionBD import ConectarBD
import json

def ProcesarVenta(IdCliente, Productos):
    """
    Productos: lista de dict [{'IdProducto': 1, 'Cantidad': 2}, ...]
    Retorna: (True, id_venta) o (False, mensaje_error)
    """
    if not IdCliente or IdCliente <= 0:
        return False, "ID de cliente inválido."
    if not Productos or len(Productos) == 0:
        return False, "Debe incluir al menos un producto."

    productos_json = json.dumps(Productos)
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpRegistrarVentaMultiple ?, ?", (IdCliente, productos_json))
        fila = Cursor.fetchone()
        id_venta = fila[0] if fila else None
        Conexion.commit()
        return True, id_venta
    except Exception as Error:
        return False, f"Error al registrar venta: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()