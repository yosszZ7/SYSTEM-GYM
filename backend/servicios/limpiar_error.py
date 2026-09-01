import re

def limpiar_error_sql(error):
    """
    Limpia y transforma cualquier excepción de SQL Server, pyodbc o del sistema
    en un mensaje claro, amigable y comprensible para el usuario final.
    Elimina códigos [42000], [23000], nombres de drivers ODBC, restricciones internas, etc.
    """
    if error is None:
        return "Ha ocurrido un error inesperado."
    
    texto = str(error).strip()
    if not texto:
        return "Ha ocurrido un error inesperado."

    # Si es una tupla o lista formateada como string (ej. ('42000', '[42000]...'))
    if (texto.startswith("('") or texto.startswith('("')) and "')" in texto:
        match = re.search(r"\[SQL Server\](.*?)(?:\(\d+\)\s*\([A-Za-z0-9_]+\)|$)", texto)
        if match:
            texto = match.group(1).strip()
        else:
            match_general = re.search(r"['\"],?\s*['\"](.*)['\"]", texto)
            if match_general:
                texto = match_general.group(1).strip()

    # Detección de patrones específicos de restricciones SQL Server
    if "REFERENCE constraint" in texto or ("FOREIGN KEY constraint" in texto and ("DELETE" in texto or "elimin" in texto.lower())):
        return "No se puede eliminar este registro porque tiene información relacionada en el sistema."
    
    if "FOREIGN KEY constraint" in texto or "REFERENCE constraint" in texto:
        return "No se puede completar la operación porque hace referencia a un dato que no existe o fue modificado."

    if "UNIQUE KEY constraint" in texto or "Cannot insert duplicate key" in texto or "PRIMARY KEY constraint" in texto or "clave duplicada" in texto.lower():
        return "Ya existe un registro con estos mismos datos en el sistema."

    if "Login failed" in texto or "Cannot open database" in texto or "08001" in texto:
        return "No se pudo establecer conexión con la base de datos. Intente más tarde."

    if "String or binary data would be truncated" in texto or "truncarían" in texto.lower():
        return "Uno de los textos ingresados supera la cantidad de caracteres permitida."

    if "Conversion failed when converting" in texto or "Error al convertir" in texto:
        return "Uno de los valores ingresados no tiene el formato o tipo de dato correcto."

    # Extraer mensaje personalizado si proviene de RAISERROR o THROW [SQL Server]...
    match_sql = re.search(r"\[SQL Server\](.*?)(?:\(\d+\)\s*\([A-Za-z0-9_]+\)|$)", texto)
    if match_sql:
        texto = match_sql.group(1).strip()

    # Limpieza de patrones de drivers y códigos ODBC
    texto = re.sub(r'\[\d+\]\s*', '', texto)
    texto = re.sub(r'\[Microsoft\]\[ODBC[^\]]*\]\s*', '', texto, flags=re.IGNORECASE)
    texto = re.sub(r'\[SQL Server\]\s*', '', texto, flags=re.IGNORECASE)
    texto = re.sub(r'\(\d+\)\s*\([A-Za-z0-9_]+\)', '', texto)
    texto = re.sub(r'The statement has been terminated\.?', '', texto, flags=re.IGNORECASE)
    texto = re.sub(r'Se ha terminado la instrucción\.?', '', texto, flags=re.IGNORECASE)
    
    # Limpieza de tuplas pyodbc residuales
    texto = texto.replace("('", "").replace("')", "").replace('("', '').replace('")', '')
    texto = re.sub(r'\s+', ' ', texto).strip()

    # Quitar prefijos duplicados como "Error: Error al..."
    texto = re.sub(r'^(Error\s*:\s*)+', '', texto, flags=re.IGNORECASE).strip()

    if not texto or len(texto) < 3:
        return "Ocurrió un error al procesar la solicitud en el sistema."

    return texto
