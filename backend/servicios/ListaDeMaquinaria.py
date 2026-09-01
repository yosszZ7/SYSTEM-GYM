from ConexionBD import ConectarBD

def ListarMaquinaria():
    """
    Retorna la lista de máquinas/equipos del gimnasio.
    En éxito: (True, lista_de_maquinas)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarMaquinaria")

        columnas = [desc[0] for desc in Cursor.description]
        filas = Cursor.fetchall()
        maquinas = []
        for fila in filas:
            maq = dict(zip(columnas, fila))
            if maq.get('FechaCompra'):
                if hasattr(maq['FechaCompra'], 'strftime'):
                    maq['FechaCompra'] = maq['FechaCompra'].strftime('%d/%m/%Y')
                else:
                    maq['FechaCompra'] = str(maq['FechaCompra'])
            maquinas.append(maq)
        return True, maquinas
    except Exception as e:
        return False, f"Error al listar maquinaria: {str(e)}"
    finally:
        if Conexion:
            Conexion.close()