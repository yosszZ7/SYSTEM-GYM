# Manual Técnico - SYSTEM WORDGYM

Este documento proporciona la descripción técnica, arquitectura, esquema de datos y configuración del **SYSTEM WORDGYM**.

---

## 1. Arquitectura del Sistema

La aplicación utiliza un patrón de arquitectura monolítica ligera con una separación clara de responsabilidades en el backend:

*   **Capa de Presentación (Frontend)**: Construido con plantillas HTML5 renderizadas dinámicamente en el servidor usando **Jinja2** (Flask). La interactividad del lado del cliente se maneja mediante JavaScript nativo (fetch/AJAX) para comunicarse asíncronamente con las APIs JSON.
*   **Capa de Negocio (Backend)**: Desarrollado en **Python 3.x** utilizando el framework web micro **Flask**. Las rutas se dividen entre controladores de páginas HTML y endpoints de servicios web de la API RESTful.
*   **Capa de Persistencia (Base de Datos)**: Servidor de base de datos relacional **Microsoft SQL Server**. El backend se conecta mediante **pyodbc** utilizando la intercalación insensible a acentos y mayúsculas (`Latin1_General_CI_AI`).

---

## 2. Estructura del Directorio del Proyecto

```text
GYM SISTEM/
│
├── app.py                      # Servidor Flask principal y enrutador web
├── ConexionBD.py               # Función de conexión central ConectarBD()
├── .env                        # Variables de entorno (SMTP de Gmail y puertos)
│
├── backend/
│   ├── __init__.py
│   └── servicios/              # Módulos de servicios que ejecutan consultas SQL y SP
│       ├── RegistrarCompra.py
│       ├── ListarMantenimientos.py
│       └── ... (84 archivos de servicios adicionales)
│
├── static/                     # Archivos estáticos
│   ├── css/                    # Estilos CSS premium centralizados
│   ├── js/
│   │   └── main.js             # Lógica interactiva en cliente y llamadas AJAX
│   └── emails/                 # Simulaciones locales de notificaciones HTML
│
└── templates/                  # Vistas HTML renderizadas por Jinja2
    ├── base.html               # Plantilla estructural común con barra lateral
    ├── compra_listar.html
    └── ... (plantillas de cada módulo)
```

---

## 3. Integración con la Base de Datos (SQL Server)

El sistema interactúa con la base de datos a través de dos mecanismos:

1.  **Procedimientos Almacenados (Stored Procedures)**: El backend prioriza la ejecución de procedimientos almacenados del sistema (ej: `SpRegistrarCompra`, `SpListarMantenimientos`, `SpListarClientes`).
2.  **Lógica de Fallback SQL**: Si el procedimiento almacenado no existe o falla por restricciones de red en el servidor, los servicios en `backend/servicios` están diseñados con bloques `try-except` que ejecutan consultas directas `INSERT`, `UPDATE` o `SELECT` de respaldo, garantizando la continuidad operativa.

### Mapeo de Tipos de Datos (SQL Server Bit)
Para evitar excepciones en SQL Server con columnas de tipo `BIT`, el backend realiza conversiones explícitas de tipos:
*   Las variables recibidas como string (`"1"`, `"Operativo"`, `"Activo"`) se transforman a enteros `1` o booleanos `True` antes de pasarlas a la consulta.
*   Las variables de baja o desactivación lógica se envían como `0` o `False`.

---

## 4. Configuración SMTP (Notificaciones de Soporte)

El módulo de reporte de fallos utiliza el protocolo SMTP para notificar de forma síncrona al administrador del sistema.

### Configuración del archivo `.env`
Las credenciales se cargan mediante la librería `python-dotenv` y se configuran de la siguiente manera:
*   `MAIL_SERVER = smtp.gmail.com`
*   `MAIL_PORT = 587`
*   `MAIL_USERNAME = suarezyostin967@gmail.com`
*   `MAIL_PASSWORD = wzgsckdgwbhskyie` (Contraseña de aplicación de Google)
*   `MAIL_DEFAULT_SENDER = suarezyostin967@gmail.com`

*Nota: Si la conexión con el servidor SMTP de Gmail falla debido a problemas de red, el sistema captura el error y escribe una simulación de correo HTML visualizable localmente en `/static/emails/reporte_error_<id>.html`.*

---

## 5. Procedimiento de Despliegue Local

### Requisitos Previos
1.  Instalar Python 3.10 o superior.
2.  Instalar SQL Server Express y tener activa la base de datos `SYSTEM_WORDGYM`.

### Paso 1: Instalar Dependencias
Instale los paquetes necesarios ejecutando el siguiente comando en la terminal:
```bash
pip install Flask pyodbc python-dotenv python-docx openpyxl
```

### Paso 2: Iniciar SQL Server
Asegúrese de que el servicio de SQL Server esté corriendo. En Windows, ejecute en PowerShell como Administrador:
```powershell
Start-Service -Name MSSQLSERVER
```

### Paso 3: Arrancar el Servidor Web
Ejecute la aplicación en el puerto de desarrollo por defecto:
```bash
python app.py
```
Abra [http://localhost:5000](http://localhost:5000) en su navegador para acceder a la aplicación.
