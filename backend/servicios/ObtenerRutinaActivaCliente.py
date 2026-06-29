from ConexionBD import ConectarBD

def ObtenerRutinaActivaCliente(IdCliente):
    """
    Obtiene la rutina activa actual del cliente (solo datos cabecera, sin ejercicios).
    En éxito: (True, datos_rutina) o (True, None) si no tiene rutina activa.
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
        Cursor.execute("EXEC SpObtenerRutinaActivaCliente ?", (IdCliente,))

        Columnas = [desc[0] for desc in Cursor.description]
        Fila = Cursor.fetchone()
        if Fila:
            rutina = dict(zip(Columnas, Fila))
            return True, rutina
        else:
            return True, None  # No tiene rutina activa

    except Exception as Error:
        return False, f"Error al obtener rutina activa: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()