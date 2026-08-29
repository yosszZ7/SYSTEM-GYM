import os
import pyodbc
from dotenv import load_dotenv

# Cargar variables de entorno del archivo .env si existe
load_dotenv()

def ConectarBD():
    try:
        # Intenta leer las variables de entorno de .env (usadas en Render/Somee)
        # Si no existen, usa tus valores locales por defecto
        driver = os.getenv('DB_DRIVER', 'ODBC Driver 17 for SQL Server')
        server = os.getenv('DB_SERVER', 'yostin')
        database = os.getenv('DB_DATABASE', 'SYSTEM_WORDGYM')
        uid = os.getenv('DB_UID', 'SYSTEM_GYM')
        pwd = os.getenv('DB_PWD', 'WORD2006')
        
        conexion_str = (
            f'DRIVER={{{driver}}};'
            f'SERVER={server};'
            f'DATABASE={database};'
            f'UID={uid};'
            f'PWD={pwd};'
        )
        
        # En la nube (Somee), requerimos forzar la confianza en el certificado
        if 'somee.com' in server:
            conexion_str += 'TrustServerCertificate=yes;'
            
        Conexion = pyodbc.connect(conexion_str)
        print ("Conexion exitosa")
        return Conexion
    except Exception as Error:
        print ("ERROR AL CONECTAR:", Error)
        return None

def TraducirErrorBD(Error, mensaje_defecto="Error en el servidor"):
    """
    Traduce errores técnicos de SQL Server/pyodbc (como violaciones de restricciones UNIQUE o llaves foráneas)
    a mensajes legibles y amigables en español.
    """
    err_msg = str(Error)
    
    # 1. Restricciones UNIQUE y PRIMARY KEY (Error 2627 / 2601 / SQLState 23000)
    if any(code in err_msg for code in ["2627", "2601", "23000", "Violation of UNIQUE KEY", "Cannot insert duplicate key"]):
        # Maquinaria
        if "Maquinaria" in err_msg or "NombreMaquinaria" in err_msg:
            return "Ya existe una máquina registrada con ese nombre. Por favor, use uno diferente."
        # Cliente
        if "Cliente" in err_msg:
            if "Telefono" in err_msg or "4EC50480" in err_msg:
                return "El número de teléfono ya está registrado para otro cliente."
            if "Correo" in err_msg or "60695A19" in err_msg:
                return "El correo electrónico ya está registrado para otro cliente."
            return "Ya existe un cliente registrado con ese número de teléfono o correo."
        # Empleado
        if "Empleado" in err_msg:
            if "Telefono" in err_msg or "4EC50480" in err_msg:
                return "El número de teléfono ya está registrado para otro empleado."
            if "Correo" in err_msg or "60695A19" in err_msg:
                return "El correo electrónico ya está registrado para otro empleado."
            return "Ya existe un empleado registrado con ese número de teléfono o correo."
        # Proveedor
        if "Proveedor" in err_msg:
            if "Telefono" in err_msg or "4EC50480" in err_msg:
                return "El número de teléfono ya está registrado para otro proveedor."
            if "Correo" in err_msg or "60695A19" in err_msg:
                return "El correo electrónico ya está registrado para otro proveedor."
            return "Ya existe un proveedor registrado con ese número de teléfono o correo."
        # Usuario
        if "Usuario" in err_msg or "NombreUsuario" in err_msg:
            return "El nombre de usuario ya está en uso. Por favor, elija uno diferente."
        # GrupoMuscular
        if "GrupoMuscular" in err_msg or "NombreGrupo" in err_msg:
            return "Ya existe un grupo muscular registrado con ese nombre."
        # Membresia
        if "Membresia" in err_msg or "Tipo" in err_msg:
            return "Ya existe una membresía registrada con ese nombre/tipo."
        # Cargo
        if "Cargo" in err_msg or "NombreCargo" in err_msg:
            return "Ya existe un cargo registrado con ese nombre."
        # Rol
        if "Rol" in err_msg or "NombreRol" in err_msg:
            return "Ya existe un rol registrado con ese nombre."
        return "Ya existe un registro con estos datos en el sistema."

    # 2. Violación de Foreign Key (Error 547)
    if "547" in err_msg or "FOREIGN KEY constraint" in err_msg:
        if "DELETE" in err_msg or "conflict" in err_msg.lower():
            return "No se puede eliminar o modificar este registro porque tiene datos relacionados vinculados (ej. clientes activos, ventas o rutinas)."
        return "El registro referenciado no es válido o no existe en el sistema."

    # Si es otro tipo de error, devolver el mensaje por defecto limpio con descripción corta
    return f"{mensaje_defecto}: {err_msg}"





 
