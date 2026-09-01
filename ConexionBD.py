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




 
