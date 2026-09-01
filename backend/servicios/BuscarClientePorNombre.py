from ConexionBD import ConectarBD

def BuscarClientePorNombre(Nombre):
    """
    Busca clientes por coincidencia en nombres o apellidos de forma dinámica por palabras.
    Retorna: (success, lista_clientes) o (False, mensaje_error)
    """
    if not Nombre or not Nombre.strip():
        return False, "Debe ingresar un nombre para buscar."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        
        palabras = Nombre.strip().split()
        if palabras:
            condiciones = []
            parametros = []
            
            # La primera palabra debe coincidir con el inicio del Primer Nombre
            condiciones.append("PrimerNombre COLLATE Latin1_General_CI_AI LIKE ?")
            parametros.append(f"{palabras[0]}%")
            
            # Las siguientes palabras (si las hay) buscan en segundo nombre o apellidos
            for p in palabras[1:]:
                condiciones.append("(SegundoNombre COLLATE Latin1_General_CI_AI LIKE ? OR PrimerApellido COLLATE Latin1_General_CI_AI LIKE ? OR SegundoApellido COLLATE Latin1_General_CI_AI LIKE ?)")
                parametros.extend([f"{p}%", f"{p}%", f"{p}%"])
            
            where_clause = " AND ".join(condiciones)
            sql = f"""
            SELECT 
                IdCliente,
                PrimerNombre,
                SegundoNombre,
                PrimerApellido,
                SegundoApellido,
                Telefono,
                Correo,
                FechaRegistro,
                RequiereEntrenador,
                IdEntrenador
            FROM Cliente
            WHERE {where_clause}
            ORDER BY PrimerNombre, PrimerApellido
            """
            Cursor.execute(sql, parametros)
        else:
            return True, []

        Columnas = [desc[0] for desc in Cursor.description]
        Filas = Cursor.fetchall()
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
        return False, f"Error al buscar cliente: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()