# Plan de Integración: Frontend y Backend - GYM SISTEM (Actualizado)

Este documento detalla el plan técnico para crear la aplicación principal `app.py` directamente dentro de la carpeta **`GYM SISTEM`**, conectando sus plantillas y archivos estáticos con los servicios del backend de base de datos localizados en `backend/servicios`.

---

## ⚠️ Acción Requerida por el Usuario

El servicio de base de datos SQL Server (`MSSQLSERVER`) se encuentra actualmente **detenido** en tu máquina (`yostin`). Para que la aplicación pueda conectarse y funcionar, debes iniciarlo.

> [!IMPORTANT]
> **Cómo iniciar el servicio de SQL Server:**
> 1. Abre la terminal **PowerShell como Administrador** en tu máquina.
> 2. Ejecuta el siguiente comando para iniciar el servicio:
>    ```powershell
>    Start-Service -Name MSSQLSERVER
>    ```
> 3. O bien abre el panel de **Servicios** de Windows (`services.msc`), busca **SQL Server (MSSQLSERVER)** y haz clic en **Iniciar**.

---

## Preguntas Abiertas

> [!NOTE]
> Para soportar la edición en el sistema, crearé los servicios de actualización faltantes para Empleados, Maquinarias, Mantenimientos y Usuarios dentro de la carpeta `GYM SISTEM/backend/servicios`. Estos servicios usarán un sistema de *fallback*: intentarán llamar a los procedimientos almacenados (ej. `SpActualizarEmpleado`), y si fallan porque no existen en tu base de datos, ejecutarán un `UPDATE` de SQL directo. ¿Estás de acuerdo con este enfoque?

---

## Cambios Propuestos

Todos los archivos se crearán y modificarán dentro de **`GYM SISTEM`**.

### 1. Componente: Servicios de Backend (Base de Datos)

Crearemos los archivos de servicio de base de datos que falten en `backend/servicios` para soportar las operaciones del sistema de gimnasio:

#### [NEW] [ActualizarEmpleado.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/backend/servicios/ActualizarEmpleado.py)
* Actualizar datos personales y salario de empleados mediante SP o fallback SQL.

#### [NEW] [ActualizarMaquinaria.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/backend/servicios/ActualizarMaquinaria.py)
* Actualizar el nombre, tipo y estado de una máquina en el inventario.

#### [NEW] [RegistrarMaquinaria.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/backend/servicios/RegistrarMaquinaria.py)
* Registrar una nueva máquina en la base de datos.

#### [NEW] [ActualizarUsuario.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/backend/servicios/ActualizarUsuario.py)
* Editar usuarios del sistema (rol, estado, relaciones con cliente/empleado).

#### [NEW] [ListarMantenimientos.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/backend/servicios/ListarMantenimientos.py)
* Listar el historial de mantenimiento de máquinas.

#### [NEW] [ActualizarMantenimiento.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/backend/servicios/ActualizarMantenimiento.py)
* Actualizar fecha, descripción y estado del mantenimiento.

#### [NEW] [ListarAsistenciasEmpleados.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/backend/servicios/ListarAsistenciasEmpleados.py)
* Obtener listado de asistencias de empleados.

---

### 2. Componente: Aplicación Web Flask

#### [NEW] [app.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/app.py)
* **Creación del servidor:** Crear el archivo principal que levanta el servidor Flask.
* **Autenticación real (`/api/login`):** Conectar con `LoginUsuario`.
* **Dashboard estadístico:** Consumir datos reales de la base de datos para calcular los totales.
* **Integración de Rutas:**
  * **Clientes:** Listar (`ListarClientes`), registrar (`RegistrarCliente`), actualizar (`ActualizarCliente`), buscar (`BuscarClientePorNombre`), asignar entrenador (`AsignarEntrenadorCliente`), asignar membresía (`AsignarMembresia`) y registrar asistencia (`RegistrarAsistenciaCliente`).
  * **Empleados:** Listar (`ListarEmpleados`), registrar (`RegistrarEmpleado`), actualizar (`ActualizarEmpleado`), buscar (`BuscarEmpleadoPorNombre`), registrar asistencia (`RegistrarAsistenciaEmpleado`) y registrar pagos (`RegistrarPagoEmpleado`).
  * **Productos & Inventario:** Listar y registrar productos (`ListarProductos`, `RegistrarProducto`, `ActualizarProducto`), entrada/salida de stock e historial de movimientos.
  * **Ejercicios & Rutinas:** Rutas de listado, creación y edición vinculadas a la BD.
  * **Ventas & Compras:** Registrar ventas individuales, múltiples y compras a proveedores vinculadas a la BD.
  * **Usuarios & Seguridad:** Listar usuarios, crear usuarios y cambiar contraseña contra la base de datos.
  * **Maquinaria & Mantenimiento:** Rutas de registro y edición de maquinaria y mantenimiento.
  * **Reportes:** Reporte de ingresos mensuales, ventas por producto, membresías activas y asistencias conectadas a los servicios correspondientes.

---

## Plan de Verificación

### Pruebas Automatizadas
* Ejecutar un script rápido para probar la importación de todos los módulos y la conexión a SQL Server una vez esté activo.

### Verificación Manual
1. Iniciar la aplicación (`python app.py`) desde el directorio `GYM SISTEM`.
2. Verificar en `http://localhost:5000` que el login, listados e inserciones se reflejen en tiempo real en la base de datos SQL Server.
