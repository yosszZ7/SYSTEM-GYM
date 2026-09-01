from ConexionBD import ConectarBD

def BuscarProductoPorNombre(Nombre):
    if not Nombre or not Nombre.strip():
        return False, "Debe ingresar un nombre."
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar."
        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpBuscarProductoPorNombre ?", (Nombre,))
        columnas = [desc[0] for desc in Cursor.description] if Cursor.description else []
        filas = Cursor.fetchall()
        productos = []
        for fila in filas:
            prod = dict(zip(columnas, fila))
            if prod.get('FechaRegistro'):
                if hasattr(prod['FechaRegistro'], 'strftime'):
                    prod['FechaRegistro'] = prod['FechaRegistro'].strftime('%d/%m/%Y')
                else:
                    prod['FechaRegistro'] = str(prod['FechaRegistro'])
            if prod.get('Precio') is not None:
                prod['Precio'] = f"{float(prod['Precio']):.2f}"
            productos.append(prod)
        return True, productos
    except Exception as e:
        return False, f"Error: {str(e)}"
    finally:
        if Conexion:
            Conexion.close()