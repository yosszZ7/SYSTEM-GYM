from ConexionBD import ConectarBD

def ObtenerMembresiaActivaCliente(IdCliente):
    """
    Retorna la membresía activa del cliente (si existe).
    En éxito: (True, dict_con_datos) o (True, None) si no tiene.
    En error: (False, mensaje_error)
    """
    if not IdCliente or IdCliente <= 0:
        return False, "ID de cliente inválido."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpObtenerMembresiaActivaCliente ?", (IdCliente,))
        Columnas = [desc[0] for desc in Cursor.description]
        Fila = Cursor.fetchone()
        if Fila:
            membresia = dict(zip(Columnas, Fila))
            return True, membresia
        else:
            return True, None  # No tiene membresía activa
    except Exception as Error:
        return False, f"Error al obtener membresía activa: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()