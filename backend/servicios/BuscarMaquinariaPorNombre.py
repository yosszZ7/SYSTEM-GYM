from ConexionBD import ConectarBD

def BuscarMaquinariaPorNombre(Nombre):
    """
    Busca maquinaria por coincidencia en el nombre iniciando por la primera palabra.
    Retorna: (success, lista_maquinas) o (False, mensaje_error)
    """
    if not Nombre or not Nombre.strip():
        return False, "Debe ingresar un nombre de máquina."

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
            
            # La primera palabra debe coincidir con el inicio del NombreMaquinaria
            condiciones.append("NombreMaquinaria COLLATE Latin1_General_CI_AI LIKE ?")
            parametros.append(f"{palabras[0]}%")
            
            # Las siguientes palabras (si las hay) buscan en NombreMaquinaria o Tipo
            for p in palabras[1:]:
                condiciones.append("(NombreMaquinaria COLLATE Latin1_General_CI_AI LIKE ? OR Tipo COLLATE Latin1_General_CI_AI LIKE ?)")
                parametros.extend([f"%{p}%", f"%{p}%"])
            
            where_clause = " AND ".join(condiciones)
            sql = f"""
            SELECT 
                IdMaquina,
                NombreMaquinaria,
                Tipo,
                Estado,
                FechaCompra
            FROM Maquinaria
            WHERE {where_clause}
            ORDER BY NombreMaquinaria
            """
            Cursor.execute(sql, parametros)
        else:
            return True, []

        columnas = [desc[0] for desc in Cursor.description] if Cursor.description else []
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

    except Exception as Error:
        return False, f"Error al buscar maquinaria: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()
