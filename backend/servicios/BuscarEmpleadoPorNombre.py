from ConexionBD import ConectarBD

def BuscarEmpleadoPorNombre(Nombre):
    if not Nombre or not Nombre.strip():
        return False, "Debe ingresar un nombre."
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar."
        Cursor = Conexion.cursor()
        
        palabras = Nombre.strip().split()
        if palabras:
            condiciones = []
            parametros = []
            
            # La primera palabra debe coincidir con el inicio del Primer Nombre
            condiciones.append("E.PrimerNombre COLLATE Latin1_General_CI_AI LIKE ?")
            parametros.append(f"{palabras[0]}%")
            
            # Las siguientes palabras (si las hay) buscan en segundo nombre o apellidos
            for p in palabras[1:]:
                condiciones.append("(E.SegundoNombre COLLATE Latin1_General_CI_AI LIKE ? OR E.PrimerApellido COLLATE Latin1_General_CI_AI LIKE ? OR E.SegundoApellido COLLATE Latin1_General_CI_AI LIKE ?)")
                parametros.extend([f"{p}%", f"{p}%", f"{p}%"])
            
            where_clause = " AND ".join(condiciones)
            sql = f"""
            SELECT
                E.IdEmpleado,
                E.PrimerNombre,
                E.SegundoNombre,
                E.PrimerApellido,
                E.SegundoApellido,
                E.Telefono,
                E.Correo,
                E.FechaContratacion,
                E.Salario,
                C.NombreCargo
            FROM Empleado E
            INNER JOIN Cargo C ON E.IdCargo = C.IdCargo
            WHERE {where_clause}
            ORDER BY E.PrimerNombre, E.PrimerApellido
            """
            Cursor.execute(sql, parametros)
        else:
            return True, []
            
        columnas = [desc[0] for desc in Cursor.description] if Cursor.description else []
        filas = Cursor.fetchall()
        empleados = []
        for fila in filas:
            emp = dict(zip(columnas, fila))
            if emp.get('FechaContratacion'):
                emp['FechaContratacion'] = str(emp['FechaContratacion'])
            if emp.get('Salario') is not None:
                emp['Salario'] = f"{float(emp['Salario']):.2f}"
            empleados.append(emp)
        return True, empleados
    except Exception as e:
        return False, f"Error: {str(e)}"
    finally:
        if Conexion:
            Conexion.close()
