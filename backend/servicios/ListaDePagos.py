from ConexionBD import ConectarBD

def ListarPagos():
    """
    Retorna la lista de pagos de clientes (incluye método de pago y membresía).
    En éxito: (True, lista_de_pagos)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarPagos")

        # Obtener nombres de las columnas
        Columnas = [desc[0] for desc in Cursor.description]

        # Convertir filas a lista de diccionarios
        Filas = Cursor.fetchall()
        Pagos = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Pagos

    except Exception as Error:
        return False, f"Error al listar pagos: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()