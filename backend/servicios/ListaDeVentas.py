from ConexionBD import ConectarBD

def ListarVentas():
    """
    Retorna la lista de ventas realizadas con detalles del cliente y productos.
    En éxito: (True, lista_de_ventas)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarVentas")

        # Obtener nombres de las columnas
        Columnas = [desc[0] for desc in Cursor.description]

        # Convertir filas a lista de diccionarios
        Filas = Cursor.fetchall()
        Ventas = []
        for fila in Filas:
            v = dict(zip(Columnas, fila))
            if v.get('FechaVenta'):
                if hasattr(v['FechaVenta'], 'strftime'):
                    v['FechaVenta'] = v['FechaVenta'].strftime('%d/%m/%Y')
                else:
                    v['FechaVenta'] = str(v['FechaVenta'])
            if v.get('PrecioUnitario') is not None:
                v['PrecioUnitario'] = f"{float(v['PrecioUnitario']):.2f}"
            if v.get('Total') is not None:
                v['Total'] = f"{float(v['Total']):.2f}"
            Ventas.append(v)

        return True, Ventas

    except Exception as Error:
        return False, f"Error al listar ventas: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()
