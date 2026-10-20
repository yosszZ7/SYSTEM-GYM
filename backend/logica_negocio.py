import re
from datetime import datetime, date, timedelta

# ==============================================================================
# 1. LÓGICA DE NEGOCIO: MEMBRESÍAS
# ==============================================================================

def calcular_fecha_fin_membresia(fecha_inicio, duracion_dias):
    """
    Calcula la fecha de vencimiento de una membresía a partir de la fecha de inicio
    y la duración en días.
    """
    if isinstance(fecha_inicio, str):
        fecha_inicio = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
    elif isinstance(fecha_inicio, datetime):
        fecha_inicio = fecha_inicio.date()

    if not isinstance(duracion_dias, int) or duracion_dias <= 0:
        raise ValueError("La duración en días debe ser un entero mayor a 0.")

    return fecha_inicio + timedelta(days=duracion_dias)


def determinar_estado_membresia(fecha_inicio, fecha_fin, fecha_actual=None):
    """
    Determina si una membresía se encuentra 'Activa', 'Por Vencer', 'Vencida' o 'Futura'.
    - Activa: fecha_inicio <= fecha_actual <= fecha_fin
    - Por Vencer: faltan 3 días o menos para vencer
    - Vencida: fecha_actual > fecha_fin
    - Futura: fecha_actual < fecha_inicio
    """
    if fecha_actual is None:
        fecha_actual = date.today()
    elif isinstance(fecha_actual, str):
        fecha_actual = datetime.strptime(fecha_actual, "%Y-%m-%d").date()
    elif isinstance(fecha_actual, datetime):
        fecha_actual = fecha_actual.date()

    if isinstance(fecha_inicio, str):
        fecha_inicio = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
    if isinstance(fecha_fin, str):
        fecha_fin = datetime.strptime(fecha_fin, "%Y-%m-%d").date()

    if fecha_actual < fecha_inicio:
        return "Futura"
    elif fecha_actual > fecha_fin:
        return "Vencida"
    else:
        dias_restantes = (fecha_fin - fecha_actual).days
        if dias_restantes <= 3:
            return "Por Vencer"
        return "Activa"


def validar_precio_membresia(precio):
    """
    Valida que el precio de una membresía sea un valor numérico positivo.
    """
    try:
        precio_val = float(precio)
        if precio_val <= 0:
            return False, "El precio de la membresía debe ser mayor a 0."
        return True, precio_val
    except (ValueError, TypeError):
        return False, "El precio debe ser un valor numérico válido."


# ==============================================================================
# 2. LÓGICA DE NEGOCIO: PAGOS Y FACTURACIÓN
# ==============================================================================

def validar_monto_pago(monto):
    """
    Valida que el monto ingresado para un pago sea válido y mayor a cero.
    """
    try:
        val = float(monto)
        if val <= 0:
            return False, "El monto del pago debe ser mayor a 0."
        return True, round(val, 2)
    except (ValueError, TypeError):
        return False, "El monto debe ser un número válido."


def calcular_cambio(monto_recibido, total_a_pagar):
    """
    Calcula el cambio que se debe entregar al cliente.
    Retorna: (success, cambio, mensaje)
    """
    val_recibido, m_recibido = validar_monto_pago(monto_recibido)
    val_total, m_total = validar_monto_pago(total_a_pagar)

    if not val_recibido:
        return False, 0.0, "Monto recibido inválido."
    if not val_total:
        return False, 0.0, "Total a pagar inválido."

    if m_recibido < m_total:
        faltante = round(m_total - m_recibido, 2)
        return False, 0.0, f"Monto insuficiente. Faltan C${faltante} para completar el pago."

    cambio = round(m_recibido - m_total, 2)
    return True, cambio, "Pago completado con éxito."


def aplicar_descuento(monto_base, porcentaje_descuento):
    """
    Aplica un porcentaje de descuento (0 a 100) sobre un monto base.
    """
    if not (0 <= porcentaje_descuento <= 100):
        return False, monto_base, "El descuento debe estar entre 0% y 100%."
    
    descuento = round(monto_base * (porcentaje_descuento / 100.0), 2)
    total_con_descuento = round(monto_base - descuento, 2)
    return True, total_con_descuento, f"Descuento de {porcentaje_descuento}% aplicado exitosamente."


# ==============================================================================
# 3. LÓGICA DE NEGOCIO: INVENTARIO Y STOCK
# ==============================================================================

def calcular_nuevo_stock_entrada(stock_actual, cantidad_entrada):
    """
    Calcula el nuevo stock al registrar una entrada de mercancía.
    Evita cantidades negativas o cero.
    """
    if not isinstance(cantidad_entrada, int) or cantidad_entrada <= 0:
        return False, stock_actual, "La cantidad de entrada debe ser un número entero mayor a 0."
    
    if stock_actual < 0:
        return False, stock_actual, "El stock actual no puede ser negativo."

    nuevo_stock = stock_actual + cantidad_entrada
    return True, nuevo_stock, "Entrada de inventario calculada correctamente."


