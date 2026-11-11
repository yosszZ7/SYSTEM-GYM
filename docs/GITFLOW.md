# Modelo de Ramificación GitFlow — WORLD GYM

Este repositorio implementa el flujo de trabajo estándar **GitFlow** para la gestión ágil, organizada y colaborativa del código fuente del sistema **WORLD GYM**.

---

## 1. Estructura de Ramas

```
[ main ]          --------------------● (v1.0.0 Release) --------------------● (v2.0.0 Release)
                        \            /                              /
[ develop ]       -------●----------●------------------------------● (Integración activa)
                          \        /                              /
[ feature/* ]              ●------● (feature/tienda-membresias) --●
```

### Ramas Principales (Infinitas)
* **`main`**: Contiene únicamente el código estable listo para producción. Cada commit en esta rama representa un despliegue oficial y verificado.
* **`develop`**: Rama principal de desarrollo donde se integran todas las funcionalidades completadas y testeadas antes de publicarlas en producción.

### Ramas de Apoyo (Temporales)
* **`feature/<nombre>`**: Ramas derivadas de `develop` para construir nuevas funcionalidades sin interferir con el resto del equipo. Se fusionan de vuelta a `develop` mediante Pull Request o commit de integración `--no-ff`.
  - *Ejemplos*: `feature/tienda-membresias`, `feature/autenticacion-clientes`, `feature/reportes-kpi`.
* **`release/<version>`**: Ramas de estabilización y preparación para salida a producción.
* **`hotfix/<nombre>`**: Ramas de corrección crítica inmediata derivadas directamente de `main`.

---

## 2. Convenciones de Nomenclatura de Ramas
* Nuevas características: `feature/<modulo>-<descripcion-corta>`
* Corrección de bugs: `bugfix/<modulo>-<descripcion>` o `hotfix/<urgencia>`
* Versiones de entrega: `release/v<mayor>.<menor>.<parche>`

---

## 3. Estado de Ramas Activas del Proyecto
* **`main`**: Versión operativa estable del sistema de gestión para gimnasio.
* **`develop`**: Entorno de integración continuo sincronizado.
* **`feature/tienda-membresias`**: Módulo web de tienda online, catálogo de suplementos, comprobantes de pago y asignación de planes.
