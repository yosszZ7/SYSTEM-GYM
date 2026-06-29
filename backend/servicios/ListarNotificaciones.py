from ConexionBD import ConectarBD
from datetime import datetime

def ListarNotificaciones():
    """
    Retorna la lista de notificaciones de la base de datos.
    En éxito: (True, lista_de_notificaciones)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarNotificaciones")
        filas = Cursor.fetchall()
        columnas = [desc[0] for desc in Cursor.description]
        
        notificaciones = []
        ahora = datetime.now()
        for fila in filas:
            n = dict(zip(columnas, fila))
            fecha = n.get('Fecha')
            hace = "Hace poco"
            if fecha:
                delta = ahora - fecha
                if delta.days > 0:
                    hace = f"Hace {delta.days} d"
                elif delta.seconds >= 3600:
                    hace = f"Hace {delta.seconds // 3600} h"
                elif delta.seconds >= 60:
                    hace = f"Hace {delta.seconds // 60} m"
                else:
                    hace = "Hace unos segundos"
            
            notificaciones.append({
                'IdNotificacion': n.get('IdNotificacion'),
                'mensaje': n.get('Mensaje'),
                'icono': n.get('Icono'),
                'leido': bool(n.get('Leido')),
                'hace': hace
            })
            
        return True, notificaciones
    except Exception as e:
        return False, f"Error al listar notificaciones: {str(e)}"
    finally:
        if Conexion:
            Conexion.close()
