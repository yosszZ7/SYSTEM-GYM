from unittest.mock import patch
from backend.servicios.TiendaServicio import (
    InferirCategoriaTienda,
    EnriquecerProducto,
    ObtenerCatalogoTienda,
    ObtenerResumenTienda,
    EnriquecerMembresiasTienda,
    ProcesarPedidoTienda,
)


class TestTiendaServicio:
    """Pruebas unitarias para la organización funcional y datos reales de la Tienda WORLDGYM."""

    def test_clasificacion_correcta_categorias_suplementos(self):
        """Evita falsos positivos en bebidas isotónicas/energizantes y clasifica las 6 categorías."""
        assert InferirCategoriaTienda("Bebida Isotónica 600ml", "Gatorade", "Bebidas") == "Bebidas energéticas"
        assert InferirCategoriaTienda("Bebida Energizante 600ml", "Raptor", "Bebidas") == "Bebidas energéticas"
        assert InferirCategoriaTienda("Proteína Whey Gold Standard 5lb", "Optimum Nutrition", "Suplementos") == "Proteínas"
        assert InferirCategoriaTienda("Creatina Monohidratada 300g", "MuscleTech", "Suplementos") == "Creatina"
        assert InferirCategoriaTienda("C4 Original Pre-Workout 30 serv", "Cellucor", "Suplementos") == "Preentrenos"
        assert InferirCategoriaTienda("Serious Mass Gainer 6lb", "Optimum Nutrition", "Suplementos") == "Ganadores de masa"
        assert InferirCategoriaTienda("Shaker Mezclador Antiderrames", "WORLDGYM", "Accesorios") == "Accesorios"

    def test_enriquecer_producto_estados_stock_y_presentacion_limpia(self):
        """Diferencia Disponible, Últimas unidades, Agotado e Inactivo y limpia textos redundantes."""
        prod_disp = EnriquecerProducto({
            "IdProducto": 10,
            "NombreProducto": "Multivitamínico Deportivo 60 caps",
            "Marca": "Centrum",
            "Categoria": "Suplementos",
            "Precio": 450.0,
            "Stock": 20,
            "Presentacion": "Presentación estándar de gimnasio",
        }, mapa_meta={})
        assert prod_disp["Presentacion"] == "60 cápsulas"
        assert prod_disp["ContenidoTamano"] == "60 cápsulas"
        assert prod_disp["EstadoDisponibilidad"] == "Disponible"
        assert prod_disp["Disponible"] is True
        assert prod_disp["PrecioAnterior"] is None

        prod_ultimas = EnriquecerProducto({
            "IdProducto": 11,
            "NombreProducto": "Creatina Monohidratada 300g",
            "Marca": "MuscleTech",
            "Categoria": "Suplementos",
            "Precio": 950.0,
            "Stock": 3,
        }, mapa_meta={})
        assert prod_ultimas["EstadoDisponibilidad"] == "Últimas unidades"
        assert prod_ultimas["ClaseStock"] == "bajo"

        prod_agotado = EnriquecerProducto({
            "IdProducto": 12,
            "NombreProducto": "Guantes Pro",
            "Marca": "WORLDGYM",
            "Categoria": "Accesorios",
            "Precio": 350.0,
            "Stock": 0,
        }, mapa_meta={})
        assert prod_agotado["EstadoDisponibilidad"] == "Agotado"
        assert prod_agotado["Disponible"] is False

        prod_inactivo = EnriquecerProducto({
            "IdProducto": 13,
            "NombreProducto": "Producto Descontinuado",
            "Marca": "Test",
            "Categoria": "Suplementos",
            "Precio": 200.0,
            "Stock": 10,
            "Estado": "Inactivo",
        }, mapa_meta={})
        assert prod_inactivo["EstadoProducto"] == "Inactivo"
        assert prod_inactivo["Disponible"] is False

    @patch("backend.servicios.TiendaServicio.ObtenerMapaMetaProductos")
    @patch("backend.servicios.TiendaServicio.ObtenerMapaVentasProductos")
    @patch("backend.servicios.TiendaServicio.ListarProductos")
    def test_deduplicacion_variantes_y_resumen_categorias(self, mock_listar, mock_ventas, mock_meta):
        """Deduplica lotes repetidos, agrupa variantes por familia y calcula conteos reales."""
        mock_meta.return_value = {
            "88": {"EsDemo": True},
            "99": {"VisibleTienda": False}
        }
        mock_ventas.return_value = {2: 5, 22: 6, 3: 4}
        mock_listar.return_value = (True, [
            {"IdProducto": 2, "NombreProducto": "Agua Purificada 600ml", "Marca": "FUENTE PURA", "Categoria": "Bebidas", "Precio": 20.0, "Stock": 40, "FechaRegistro": "13/06/2026"},
            {"IdProducto": 22, "NombreProducto": "Agua Purificada 600ml", "Marca": "FUENTE PURA", "Categoria": "Bebidas", "Precio": 20.0, "Stock": 40, "FechaRegistro": "15/06/2026"},
            {"IdProducto": 3, "NombreProducto": "Agua Purificada 1 Litro", "Marca": "FUENTE PURA", "Categoria": "Bebidas", "Precio": 38.0, "Stock": 30, "FechaRegistro": "13/06/2026"},
            {"IdProducto": 42, "NombreProducto": "Creatina Monohidratada 300g", "Marca": "Optimum Nutrition", "Categoria": "Suplementos", "Precio": 800.0, "Stock": 12, "FechaRegistro": "22/06/2026"},
            {"IdProducto": 88, "NombreProducto": "Producto Demo BD", "Marca": "Demo", "Categoria": "Suplementos", "Precio": 99.0, "Stock": 10, "FechaRegistro": "13/06/2026"},
            {"IdProducto": 99, "NombreProducto": "Oculto", "Marca": "Test", "Categoria": "Suplementos", "Precio": 100.0, "Stock": 5, "FechaRegistro": "13/06/2026"},
        ])

        catalogo = ObtenerCatalogoTienda(incluir_ocultos=False, incluir_demos=False)
        assert len(catalogo) == 3  # 2 presentaciones de Agua Purificada + 1 Creatina (#22 duplicado, #88 demo y #99 oculto excluidos)

        agua_600 = next(p for p in catalogo if p["IdProducto"] == 2)
        assert agua_600["UnidadesVendidas"] == 11  # 5 + 6 acumulados de ambos lotes reales
        assert len(agua_600["Variantes"]) == 2

        creatina = next(p for p in catalogo if p["IdProducto"] == 42)
        assert creatina["EsNuevo"] is True

        resumen = ObtenerResumenTienda(catalogo)
        mapa_cats = {c["clave"]: c["totales"] for c in resumen["categorias"]}
        assert mapa_cats["Bebidas energéticas"] == 2  # Coincidencia 1 a 1 con las 2 presentaciones activas en la rejilla
        assert mapa_cats["Creatina"] == 1
        assert mapa_cats["Accesorios"] == 0
        assert resumen["total_productos_unicos"] == 3
        assert resumen["tiene_ventas_reales"] is True

    @patch("backend.servicios.TiendaServicio.ReporteMembresiasActivas")
    def test_enriquecer_membresias_conserva_precios_y_planes(self, mock_activas):
        """Conserva intactos los 4 planes y precios reales, marcando el mensual como popular."""
        mock_activas.return_value = (True, [{"IdMembresia": 4, "TotalClientesActivos": 8}])
        planes = EnriquecerMembresiasTienda(None)
        assert len(planes) == 4
        assert [p["Precio"] for p in planes] == [50.0, 150.0, 300.0, 500.0]
        mensual = next(p for p in planes if p["IdMembresia"] == 4)
        assert mensual["EsPopular"] is True
        assert mensual["SociosActivos"] == 8
        assert len(mensual["Beneficios"]) >= 2

    @patch("backend.servicios.TiendaServicio.ObtenerCatalogoTienda")
    @patch("backend.servicios.TiendaServicio.ObtenerMapaMetaProductos")
    @patch("backend.servicios.TiendaServicio.ListarProductos")
    def test_procesar_pedido_rechaza_sin_stock_o_exceso(self, mock_listar, mock_meta, mock_cat):
        """Impide confirmar compras de productos agotados o por encima de existencias reales."""
        mock_meta.return_value = {}
        mock_cat.return_value = []
        mock_listar.return_value = (True, [
            {"IdProducto": 5, "NombreProducto": "Creatina 300g", "Marca": "MuscleTech", "Categoria": "Suplementos", "Precio": 950.0, "Stock": 2},
            {"IdProducto": 6, "NombreProducto": "Agotado Test", "Marca": "MuscleTech", "Categoria": "Suplementos", "Precio": 500.0, "Stock": 0},
        ])

        ok_agotado, msg_agotado, _ = ProcesarPedidoTienda([{"IdProducto": 6, "Cantidad": 1}])
        assert ok_agotado is False
        assert "insuficiente" in msg_agotado.lower() or "existencias" in msg_agotado.lower()

        ok_exceso, msg_exceso, _ = ProcesarPedidoTienda([{"IdProducto": 5, "Cantidad": 4}])
        assert ok_exceso is False
        assert "existencias" in msg_exceso.lower()


    @patch("app.EnriquecerMembresiasTienda", return_value=[])
    @patch("app.ListarMembresias", return_value=(True, []))
    @patch("app.ObtenerResumenTienda", return_value={"categorias": [], "marcas": [], "ofertas_count": 0, "total_productos_unicos": 0, "otros_suplementos_totales": 0})
    @patch("app.ObtenerCatalogoTienda", return_value=[])
    def test_inicio_muestra_pagina_web_y_controla_permisos_admin(self, _mock_cat, _mock_res, _mock_mem, _mock_enr):
        """Al iniciar el sistema (/) muestra la página web, exige login para comprar y oculta el panel admin a visitantes y clientes."""
        from app import app
        app.config["TESTING"] = True

        with app.test_client() as client:
            # 1. Visitante no autenticado ve la página web al entrar a '/'
            resp_home = client.get("/")
            assert resp_home.status_code == 200
            html_home = resp_home.get_data(as_text=True)
            assert "WorldGym Store" in html_home
            assert 'id="storeAuthModal"' in html_home
            assert 'id="storeSystemBar"' not in html_home
            assert "window.USUARIO_AUTENTICADO = false;" in html_home
            assert "window.ES_ADMIN_TIENDA = false;" in html_home

            # 2. Visitante no autenticado no puede comprar sin iniciar sesión o registrarse
            resp_checkout = client.post("/api/tienda/checkout", json={"items": [{"IdProducto": 1, "Cantidad": 1}]})
            assert resp_checkout.status_code == 401
            data_checkout = resp_checkout.get_json()
            assert data_checkout["success"] is False
            assert data_checkout["requiere_login"] is True

            # 3. Visitante no autenticado no puede acceder a /dashboard
            resp_dash_guest = client.get("/dashboard")
            assert resp_dash_guest.status_code == 302
            assert "/login" in resp_dash_guest.headers["Location"]

            # 4. Usuario con rol Cliente puede ver la tienda pero NO ve el panel de administrador ni accede a /dashboard
            with client.session_transaction() as sess:
                sess["usuario_id"] = 99
                sess["usuario_nombre"] = "cliente_prueba"
                sess["rol"] = "Cliente"
                sess["cliente_id"] = 50

            resp_client_store = client.get("/")
            assert resp_client_store.status_code == 200
            html_client = resp_client_store.get_data(as_text=True)
            assert 'id="storeSystemBar"' not in html_client
            assert "window.USUARIO_AUTENTICADO = true;" in html_client
            assert "window.ES_ADMIN_TIENDA = false;" in html_client

            resp_dash_client = client.get("/dashboard")
            assert resp_dash_client.status_code == 302
            assert "/tienda" in resp_dash_client.headers["Location"]

            # 5. Usuario con rol Administrador sí ve el Panel de Administrador y accede a /dashboard
            with client.session_transaction() as sess:
                sess["usuario_id"] = 1
                sess["usuario_nombre"] = "admin_wg"
                sess["rol"] = "Administrador"

            resp_admin_store = client.get("/")
            assert resp_admin_store.status_code == 200
            html_admin = resp_admin_store.get_data(as_text=True)
            assert 'id="storeSystemBar"' in html_admin
            assert "Panel de Administrador" in html_admin
            assert "window.USUARIO_AUTENTICADO = true;" in html_admin
            assert "window.ES_ADMIN_TIENDA = true;" in html_admin

            resp_dash_admin = client.get("/dashboard")
            assert resp_dash_admin.status_code == 200
