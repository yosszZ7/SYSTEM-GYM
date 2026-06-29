# Manual de Usuario - SYSTEM WORDGYM

Este manual describe de forma directa y precisa las operaciones principales para administrar el **SYSTEM WORDGYM**. 

---

## 1. Acceso al Sistema

### Iniciar Sesión
1. Inicie el servidor local y acceda a [http://localhost:5000](http://localhost:5000) en su navegador web.
2. Ingrese su **Nombre de Usuario** y **Contraseña** registrados.
3. Presione el botón **Iniciar Sesión**. En caso de éxito, será redirigido al Dashboard principal.

---

## 2. Panel de Control (Dashboard)

El Dashboard presenta un resumen visual e interactivo del estado actual del gimnasio:
*   **Métricas Rápidas**: Visualización de la cantidad de clientes activos, empleados en nómina, productos en inventario y asistencias del día.
*   **Gráficos Estadísticos**: 
    *   **Ingresos Mensuales**: Gráfico de barras que detalla las ganancias de los últimos meses.
    *   **Ventas de Productos**: Gráfico de líneas que ilustra la tendencia de ventas del inventario.
*   **Barra Lateral de Navegación**: Menú interactivo para acceder a todos los módulos del sistema.

---

## 3. Gestión de Clientes

### Listado y Búsqueda Inteligente
*   **Ver Clientes**: Vaya a **Clientes** > **Lista de Clientes** en el menú lateral.
*   **Buscar Cliente**: En la parte superior de la lista, introduzca el nombre en la barra de búsqueda. El buscador es **insensible a acentos y mayúsculas** (puede buscar `"andres"` y encontrará a `"Andrés"`).

### Registrar Cliente
1. Vaya a **Clientes** > **Registrar Cliente**.
2. Rellene el formulario con los datos personales (Nombres, Apellidos, Teléfono, Correo).
3. Presione **Registrar**.

### Asignar Membresía y Rutinas
*   En la **Lista de Clientes**, haga clic en los botones de acción de la fila del cliente:
    *   **Asignar Membresía**: Seleccione el tipo de membresía (mensual, semanal, diaria) y confirme la transacción.
    *   **Asignar Rutina**: Defina los días de entrenamiento, asigne los grupos musculares (ej: Pecho, Piernas) y agregue los ejercicios específicos desde el catálogo.

---

## 4. Gestión de Productos e Inventario

### Catálogo de Productos
*   Acceda a **Productos** > **Lista de Productos** para ver el catálogo disponible con sus precios y stock actualizados en tiempo real.
*   Para registrar un producto nuevo, vaya a **Registrar Producto**, ingrese el nombre, descripción, precio y el **Stock Inicial** (por defecto 0).

### Movimientos de Inventario
*   **Entradas**: Si recibe mercancía existente, vaya a **Inventario** > **Entrada**, seleccione el producto, ingrese la cantidad ingresada y guarde para aumentar el stock.
*   **Salidas**: Para dar de baja productos por caducidad o pérdida, use **Inventario** > **Salida** para descontar unidades del stock.

---

## 5. Control de Compras (Abastecimiento)

### Registrar Compra
1. Vaya a **Compras** > **Nueva Compra**.
2. Seleccione el **Proveedor** y el **Producto** de los menús desplegables (se cargan dinámicamente de la base de datos).
3. Ingrese la **Cantidad**, el **Precio Unitario de Compra**, el **Estado** (`'Recibida'` o `'Pendiente'`) y añada una observación opcional.
4. Presione **Registrar Compra**. El sistema sumará automáticamente el stock al inventario.

### Anular Compra
*   En **Compras** > **Lista de Compras**, busque la fila de la transacción y presione el botón **Anular Compra** (icono rojo de prohibido). El estado cambiará a **Anulada** y se revertirá el flujo contable.

---

## 6. Control de Maquinaria y Mantenimiento

### Inventario de Maquinaria
*   Vaya a **Maquinaria** > **Listar Maquinaria** para ver los equipos del gimnasio y su estado operativo (activo/inactivo).
*   Use **Registrar Maquinaria** para dar de alta nuevos equipos deportivos detallando su tipo y fecha de compra.

### Mantenimiento Preventivo
*   Vaya a **Maquinaria** > **Listar Mantenimientos** para ver el historial clínico de reparaciones.
*   Para programar una reparación, presione **Registrar Mantenimiento**, elija el equipo del menú desplegable, detalle el trabajo realizado (ej. *"Cambio de cable de acero y engrase de poleas"*) y elija la fecha de ejecución.

---

## 7. Soporte Técnico y Reporte de Errores

Si detecta un fallo en el sistema:
1. Diríjase a **Soporte** > **Reportar Error** en el menú lateral.
2. Complete el formulario seleccionando el **Módulo Afectado**, el **Nivel de Prioridad** (Bajo, Medio, Alto, Crítico) y una **Descripción detallada** del fallo.
3. Ingrese el correo electrónico del administrador (por defecto `suarezyostin967@gmail.com`).
4. Presione **Enviar Reporte**. El sistema registrará el fallo en base de datos y despachará una notificación por correo SMTP al administrador.
