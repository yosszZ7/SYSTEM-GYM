from ConexionBD import ConectarBD

def BuscarUsuarioPorNombre(NombreUsuario):
    """
    Busca usuarios por coincidencia en NombreUsuario de forma dinámica por palabras.
    Retorna: (success, lista_usuarios) o (False, mensaje_error)
    """
    if not NombreUsuario or not NombreUsuario.strip():
        return True, []

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        
        # Split search query by spaces
        palabras = NombreUsuario.strip().split()
        if palabras:
            condiciones = []
            parametros = []
            # Primera palabra inicia con el término
            condiciones.append("U.NombreUsuario COLLATE Latin1_General_CI_AI LIKE ?")
            parametros.append(f"{palabras[0]}%")
            
            for p in palabras[1:]:
                condiciones.append("U.NombreUsuario COLLATE Latin1_General_CI_AI LIKE ?")
                parametros.append(f"%{p}%")
            
            where_clause = " AND ".join(condiciones)
            sql = f"""
            SELECT 
                U.IdUsuario,
                U.NombreUsuario,
                U.Estado,
                U.FechaRegistro,
                R.NombreRol
            FROM Usuario U
            INNER JOIN Rol R ON U.IdRol = R.IdRol
            WHERE {where_clause}
            ORDER BY U.NombreUsuario
            """
            Cursor.execute(sql, parametros)
        else:
            return True, []

        Columnas = [desc[0] for desc in Cursor.description]
        Filas = Cursor.fetchall()
        Usuarios = []
        for fila in Filas:
            u = dict(zip(Columnas, fila))
            if u.get('FechaRegistro'):
                if hasattr(u['FechaRegistro'], 'strftime'):
                    u['FechaRegistro'] = u['FechaRegistro'].strftime('%d/%m/%Y')
                else:
                    u['FechaRegistro'] = str(u['FechaRegistro'])
            Usuarios.append(u)

        return True, Usuarios

    except Exception as Error:
        return False, f"Error al buscar usuario: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()