def calcular_nuevo_stock_salida(stock_actual, cantidad_salida):
    """
    Calcula y valida la salida de inventario.
    Impide que el stock quede en números negativos (regla de no sobreventa).
    """
    if not isinstance(cantidad_salida, int) or cantidad_salida <= 0:
        return False, stock_actual, "La cantidad de salida debe ser un número entero mayor a 0."

    if cantidad_salida > stock_actual:
        return False, stock_actual, f"Stock insuficiente. Stock disponible: {stock_actual}, solicitado: {cantidad_salida}."

    nuevo_stock = stock_actual - cantidad_salida
    return True, nuevo_stock, "Salida de inventario procesada correctamente."


def verificar_alerta_stock_minimo(stock_actual, stock_minimo=5):
    """
    Retorna True si el stock actual está en o por debajo del umbral mínimo configurado.
    """
    return stock_actual <= stock_minimo


# ==============================================================================
# 4. LÓGICA DE NEGOCIO: VALIDACIÓN DE USUARIOS Y CLIENTES
# ==============================================================================

def validar_email(email):
    """
    Valida el formato estándar de correo electrónico.
    """
    if not email or not isinstance(email, str):
        return False
    patron = r'^[\w\.-]+@[\w\.-]+\.\w{2,}$'
    return bool(re.match(patron, email.strip()))


def validar_cedula_nicaragua(cedula):
    """
    Valida el formato estándar de cédula de identidad nicaragüense (ej. 001-120598-1002W).
    """
    if not cedula or not isinstance(cedula, str):
        return False
    patron = r'^\d{3}-\d{6}-\d{4}[A-Za-z]$'
    return bool(re.match(patron, cedula.strip()))


def validar_datos_cliente(nombre, apellido, telefono=None, email=None):
    """
    Valida la información básica de registro de un cliente.
    """
    if not nombre or not nombre.strip():
        return False, "El primer nombre es obligatorio."
    if not apellido or not apellido.strip():
        return False, "El primer apellido es obligatorio."
    if email and not validar_email(email):
        return False, "El formato del correo electrónico es inválido."
    if telefono and (len(telefono.strip()) < 8 or not re.match(r'^[0-9+\-\s]+$', telefono.strip())):
        return False, "El número de teléfono no tiene un formato válido."
    
    return True, "Datos del cliente válidos."


def validar_rol_usuario(rol, roles_permitidos=None):
    """
    Valida que el rol asignado sea uno de los roles permitidos en el sistema.
    """
    if roles_permitidos is None:
        roles_permitidos = ["Administrador", "Recepcionista", "Entrenador", "Cliente"]
    
    if not rol or rol not in roles_permitidos:
        return False, f"Rol inválido. Roles válidos: {', '.join(roles_permitidos)}"
    return True, "Rol válido."


# ==============================================================================
# 5. LÓGICA DE NEGOCIO: RUTINAS Y ASISTENCIAS
# ==============================================================================

def validar_frecuencia_rutina(frecuencia_semanal):
    """
    Valida que la frecuencia semanal esté entre 1 y 7 días.
    """
    if not isinstance(frecuencia_semanal, int) or frecuencia_semanal < 1 or frecuencia_semanal > 7:
        return False, "La frecuencia semanal debe ser entre 1 y 7 días."
    return True, "Frecuencia semanal válida."


def validar_ejercicio_rutina(series, repeticiones):
    """
    Valida que las series sean mayores a 0 y que las repeticiones no estén vacías.
    """
    if not isinstance(series, int) or series <= 0:
        return False, "Las series deben ser un número entero mayor a 0."
    if not repeticiones or not str(repeticiones).strip():
        return False, "El campo de repeticiones es obligatorio."
    return True, "Parámetros de ejercicio válidos."


def calcular_asistencias_mes(fechas_asistencias, mes, anio):
    """
    Calcula cuántas asistencias registró un cliente en un mes y año determinado.
    """
    total = 0
    for f in fechas_asistencias:
        if isinstance(f, str):
            f_date = datetime.strptime(f, "%Y-%m-%d").date()
        elif isinstance(f, datetime):
            f_date = f.date()
        else:
            f_date = f
            
        if f_date.month == mes and f_date.year == anio:
            total += 1
    return total


# ==============================================================================
# 6. LÓGICA DE NEGOCIO: RECUPERACIÓN DE CONTRASEÑA (HU-003)
# ==============================================================================

def validar_datos_recuperacion(dato):
    """
    Valida el campo ingresado para solicitar la recuperación de contraseña.
    Puede ser correo electrónico o nombre de usuario registrado.
    """
    if not dato or not str(dato).strip():
        return False, "Por favor, ingresa tu correo electrónico o nombre de usuario."
    
    dato_limpio = str(dato).strip()
    if len(dato_limpio) < 3:
        return False, "El identificador ingresado es demasiado corto."
    
    return True, dato_limpio


def validar_nueva_contrasena(nueva, confirmacion):
    """
    Valida la nueva contraseña y su confirmación.
    Requisitos:
    - Mínimo 6 caracteres
    - Ambas contraseñas deben coincidir exactamente
    """
    if not nueva or len(str(nueva)) < 6:
        return False, "La nueva contraseña debe tener al menos 6 caracteres."
    
    if str(nueva) != str(confirmacion):
        return False, "Las contraseñas no coinciden. Por favor, verifícalas."
        
    return True, "Contraseña válida y confirmada."

