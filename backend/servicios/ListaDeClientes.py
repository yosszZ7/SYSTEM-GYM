from ConexionBD import ConectarBD

def ListarClientes():
    """
    Retorna una lista de todos los clientes.
    En caso de éxito: (True, lista_de_clientes)
    En caso de error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarClientes")
        Filas = Cursor.fetchall()

        # Convertir a lista de diccionarios
        Columnas = [desc[0] for desc in Cursor.description]
        Clientes = []
        for fila in Filas:
            cli = dict(zip(Columnas, fila))
            if cli.get('FechaRegistro'):
                if hasattr(cli['FechaRegistro'], 'strftime'):
                    cli['FechaRegistro'] = cli['FechaRegistro'].strftime('%d/%m/%Y')
                else:
                    cli['FechaRegistro'] = str(cli['FechaRegistro'])
            Clientes.append(cli)

        return True, Clientes

    except Exception as Error:
        return False, f"Error al listar clientes: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()