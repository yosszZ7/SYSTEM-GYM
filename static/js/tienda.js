/**
 * WORLDGYM STORE — Arquitectura Multivista (#inicio, #membresias, #productos, #ofertas)
 * Conserva 100% la identidad visual, encabezado y lógica de negocio de WORLDGYM.
 * En cada momento solo UNA vista existe en el DOM (#storeViewRoot), sin recargar página.
 */

(function () {
    'use strict';

    const CART_STORAGE_KEY = 'worldgym_store_cart_v1';
    const PAGE_SIZE = 24;
    const DEBOUNCE_MS = 250;

    const VISTAS_VALIDAS = new Set(['inicio', 'membresias', 'productos', 'ofertas']);

    const ETIQUETAS_CATEGORIA = {
        'Todos': 'Productos',
        'Proteínas': 'Proteínas',
        'Creatina': 'Creatinas',
        'Preentrenos': 'Pre-entrenos',
        'Ganadores de masa': 'Mass Gainer',
        'Bebidas energéticas': 'Bebidas y energía',
        'Accesorios': 'Accesorios',
        'Suplementos': 'Aminoácidos y vitaminas'
    };

    const ORDEN_CATEGORIAS_SIDEBAR = [
        { clave: 'Todos', nombre: 'Todas las categorías' },
        { clave: 'Proteínas', nombre: 'Proteínas' },
        { clave: 'Creatina', nombre: 'Creatinas' },
        { clave: 'Preentrenos', nombre: 'Pre-entrenos' },
        { clave: 'Ganadores de masa', nombre: 'Mass Gainer' },
        { clave: 'Bebidas energéticas', nombre: 'Bebidas y energía' },
        { clave: 'Accesorios', nombre: 'Accesorios' },
        { clave: 'Suplementos', nombre: 'Aminoácidos y vitaminas', ocultarSiCero: true }
    ];

    const OPCIONES_DISPONIBILIDAD = [
        { valor: 'todos', etiqueta: 'Todos' },
        { valor: 'disponibles', etiqueta: 'Disponible' },
        { valor: 'ultimas', etiqueta: 'Últimas unidades' },
        { valor: 'agotados', etiqueta: 'Agotado' }
    ];

    let catalogoProductos = Array.isArray(window.CATALOGO_INICIAL) ? window.CATALOGO_INICIAL : [];
    let cargandoCatalogo = false;
    let errorCargaCatalogo = '';

    let vistaActual = '';
    let carrito = [];
    let busquedaMarcaSidebar = '';
    let paginaOfertas = 1;

    let timerBusqueda = null;
    let timerPrecio = null;
    let ultimoElementoEnfocado = null;
    let planTiendaActual = { id: '', titulo: '', precio: '', duracion: '' };

    let estadoFiltros = crearEstadoFiltrosInicial();

    function crearEstadoFiltrosInicial() {
        return {
            busqueda: '',
            categoria: 'Todos',
            marca: '',
            precioMin: '',
            precioMax: '',
            disponibilidad: 'todos',
            soloOfertas: false,
            soloNuevos: false,
            orden: 'relevancia',
            pagina: 1
        };
    }

    function escaparHtml(valor) {
        return String(valor == null ? '' : valor)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalizarTexto(valor) {
        return String(valor == null ? '' : valor)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
    }

    function formatearCordobas(monto) {
        const num = Number(monto || 0);
        return 'C$' + num.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function esProductoPublicoActivo(p) {
        if (!p) return false;
        if (p.VisibleTienda === false) return false;
        if (p.EsDemo === true) return false;
        const estado = normalizarTexto(p.EstadoProducto || 'Activo');
        return estado === 'activo';
    }

    function obtenerProductosActivosBase() {
        return catalogoProductos.filter(esProductoPublicoActivo);
    }

    function existenVentasReales() {
        return obtenerProductosActivosBase().some(p => Number(p.UnidadesVendidas || 0) > 0);
    }

    function obtenerTextoPresentacion(p) {
        const pres = String(p.Presentacion || '').trim();
        const tam = String(p.ContenidoTamano || '').trim();
        if (pres && tam) {
            const presN = normalizarTexto(pres);
            const tamN = normalizarTexto(tam);
            if (presN.includes(tamN)) return pres;
            if (tamN.includes(presN)) return tam;
            return `${pres} • ${tam}`;
        }
        return pres || tam || 'Envase estándar';
    }

    /* ======================================================================
        ACCESIBILIDAD: GESTIÓN Y ATRAPADO DE FOCO EN MODALES
       ====================================================================== */
    function obtenerElementosEnfocables(contenedor) {
        if (!contenedor) return [];
        const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        return Array.from(contenedor.querySelectorAll(selector)).filter(el => el.offsetParent !== null);
    }

    function obtenerContenedorModalActivo() {
        const modalPlan = document.getElementById('wgModalPlan');
        if (modalPlan && modalPlan.classList.contains('active')) {
            return modalPlan.querySelector('.wg-modal-dialog');
        }
        const modalProd = document.getElementById('storeProductModal');
        if (modalProd && modalProd.classList.contains('open')) {
            return modalProd.querySelector('.store-modal-card');
        }
        const modalRec = document.getElementById('storeReceiptModal');
        if (modalRec && modalRec.classList.contains('open')) {
            return modalRec.querySelector('.store-modal-card');
        }
        const drawerCart = document.getElementById('storeCartDrawer');
        if (drawerCart && drawerCart.classList.contains('open')) {
            return drawerCart;
        }
        return null;
    }

    function manejarTecladoGlobal(e) {
        if (e.key === 'Escape') {
            cerrarDetalleMembresiaTienda();
            cerrarModalProducto();
            cerrarModalComprobante();
            cerrarCarrito();
            cerrarSidebarFiltrosMovil();
            return;
        }

        if (e.key === 'Tab') {
            const modalActivo = obtenerContenedorModalActivo();
            if (!modalActivo) return;
            const enfocables = obtenerElementosEnfocables(modalActivo);
            if (enfocables.length === 0) return;

            const primero = enfocables[0];
            const ultimo = enfocables[enfocables.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === primero || !modalActivo.contains(document.activeElement)) {
                    e.preventDefault();
                    ultimo.focus();
                }
            } else {
                if (document.activeElement === ultimo || !modalActivo.contains(document.activeElement)) {
                    e.preventDefault();
                    primero.focus();
                }
            }
        }
    }

    /* ======================================================================
        ROUTER DE VISTAS Y ESTADO EN URL (#inicio, #membresias, #productos, #ofertas)
       ====================================================================== */
    function resolverCategoriaCanonica(valorCat) {
        if (!valorCat) return 'Todos';
        const norm = normalizarTexto(valorCat);
        for (const item of ORDEN_CATEGORIAS_SIDEBAR) {
            if (normalizarTexto(item.clave) === norm || normalizarTexto(item.nombre) === norm) {
                return item.clave;
            }
        }
        return 'Todos';
    }

    function leerRutaDesdeUrl() {
        const rawHash = String(window.location.hash || '').replace(/^#/, '').trim();
        let nombreVista = '';
        let params = new URLSearchParams();

        if (rawHash) {
            const idxQ = rawHash.indexOf('?');
            if (idxQ !== -1) {
                nombreVista = rawHash.slice(0, idxQ).toLowerCase();
                params = new URLSearchParams(rawHash.slice(idxQ + 1));
            } else {
                nombreVista = rawHash.toLowerCase();
            }
        } else if (window.location.search) {
            const searchParams = new URLSearchParams(window.location.search);
            nombreVista = String(searchParams.get('vista') || '').toLowerCase();
            params = searchParams;
        }

        // Compatibilidad con anclas antiguas si existieran en favoritos del navegador
        if (nombreVista === 'membresiassection') nombreVista = 'membresias';
        if (nombreVista === 'catalogosection') nombreVista = 'productos';
        if (!VISTAS_VALIDAS.has(nombreVista)) nombreVista = 'inicio';

        const filtros = crearEstadoFiltrosInicial();
        if (nombreVista === 'productos') {
            if (params.has('cat')) filtros.categoria = resolverCategoriaCanonica(params.get('cat'));
            if (params.has('marca')) filtros.marca = String(params.get('marca') || '').trim();
            if (params.has('min')) filtros.precioMin = String(params.get('min') || '').trim();
            if (params.has('max')) filtros.precioMax = String(params.get('max') || '').trim();
            const disp = String(params.get('disp') || 'todos').toLowerCase();
            if (OPCIONES_DISPONIBILIDAD.some(o => o.valor === disp)) {
                filtros.disponibilidad = disp;
            }
            filtros.soloOfertas = params.get('oferta') === '1';
            filtros.soloNuevos = params.get('nuevo') === '1';
            if (params.has('q')) filtros.busqueda = String(params.get('q') || '');
            const ord = String(params.get('orden') || 'relevancia');
            const ordenesPermitidos = ['relevancia', 'mas_vendidos', 'precio_asc', 'precio_desc', 'recientes', 'nombre_asc'];
            if (ordenesPermitidos.includes(ord)) {
                filtros.orden = (ord === 'mas_vendidos' && !existenVentasReales()) ? 'relevancia' : ord;
            }
            const pag = Math.max(1, parseInt(params.get('pag') || '1', 10) || 1);
            filtros.pagina = pag;
        }

        const pagOf = nombreVista === 'ofertas'
            ? Math.max(1, parseInt(params.get('pag') || '1', 10) || 1)
            : 1;

        return { vista: nombreVista, filtros: filtros, paginaOfertas: pagOf };
    }

    function construirHashDeEstado() {
        if (vistaActual === 'inicio') return '#inicio';
        if (vistaActual === 'membresias') return '#membresias';
        if (vistaActual === 'ofertas') {
            return paginaOfertas > 1 ? `#ofertas?pag=${paginaOfertas}` : '#ofertas';
        }

        const params = new URLSearchParams();
        if (estadoFiltros.categoria && estadoFiltros.categoria !== 'Todos') {
            params.set('cat', estadoFiltros.categoria);
        }
        if (estadoFiltros.marca) params.set('marca', estadoFiltros.marca);
        if (estadoFiltros.precioMin !== '') params.set('min', estadoFiltros.precioMin);
        if (estadoFiltros.precioMax !== '') params.set('max', estadoFiltros.precioMax);
        if (estadoFiltros.disponibilidad !== 'todos') params.set('disp', estadoFiltros.disponibilidad);
        if (estadoFiltros.soloOfertas) params.set('oferta', '1');
        if (estadoFiltros.soloNuevos) params.set('nuevo', '1');
        if (estadoFiltros.busqueda.trim()) params.set('q', estadoFiltros.busqueda.trim());
        if (estadoFiltros.orden !== 'relevancia') params.set('orden', estadoFiltros.orden);
        if (estadoFiltros.pagina > 1) params.set('pag', String(estadoFiltros.pagina));

        const qs = params.toString();
        return qs ? `#productos?${qs}` : '#productos';
    }

    function sincronizarUrlConEstado(reemplazar) {
        const nuevoHash = construirHashDeEstado();
        if (window.location.hash === nuevoHash) return;
        const urlCompleta = window.location.pathname + nuevoHash;
        if (reemplazar) {
            window.history.replaceState(null, '', urlCompleta);
        } else {
            window.history.pushState(null, '', urlCompleta);
        }
    }

    function cerrarDropdownsHeader() {
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            const dentroNav = document.activeElement.closest('.store-nav-item');
            if (dentroNav) document.activeElement.blur();
        }
    }

    function actualizarNavegacionActivaHeader() {
        document.querySelectorAll('[data-nav-view]').forEach(link => {
            const esActiva = link.getAttribute('data-nav-view') === vistaActual;
            link.classList.toggle('active', esActiva);
            if (esActiva) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        const btnCatNav = document.querySelector('[data-nav-dropdown="categoria"]');
        if (btnCatNav) {
            btnCatNav.classList.toggle('active', vistaActual === 'productos' && estadoFiltros.categoria !== 'Todos');
        }
        const btnMarcaNav = document.querySelector('[data-nav-dropdown="marca"]');
        if (btnMarcaNav) {
            btnMarcaNav.classList.toggle('active', vistaActual === 'productos' && Boolean(estadoFiltros.marca));
        }
    }

    function sincronizarBuscadorHeader() {
        const inputSearch = document.getElementById('storeSearchInput');
        const btnClear = document.getElementById('storeSearchClear');
        const textoActual = vistaActual === 'productos' ? estadoFiltros.busqueda : '';

        if (inputSearch && document.activeElement !== inputSearch && inputSearch.value !== textoActual) {
            inputSearch.value = textoActual;
        }
        if (btnClear) {
            const valorVisible = inputSearch ? inputSearch.value : textoActual;
            btnClear.style.display = valorVisible ? 'block' : 'none';
        }
    }

    function montarVista(nuevaVista, opciones) {
        const opts = opciones || {};
        const vistaObjetivo = VISTAS_VALIDAS.has(nuevaVista) ? nuevaVista : 'inicio';
        const root = document.getElementById('storeViewRoot');
        if (!root) return;

        const cambioDeVista = vistaActual !== vistaObjetivo || root.children.length === 0;
        vistaActual = vistaObjetivo;

        if (cambioDeVista) {
            cerrarSidebarFiltrosMovil();

            const mapaTemplates = {
                inicio: 'tplVistaInicio',
                membresias: 'tplVistaMembresias',
                productos: 'tplVistaProductos',
                ofertas: 'tplVistaOfertas'
            };
            const tpl = document.getElementById(mapaTemplates[vistaObjetivo]);
            root.innerHTML = '';
            if (tpl && tpl.content) {
                root.appendChild(tpl.content.cloneNode(true));
            }
            root.setAttribute('data-active-view', vistaObjetivo);

            if (vistaObjetivo === 'productos') {
                vincularEventosVistaProductos();
            }
        }

        actualizarNavegacionActivaHeader();
        sincronizarBuscadorHeader();
        actualizarBadgeOfertasHeader();

        if (vistaObjetivo === 'inicio') {
            renderizarVistaInicio();
        } else if (vistaObjetivo === 'productos') {
            renderizarVistaProductos();
        } else if (vistaObjetivo === 'ofertas') {
            renderizarVistaOfertas();
        }

        if (!opts.desdePopState) {
            sincronizarUrlConEstado(Boolean(opts.reemplazarHistorial));
        }

        if (cambioDeVista || opts.subirAlInicio) {
            window.scrollTo(0, 0);
        }
    }

    /* ======================================================================
        FUNCIONES PÚBLICAS DE NAVEGACIÓN ENTRE VISTAS
       ====================================================================== */
    window.navegarVistaTienda = function (vista, ev) {
        if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
        cerrarDropdownsHeader();
        if (vista === 'ofertas') {
            paginaOfertas = 1;
        }
        montarVista(vista, { subirAlInicio: true });
        return false;
    };

    window.navegarVistaProductosLimpia = function (ev) {
        if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
        cerrarDropdownsHeader();
        estadoFiltros = crearEstadoFiltrosInicial();
        busquedaMarcaSidebar = '';
        const inputSearch = document.getElementById('storeSearchInput');
        if (inputSearch) inputSearch.value = '';
        montarVista('productos', { subirAlInicio: true });
        return false;
    };

    window.abrirCategoriaDesdeMenu = function (categoria) {
        cerrarDropdownsHeader();
        estadoFiltros = crearEstadoFiltrosInicial();
        estadoFiltros.categoria = resolverCategoriaCanonica(categoria);
        busquedaMarcaSidebar = '';
        const inputSearch = document.getElementById('storeSearchInput');
        if (inputSearch) inputSearch.value = '';
        montarVista('productos', { subirAlInicio: true });
    };

    window.abrirMarcaDesdeMenu = function (marca) {
        cerrarDropdownsHeader();
        estadoFiltros = crearEstadoFiltrosInicial();
        estadoFiltros.marca = String(marca || '').trim();
        busquedaMarcaSidebar = '';
        const inputSearch = document.getElementById('storeSearchInput');
        if (inputSearch) inputSearch.value = '';
        montarVista('productos', { subirAlInicio: true });
    };

    window.ejecutarBusquedaHeader = function () {
        const input = document.getElementById('storeSearchInput');
        const q = input ? input.value.trim() : '';
        if (timerBusqueda) clearTimeout(timerBusqueda);
        estadoFiltros.busqueda = q;
        estadoFiltros.pagina = 1;
        montarVista('productos', { subirAlInicio: vistaActual !== 'productos' });
    };

    window.enfocarBuscador = function () {
        const input = document.getElementById('storeSearchInput');
        if (input) {
            input.focus();
        }
    };

    window.abrirSidebarFiltrosMovil = function () {
        document.getElementById('storeFiltersBackdrop')?.classList.add('open');
        document.getElementById('storeFiltersSidebar')?.classList.add('open');
    };

    window.cerrarSidebarFiltrosMovil = function () {
        document.getElementById('storeFiltersBackdrop')?.classList.remove('open');
        document.getElementById('storeFiltersSidebar')?.classList.remove('open');
    };

    /* ======================================================================
        RECARGA Y ESTADOS DEL CATÁLOGO (CARGANDO / ERROR CON REINTENTAR)
       ====================================================================== */
    window.recargarCatalogoDesdeServidor = async function () {
        cargandoCatalogo = true;
        errorCargaCatalogo = '';
        refrescarVistaActivaSinRemontar();

        try {
            const resp = await fetch('/api/tienda/productos', { method: 'GET' });
            if (!resp.ok) throw new Error('Respuesta no válida del servidor');
            const data = await resp.json();
            if (!data.success || !Array.isArray(data.productos)) {
                throw new Error(data.error || 'No se pudo cargar el catálogo');
            }
            catalogoProductos = data.productos;
            sincronizarCarritoConStock();
            guardarCarrito();
        } catch (err) {
            console.error(err);
            errorCargaCatalogo = 'No fue posible actualizar los productos en este momento.';
        } finally {
            cargandoCatalogo = false;
            actualizarBadgeOfertasHeader();
            refrescarVistaActivaSinRemontar();
        }
    };

    function refrescarVistaActivaSinRemontar() {
        if (vistaActual === 'inicio') renderizarVistaInicio();
        else if (vistaActual === 'productos') renderizarVistaProductos();
        else if (vistaActual === 'ofertas') renderizarVistaOfertas();
    }

    function crearHtmlSkeletons(cantidad) {
        const items = [];
        for (let i = 0; i < cantidad; i++) {
            items.push(`
                <div class="store-skeleton-card" aria-hidden="true">
                    <div class="store-skeleton-block" style="height: 190px;"></div>
                    <div class="store-skeleton-block" style="height: 14px; width: 45%;"></div>
                    <div class="store-skeleton-block" style="height: 18px; width: 88%;"></div>
                    <div class="store-skeleton-block" style="height: 22px; width: 38%; margin-top: auto;"></div>
                    <div class="store-skeleton-block" style="height: 42px; width: 100%;"></div>
                </div>
            `);
        }
        return items.join('');
    }

    /* ======================================================================
        CONSTRUCCIÓN DE TARJETAS DE PRODUCTO (LIMPIAS, SIN ACTIVO/OFICIAL)
       ====================================================================== */
    function crearHtmlTarjeta(p, indiceEnVista) {
        const stock = Number(p.Stock || 0);
        const agotado = stock <= 0;
        const ultimasUnidades = stock > 0 && stock <= 5;
        const enOferta = Boolean(p.EnOferta) && Number(p.Descuento) > 0;
        const mostrarPrecioAnterior = enOferta && Number(p.PrecioAnterior) > Number(p.Precio);

        // Etiqueta SOLO cuando aporte valor real: Agotado, Oferta, Últimas unidades o Nuevo
        let badgeHtml = '';
        if (agotado) {
            badgeHtml = `<span class="store-pill-agotado">Agotado</span>`;
        } else if (enOferta) {
            badgeHtml = `<span class="store-pill-oferta">OFERTA -${Number(p.Descuento)}%</span>`;
        } else if (ultimasUnidades) {
            badgeHtml = `<span class="store-pill-ultimas">Últimas unidades</span>`;
        } else if (p.EsNuevo) {
            badgeHtml = `<span class="store-pill-nuevo">Nuevo</span>`;
        }

        const textoPresentacion = obtenerTextoPresentacion(p);
        const cargaImg = (typeof indiceEnVista === 'number' && indiceEnVista < 4) ? 'eager' : 'lazy';

        return `
            <article class="store-card" data-id="${Number(p.IdProducto)}">
                ${badgeHtml ? `<div class="store-card-badges">${badgeHtml}<span></span></div>` : ''}

                <div class="store-card-image-wrap" onclick="abrirDetalleProducto(${Number(p.IdProducto)}, this)">
                    <img src="${escaparHtml(p.ImagenUrl)}"
                         alt="${escaparHtml(p.NombreProducto)}"
                         width="220"
                         height="210"
                         loading="${cargaImg}"
                         onerror="this.src='/static/image/productos/real_whey_gold.webp'">
                </div>

                <div class="store-card-body">
                    <span class="store-card-brand" title="${escaparHtml(p.Marca || 'WORLDGYM')}">${escaparHtml(p.Marca || 'WORLDGYM')}</span>
                    <p class="store-card-presentation" title="${escaparHtml(textoPresentacion)}">${escaparHtml(textoPresentacion)}</p>
                    <h3 class="store-card-title"
                        tabindex="0"
                        role="button"
                        onclick="abrirDetalleProducto(${Number(p.IdProducto)}, this)"
                        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();abrirDetalleProducto(${Number(p.IdProducto)}, this);}"
                        title="${escaparHtml(p.NombreProducto)}">
                        ${escaparHtml(p.NombreProducto)}
                    </h3>

                    <div class="store-card-footer-block">
                        <div class="store-card-prices">
                            <span class="store-price-current">${formatearCordobas(p.Precio)}</span>
                            ${mostrarPrecioAnterior ? `<span class="store-price-old">${formatearCordobas(p.PrecioAnterior)}</span>` : ''}
                        </div>

                        <div class="store-stock-row">
                            <span class="store-stock-status ${escaparHtml(p.ClaseStock || 'disponible')}">
                                <span class="store-stock-dot" aria-hidden="true"></span>
                                <span>${escaparHtml(p.EstadoStock)}</span>
                            </span>
                        </div>

                        <button type="button" class="store-add-btn"
                                onclick="agregarAlCarrito(${Number(p.IdProducto)}, 1)"
                                ${agotado ? 'disabled' : ''}>
                            <i class="fas ${agotado ? 'fa-ban' : 'fa-cart-plus'}" aria-hidden="true"></i>
                            <span>${agotado ? 'Agotado' : 'Agregar al carrito'}</span>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    /* ======================================================================
        CONTEOS REALES 1 A 1 (MISMA LISTA QUE LA REJILLA)
       ====================================================================== */
    function calcularConteosPorCategoria() {
        const conteos = {};
        ORDEN_CATEGORIAS_SIDEBAR.forEach(c => { conteos[c.clave] = 0; });

        const activos = obtenerProductosActivosBase();
        conteos['Todos'] = activos.length;

        activos.forEach(p => {
            const cat = p.CategoriaTienda || 'Suplementos';
            conteos[cat] = (conteos[cat] || 0) + 1;
        });
        return conteos;
    }

    function calcularConteosPorMarca() {
        const mapa = new Map();
        obtenerProductosActivosBase().forEach(p => {
            const marca = String(p.Marca || '').trim();
            if (!marca) return;
            mapa.set(marca, (mapa.get(marca) || 0) + 1);
        });
        return Array.from(mapa.entries())
            .sort((a, b) => a[0].localeCompare(b[0], 'es', { sensitivity: 'base' }))
            .map(([marca, cantidad]) => ({ marca, cantidad }));
    }

    function actualizarBadgeOfertasHeader() {
        const badge = document.getElementById('storeOffersBadge');
        if (!badge) return;
        const totalOfertas = obtenerProductosActivosBase()
            .filter(p => Boolean(p.EnOferta) && Number(p.Descuento) > 0)
            .length;
        badge.textContent = String(totalOfertas);
    }

    /* ======================================================================
        VISTA 1: INICIO (#inicio)
       ====================================================================== */
    function seleccionarProductosDestacadosReales() {
        const activos = obtenerProductosActivosBase().filter(p => Number(p.Stock) > 0);
        if (activos.length === 0) return [];

        // Condición real: en oferta, destacado administrable, nuevo ingreso o con ventas reales registradas
        const conCondicionReal = activos.filter(p =>
            (Boolean(p.EnOferta) && Number(p.Descuento) > 0) ||
            Boolean(p.DestacadoAdmin) ||
            Boolean(p.EsNuevo) ||
            Number(p.UnidadesVendidas || 0) > 0
        );

        if (conCondicionReal.length === 0) return [];

        const ordenados = conCondicionReal.slice().sort((a, b) => {
            const scoreA = (a.EnOferta ? 1000 : 0) + (a.DestacadoAdmin ? 500 : 0) + (a.EsNuevo ? 220 : 0) + (Number(a.UnidadesVendidas || 0) * 15);
            const scoreB = (b.EnOferta ? 1000 : 0) + (b.DestacadoAdmin ? 500 : 0) + (b.EsNuevo ? 220 : 0) + (Number(b.UnidadesVendidas || 0) * 15);
            return (scoreB - scoreA) || String(a.NombreProducto).localeCompare(String(b.NombreProducto), 'es');
        });

        // Evitar repetir dos presentaciones idénticas en la fila de 5 destacados
        const familiasVistas = new Set();
        const unicos = [];
        for (const prod of ordenados) {
            const fam = prod.GrupoVariante || ('id::' + prod.IdProducto);
            if (familiasVistas.has(fam)) continue;
            familiasVistas.add(fam);
            unicos.push(prod);
            if (unicos.length === 5) break;
        }
        return unicos;
    }

    function renderizarVistaInicio() {
        const conteosCat = calcularConteosPorCategoria();
        document.querySelectorAll('#storeViewRoot [data-cat-count]').forEach(el => {
            const clave = el.getAttribute('data-cat-count');
            const n = conteosCat[clave] || 0;
            el.textContent = `${n} producto${n === 1 ? '' : 's'}`;
            el.classList.toggle('is-empty', n === 0);
        });

        const secDestacados = document.getElementById('homeFeaturedSection');
        const gridDestacados = document.getElementById('homeFeaturedGrid');
        if (!secDestacados || !gridDestacados) return;

        if (cargandoCatalogo) {
            secDestacados.style.display = '';
            gridDestacados.innerHTML = crearHtmlSkeletons(5);
            return;
        }

        const destacados = seleccionarProductosDestacadosReales();
        if (destacados.length === 0) {
            // Si no hay candidatos reales, ocultar toda la sección sin dejar mensajes vacíos
            secDestacados.style.display = 'none';
            gridDestacados.innerHTML = '';
            return;
        }

        secDestacados.style.display = '';
        gridDestacados.innerHTML = destacados.map((p, idx) => crearHtmlTarjeta(p, idx)).join('');
    }

    /* ======================================================================
        VISTA 3: PRODUCTOS / CATÁLOGO (#productos)
       ====================================================================== */
    function calcularPuntajeBusqueda(p, tokens) {
        if (!tokens || tokens.length === 0) return 1;

        const nombre = normalizarTexto(p.NombreProducto);
        const marca = normalizarTexto(p.Marca);
        const categoria = normalizarTexto(`${p.Categoria || ''} ${p.CategoriaTienda || ''} ${p.CategoriaEtiqueta || ''}`);
        const presentacion = normalizarTexto(`${p.Presentacion || ''} ${p.ContenidoTamano || ''}`);
        const completo = `${nombre} ${marca} ${categoria} ${presentacion}`;

        let puntaje = 0;
        for (const tk of tokens) {
            if (!completo.includes(tk)) return 0;
            if (nombre.startsWith(tk)) puntaje += 45;
            else if (nombre.includes(tk)) puntaje += 30;
            if (marca.startsWith(tk)) puntaje += 28;
            else if (marca.includes(tk)) puntaje += 20;
            if (presentacion.includes(tk)) puntaje += 16;
            if (categoria.includes(tk)) puntaje += 14;
        }
        return puntaje;
    }

    function contarFiltrosActivosCatalogo() {
        let total = 0;
        if (estadoFiltros.categoria !== 'Todos') total++;
        if (estadoFiltros.marca !== '') total++;
        if (estadoFiltros.precioMin !== '') total++;
        if (estadoFiltros.precioMax !== '') total++;
        if (estadoFiltros.disponibilidad !== 'todos') total++;
        if (estadoFiltros.soloOfertas) total++;
        if (estadoFiltros.soloNuevos) total++;
        if (estadoFiltros.busqueda.trim() !== '') total++;
        return total;
    }

    function vincularEventosVistaProductos() {
        const brandSearch = document.getElementById('sidebarBrandSearch');
        const priceMin = document.getElementById('storePriceMin');
        const priceMax = document.getElementById('storePriceMax');
        const chkOffers = document.getElementById('storeFilterOffers');
        const chkNew = document.getElementById('storeFilterNew');
        const selSort = document.getElementById('storeSortSelect');

        if (brandSearch) {
            brandSearch.value = busquedaMarcaSidebar;
            brandSearch.addEventListener('input', function () {
                busquedaMarcaSidebar = this.value;
                renderizarListaMarcasSidebar();
            });
        }

        const manejarCambioPrecio = function () {
            if (timerPrecio) clearTimeout(timerPrecio);
            timerPrecio = setTimeout(function () {
                estadoFiltros.precioMin = priceMin ? priceMin.value.trim() : '';
                estadoFiltros.precioMax = priceMax ? priceMax.value.trim() : '';
                estadoFiltros.pagina = 1;
                actualizarResultadosCatalogo({ reemplazarUrl: true });
            }, DEBOUNCE_MS);
        };

        if (priceMin) priceMin.addEventListener('input', manejarCambioPrecio);
        if (priceMax) priceMax.addEventListener('input', manejarCambioPrecio);

        if (chkOffers) {
            chkOffers.addEventListener('change', function () {
                estadoFiltros.soloOfertas = this.checked;
                estadoFiltros.pagina = 1;
                actualizarResultadosCatalogo({ reemplazarUrl: false });
            });
        }

        if (chkNew) {
            chkNew.addEventListener('change', function () {
                estadoFiltros.soloNuevos = this.checked;
                estadoFiltros.pagina = 1;
                actualizarResultadosCatalogo({ reemplazarUrl: false });
            });
        }

        if (selSort) {
            selSort.addEventListener('change', function () {
                estadoFiltros.orden = this.value;
                estadoFiltros.pagina = 1;
                actualizarResultadosCatalogo({ reemplazarUrl: false });
            });
        }
    }

    function renderizarOpcionesOrdenamiento() {
        const selSort = document.getElementById('storeSortSelect');
        if (!selSort) return;

        const hayVentas = existenVentasReales();
        if (!hayVentas && estadoFiltros.orden === 'mas_vendidos') {
            estadoFiltros.orden = 'relevancia';
        }

        const opciones = [
            { valor: 'relevancia', texto: 'Ordenar: Relevancia' }
        ];
        if (hayVentas) {
            opciones.push({ valor: 'mas_vendidos', texto: 'Más vendidos' });
        }
        opciones.push(
            { valor: 'precio_asc', texto: 'Precio: menor a mayor' },
            { valor: 'precio_desc', texto: 'Precio: mayor a menor' },
            { valor: 'recientes', texto: 'Más recientes' },
            { valor: 'nombre_asc', texto: 'Nombre: A - Z' }
        );

        selSort.innerHTML = opciones.map(op =>
            `<option value="${op.valor}">${escaparHtml(op.texto)}</option>`
        ).join('');
        selSort.value = estadoFiltros.orden;
    }

    function renderizarSidebarCatalogo() {
        const catContainer = document.getElementById('sidebarCategoryList');
        const dispContainer = document.getElementById('sidebarAvailabilityList');
        const priceMin = document.getElementById('storePriceMin');
        const priceMax = document.getElementById('storePriceMax');
        const chkOffers = document.getElementById('storeFilterOffers');
        const chkNew = document.getElementById('storeFilterNew');
        const btnClear = document.getElementById('storeClearFiltersBtn');
        const badgeMovil = document.getElementById('storeMobileFiltersBadge');

        const conteosCat = calcularConteosPorCategoria();
        if (catContainer) {
            catContainer.innerHTML = ORDEN_CATEGORIAS_SIDEBAR
                .filter(c => !c.ocultarSiCero || (conteosCat[c.clave] || 0) > 0 || estadoFiltros.categoria === c.clave)
                .map(c => {
                    const activa = estadoFiltros.categoria === c.clave;
                    const cant = conteosCat[c.clave] || 0;
                    return `
                        <button type="button"
                                class="store-sidebar-option ${activa ? 'active' : ''}"
                                data-sidebar-cat="${escaparHtml(c.clave)}"
                                ${activa ? 'aria-current="true"' : ''}
                                onclick="seleccionarCategoriaCatalogo(this.getAttribute('data-sidebar-cat'))">
                            <span>${escaparHtml(c.nombre)}</span>
                            <span class="store-sidebar-count">${cant}</span>
                        </button>
                    `;
                }).join('');
        }

        renderizarListaMarcasSidebar();

        if (dispContainer) {
            dispContainer.innerHTML = OPCIONES_DISPONIBILIDAD.map(op => {
                const activa = estadoFiltros.disponibilidad === op.valor;
                return `
                    <button type="button"
                            class="store-sidebar-option ${activa ? 'active' : ''}"
                            onclick="seleccionarDisponibilidadCatalogo('${op.valor}')">
                        <span>${escaparHtml(op.etiqueta)}</span>
                    </button>
                `;
            }).join('');
        }

        if (priceMin && document.activeElement !== priceMin) {
            priceMin.value = estadoFiltros.precioMin;
        }
        if (priceMax && document.activeElement !== priceMax) {
            priceMax.value = estadoFiltros.precioMax;
        }
        if (chkOffers) chkOffers.checked = estadoFiltros.soloOfertas;
        if (chkNew) chkNew.checked = estadoFiltros.soloNuevos;

        const cantFiltros = contarFiltrosActivosCatalogo();
        if (btnClear) {
            btnClear.classList.toggle('has-active', cantFiltros > 0 || estadoFiltros.orden !== 'relevancia');
        }
        if (badgeMovil) {
            badgeMovil.textContent = String(cantFiltros);
            badgeMovil.style.display = cantFiltros > 0 ? 'inline-flex' : 'none';
        }
    }

    function renderizarListaMarcasSidebar() {
        const brandContainer = document.getElementById('sidebarBrandList');
        const brandSearch = document.getElementById('sidebarBrandSearch');
        if (!brandContainer) return;

        const todasLasMarcas = calcularConteosPorMarca();
        if (brandSearch) {
            brandSearch.style.display = todasLasMarcas.length > 8 ? 'block' : 'none';
        }

        const filtroMarcaTexto = normalizarTexto(busquedaMarcaSidebar);
        const marcasVisibles = filtroMarcaTexto
            ? todasLasMarcas.filter(m => normalizarTexto(m.marca).includes(filtroMarcaTexto))
            : todasLasMarcas;

        const totalActivos = obtenerProductosActivosBase().length;
        const opcionTodas = !filtroMarcaTexto ? `
            <button type="button"
                    class="store-sidebar-option ${estadoFiltros.marca === '' ? 'active' : ''}"
                    onclick="seleccionarMarcaCatalogo('')">
                <span>Todas las marcas</span>
                <span class="store-sidebar-count">${totalActivos}</span>
            </button>
        ` : '';

        if (marcasVisibles.length === 0 && filtroMarcaTexto) {
            brandContainer.innerHTML = `<p style="margin: 6px 4px; font-size: 12.5px; color: #6B7280;">Sin marcas que coincidan.</p>`;
            return;
        }

        brandContainer.innerHTML = opcionTodas + marcasVisibles.map(item => {
            const activa = normalizarTexto(estadoFiltros.marca) === normalizarTexto(item.marca);
            return `
                <button type="button"
                        class="store-sidebar-option ${activa ? 'active' : ''}"
                        data-sidebar-brand="${escaparHtml(item.marca)}"
                        onclick="seleccionarMarcaCatalogo(this.getAttribute('data-sidebar-brand'))">
                    <span>${escaparHtml(item.marca)}</span>
                    <span class="store-sidebar-count">${item.cantidad}</span>
                </button>
            `;
        }).join('');
    }

    function renderizarMigasYTituloCatalogo() {
        const navMigas = document.getElementById('storeBreadcrumbs');
        const tituloEl = document.getElementById('storeCatalogTitle');

        const catActiva = estadoFiltros.categoria;
        const etiquetaCat = ETIQUETAS_CATEGORIA[catActiva] || catActiva;

        if (tituloEl) {
            tituloEl.textContent = (catActiva === 'Todos' ? 'PRODUCTOS' : etiquetaCat).toUpperCase();
        }

        if (!navMigas) return;
        if (catActiva === 'Todos') {
            navMigas.innerHTML = `
                <a href="#inicio" onclick="return navegarVistaTienda('inicio', event)">Inicio</a>
                <span class="store-breadcrumbs-sep" aria-hidden="true">&rsaquo;</span>
                <span class="store-breadcrumbs-current">Productos</span>
            `;
        } else {
            navMigas.innerHTML = `
                <a href="#inicio" onclick="return navegarVistaTienda('inicio', event)">Inicio</a>
                <span class="store-breadcrumbs-sep" aria-hidden="true">&rsaquo;</span>
                <button type="button" onclick="seleccionarCategoriaCatalogo('Todos')">Productos</button>
                <span class="store-breadcrumbs-sep" aria-hidden="true">&rsaquo;</span>
                <span class="store-breadcrumbs-current">${escaparHtml(etiquetaCat)}</span>
            `;
        }
    }

    function renderizarChipsFiltrosActivos() {
        const chipsWrap = document.getElementById('storeActiveChips');
        if (!chipsWrap) return;

        const chips = [];

        if (estadoFiltros.categoria !== 'Todos') {
            const etq = ETIQUETAS_CATEGORIA[estadoFiltros.categoria] || estadoFiltros.categoria;
            chips.push({ clave: 'categoria', texto: `Categoría: ${etq}` });
        }
        if (estadoFiltros.marca) {
            chips.push({ clave: 'marca', texto: `Marca: ${estadoFiltros.marca}` });
        }
        if (estadoFiltros.precioMin !== '') {
            chips.push({ clave: 'precioMin', texto: `Desde C$${estadoFiltros.precioMin}` });
        }
        if (estadoFiltros.precioMax !== '') {
            chips.push({ clave: 'precioMax', texto: `Hasta C$${estadoFiltros.precioMax}` });
        }
        if (estadoFiltros.disponibilidad !== 'todos') {
            const opDisp = OPCIONES_DISPONIBILIDAD.find(o => o.valor === estadoFiltros.disponibilidad);
            chips.push({ clave: 'disponibilidad', texto: opDisp ? opDisp.etiqueta : estadoFiltros.disponibilidad });
        }
        if (estadoFiltros.soloOfertas) {
            chips.push({ clave: 'soloOfertas', texto: 'Ofertas' });
        }
        if (estadoFiltros.soloNuevos) {
            chips.push({ clave: 'soloNuevos', texto: 'Nuevos ingresos' });
        }
        if (estadoFiltros.busqueda.trim()) {
            chips.push({ clave: 'busqueda', texto: `Búsqueda: "${estadoFiltros.busqueda.trim()}"` });
        }

        if (chips.length === 0) {
            chipsWrap.innerHTML = '';
            return;
        }

        let html = chips.map(ch => `
            <button type="button"
                    class="store-filter-chip"
                    onclick="quitarFiltroIndividual('${ch.clave}')"
                    aria-label="Quitar filtro ${escaparHtml(ch.texto)}">
                <span>${escaparHtml(ch.texto)}</span>
                <span aria-hidden="true">&times;</span>
            </button>
        `).join('');

        if (chips.length >= 2) {
            html += `
                <button type="button" class="store-filter-chip store-filter-chip-clearall" onclick="limpiarFiltrosCatalogo()">
                    Limpiar todo
                </button>
            `;
        }

        chipsWrap.innerHTML = html;
    }

    function construirHtmlPaginacion(totalItems, paginaActual, funcionGlobalCambio) {
        if (totalItems <= 0) return '';
        const totalPaginas = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
        const pagSegura = Math.min(Math.max(1, paginaActual), totalPaginas);
        const inicio = (pagSegura - 1) * PAGE_SIZE + 1;
        const fin = Math.min(totalItems, pagSegura * PAGE_SIZE);

        let botonesPaginas = `
            <button type="button" class="store-page-btn"
                    onclick="${funcionGlobalCambio}(${pagSegura - 1})"
                    ${pagSegura <= 1 ? 'disabled' : ''}
                    aria-label="Página anterior">&laquo;</button>
        `;
        for (let num = 1; num <= totalPaginas; num++) {
            botonesPaginas += `
                <button type="button"
                        class="store-page-btn ${num === pagSegura ? 'active' : ''}"
                        ${num === pagSegura ? 'aria-current="page"' : ''}
                        onclick="${funcionGlobalCambio}(${num})">${num}</button>
            `;
        }
        botonesPaginas += `
            <button type="button" class="store-page-btn"
                    onclick="${funcionGlobalCambio}(${pagSegura + 1})"
                    ${pagSegura >= totalPaginas ? 'disabled' : ''}
                    aria-label="Página siguiente">&raquo;</button>
        `;

        return `
            <span class="store-pagination-info">Mostrando ${inicio}–${fin} de ${totalItems} producto${totalItems === 1 ? '' : 's'}</span>
            <div class="store-pagination-controls">${botonesPaginas}</div>
        `;
    }

    function renderizarVistaProductos() {
        renderizarOpcionesOrdenamiento();
        actualizarResultadosCatalogo({ noSincronizarUrl: true });
    }

    function actualizarResultadosCatalogo(opciones) {
        const opts = opciones || {};
        renderizarMigasYTituloCatalogo();
        renderizarSidebarCatalogo();
        renderizarChipsFiltrosActivos();
        actualizarNavegacionActivaHeader();
        sincronizarBuscadorHeader();

        const gridCatalogo = document.getElementById('storeCatalogGrid');
        const contadorEl = document.getElementById('storeResultsCounter');
        const paginacionEl = document.getElementById('storePagination');
        if (!gridCatalogo) return;

        if (cargandoCatalogo) {
            if (contadorEl) contadorEl.textContent = 'Cargando productos...';
            gridCatalogo.innerHTML = crearHtmlSkeletons(8);
            if (paginacionEl) paginacionEl.innerHTML = '';
            return;
        }

        if (errorCargaCatalogo && obtenerProductosActivosBase().length === 0) {
            if (contadorEl) contadorEl.textContent = '0 productos';
            gridCatalogo.innerHTML = `
                <div class="store-state-box" role="alert">
                    <i class="fas fa-triangle-exclamation store-state-icon" aria-hidden="true"></i>
                    <h3>No se pudo cargar el catálogo</h3>
                    <p>${escaparHtml(errorCargaCatalogo)}</p>
                    <button type="button" class="store-btn-cta" onclick="recargarCatalogoDesdeServidor()" style="padding: 11px 24px; font-size: 13.5px;">
                        <i class="fas fa-rotate-right"></i> Reintentar
                    </button>
                </div>
            `;
            if (paginacionEl) paginacionEl.innerHTML = '';
            return;
        }

        const qNorm = normalizarTexto(estadoFiltros.busqueda);
        const tokens = qNorm ? qNorm.split(' ').filter(Boolean) : [];
        const marcaNorm = normalizarTexto(estadoFiltros.marca);

        const tieneMin = estadoFiltros.precioMin !== '' && !isNaN(Number(estadoFiltros.precioMin));
        const tieneMax = estadoFiltros.precioMax !== '' && !isNaN(Number(estadoFiltros.precioMax));
        const minVal = tieneMin ? Number(estadoFiltros.precioMin) : null;
        const maxVal = tieneMax ? Number(estadoFiltros.precioMax) : null;

        const puntajesPorId = new Map();

        const filtrados = obtenerProductosActivosBase().filter(p => {
            if (tokens.length > 0) {
                const score = calcularPuntajeBusqueda(p, tokens);
                if (score <= 0) return false;
                puntajesPorId.set(Number(p.IdProducto), score);
            } else {
                puntajesPorId.set(Number(p.IdProducto), 1);
            }

            if (estadoFiltros.categoria !== 'Todos') {
                const catProd = normalizarTexto(p.CategoriaTienda || p.Categoria);
                if (catProd !== normalizarTexto(estadoFiltros.categoria)) return false;
            }

            if (marcaNorm && normalizarTexto(p.Marca) !== marcaNorm) {
                return false;
            }

            const precioProd = Number(p.Precio || 0);
            if (minVal !== null && precioProd < minVal) return false;
            if (maxVal !== null && precioProd > maxVal) return false;

            const stockProd = Number(p.Stock || 0);
            if (estadoFiltros.disponibilidad === 'disponibles' && stockProd <= 0) return false;
            if (estadoFiltros.disponibilidad === 'ultimas' && (stockProd <= 0 || stockProd > 5)) return false;
            if (estadoFiltros.disponibilidad === 'agotados' && stockProd > 0) return false;

            if (estadoFiltros.soloOfertas && !(Boolean(p.EnOferta) && Number(p.Descuento) > 0)) return false;
            if (estadoFiltros.soloNuevos && !Boolean(p.EsNuevo)) return false;

            return true;
        });

        filtrados.sort((a, b) => {
            if (estadoFiltros.orden === 'mas_vendidos') {
                return (Number(b.UnidadesVendidas || 0) - Number(a.UnidadesVendidas || 0))
                    || (Number(b.Stock || 0) - Number(a.Stock || 0))
                    || String(a.NombreProducto).localeCompare(String(b.NombreProducto), 'es');
            }
            if (estadoFiltros.orden === 'precio_asc') {
                return (Number(a.Precio) - Number(b.Precio))
                    || String(a.NombreProducto).localeCompare(String(b.NombreProducto), 'es');
            }
            if (estadoFiltros.orden === 'precio_desc') {
                return (Number(b.Precio) - Number(a.Precio))
                    || String(b.NombreProducto).localeCompare(String(a.NombreProducto), 'es');
            }
            if (estadoFiltros.orden === 'recientes') {
                return String(b.FechaRegistroISO || '').localeCompare(String(a.FechaRegistroISO || ''))
                    || (Number(b.IdProducto) - Number(a.IdProducto));
            }
            if (estadoFiltros.orden === 'nombre_asc') {
                return String(a.NombreProducto).localeCompare(String(b.NombreProducto), 'es');
            }

            const scoreDiff = (puntajesPorId.get(Number(b.IdProducto)) || 0) - (puntajesPorId.get(Number(a.IdProducto)) || 0);
            if (scoreDiff !== 0) return scoreDiff;

            const dispA = Number(a.Stock) > 0 ? 1 : 0;
            const dispB = Number(b.Stock) > 0 ? 1 : 0;
            if (dispA !== dispB) return dispB - dispA;

            const relA = (a.EnOferta ? 30 : 0) + (a.DestacadoAdmin ? 20 : 0) + Math.min(15, Number(a.UnidadesVendidas || 0));
            const relB = (b.EnOferta ? 30 : 0) + (b.DestacadoAdmin ? 20 : 0) + Math.min(15, Number(b.UnidadesVendidas || 0));
            if (relA !== relB) return relB - relA;

            return String(a.NombreProducto).localeCompare(String(b.NombreProducto), 'es');
        });

        const total = filtrados.length;
        if (contadorEl) {
            contadorEl.innerHTML = `<strong>${total}</strong> producto${total === 1 ? '' : 's'}`;
        }

        const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
        if (estadoFiltros.pagina > totalPaginas) {
            estadoFiltros.pagina = totalPaginas;
        }

        if (!opts.noSincronizarUrl) {
            sincronizarUrlConEstado(Boolean(opts.reemplazarUrl));
        }

        if (total === 0) {
            gridCatalogo.innerHTML = `
                <div class="store-state-box">
                    <i class="fas fa-magnifying-glass store-state-icon" aria-hidden="true"></i>
                    <h3>No encontramos productos con esos filtros</h3>
                    <p>Prueba con otros términos de búsqueda o restablece los filtros activos.</p>
                    <button type="button" class="store-btn-cta" onclick="limpiarFiltrosCatalogo()" style="padding: 11px 24px; font-size: 13.5px;">
                        Limpiar filtros
                    </button>
                </div>
            `;
            if (paginacionEl) paginacionEl.innerHTML = '';
            return;
        }

        const inicioIdx = (estadoFiltros.pagina - 1) * PAGE_SIZE;
        const paginaItems = filtrados.slice(inicioIdx, inicioIdx + PAGE_SIZE);

        gridCatalogo.innerHTML = paginaItems.map((p, idx) => crearHtmlTarjeta(p, idx)).join('');
        if (paginacionEl) {
            paginacionEl.innerHTML = construirHtmlPaginacion(total, estadoFiltros.pagina, 'irAPaginaCatalogo');
        }
    }

    /* Acciones de filtros dentro de PRODUCTOS */
    window.seleccionarCategoriaCatalogo = function (categoria) {
        estadoFiltros.categoria = resolverCategoriaCanonica(categoria);
        estadoFiltros.pagina = 1;
        actualizarResultadosCatalogo({ reemplazarUrl: false });
    };

    window.seleccionarMarcaCatalogo = function (marca) {
        estadoFiltros.marca = String(marca || '').trim();
        estadoFiltros.pagina = 1;
        actualizarResultadosCatalogo({ reemplazarUrl: false });
    };

    window.seleccionarDisponibilidadCatalogo = function (disp) {
        estadoFiltros.disponibilidad = disp || 'todos';
        estadoFiltros.pagina = 1;
        actualizarResultadosCatalogo({ reemplazarUrl: false });
    };

    window.quitarFiltroIndividual = function (clave) {
        if (clave === 'categoria') estadoFiltros.categoria = 'Todos';
        else if (clave === 'marca') estadoFiltros.marca = '';
        else if (clave === 'precioMin') estadoFiltros.precioMin = '';
        else if (clave === 'precioMax') estadoFiltros.precioMax = '';
        else if (clave === 'disponibilidad') estadoFiltros.disponibilidad = 'todos';
        else if (clave === 'soloOfertas') estadoFiltros.soloOfertas = false;
        else if (clave === 'soloNuevos') estadoFiltros.soloNuevos = false;
        else if (clave === 'busqueda') {
            estadoFiltros.busqueda = '';
            const inputSearch = document.getElementById('storeSearchInput');
            if (inputSearch) inputSearch.value = '';
        }
        estadoFiltros.pagina = 1;
        actualizarResultadosCatalogo({ reemplazarUrl: false });
    };

    window.limpiarFiltrosCatalogo = function () {
        const ordenActual = 'relevancia';
        estadoFiltros = crearEstadoFiltrosInicial();
        estadoFiltros.orden = ordenActual;
        busquedaMarcaSidebar = '';
        const brandSearch = document.getElementById('sidebarBrandSearch');
        if (brandSearch) brandSearch.value = '';
        const inputSearch = document.getElementById('storeSearchInput');
        if (inputSearch) inputSearch.value = '';
        const selSort = document.getElementById('storeSortSelect');
        if (selSort) selSort.value = 'relevancia';
        actualizarResultadosCatalogo({ reemplazarUrl: false });
    };

    window.irAPaginaCatalogo = function (numPagina) {
        estadoFiltros.pagina = Math.max(1, Number(numPagina) || 1);
        actualizarResultadosCatalogo({ reemplazarUrl: false });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /* ======================================================================
        VISTA 4: OFERTAS (#ofertas)
       ====================================================================== */
    function renderizarVistaOfertas() {
        const gridOfertas = document.getElementById('storeOffersGrid');
        const topbarWrap = document.getElementById('ofertasTopbarWrap');
        const counterEl = document.getElementById('ofertasResultsCounter');
        const pagEl = document.getElementById('storeOffersPagination');
        if (!gridOfertas) return;

        if (cargandoCatalogo) {
            if (topbarWrap) topbarWrap.style.display = 'none';
            gridOfertas.innerHTML = crearHtmlSkeletons(4);
            if (pagEl) pagEl.innerHTML = '';
            return;
        }

        const ofertasReales = obtenerProductosActivosBase()
            .filter(p => Boolean(p.EnOferta) && Number(p.Descuento) > 0)
            .sort((a, b) => (Number(b.Descuento) - Number(a.Descuento)) || (Number(a.Precio) - Number(b.Precio)));

        if (ofertasReales.length === 0) {
            if (topbarWrap) topbarWrap.style.display = 'none';
            if (pagEl) pagEl.innerHTML = '';
            gridOfertas.innerHTML = `
                <div class="store-state-box">
                    <i class="fas fa-tag store-state-icon" aria-hidden="true"></i>
                    <h3>No hay productos en oferta en este momento</h3>
                    <p>Explora el catálogo de suplementos e hidratación con existencias disponibles.</p>
                    <button type="button" class="store-btn-cta" onclick="navegarVistaProductosLimpia()" style="padding: 11px 24px; font-size: 13.5px;">
                        Ver catálogo <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `;
            return;
        }

        if (topbarWrap) topbarWrap.style.display = 'flex';
        if (counterEl) {
            counterEl.innerHTML = `<strong>${ofertasReales.length}</strong> producto${ofertasReales.length === 1 ? '' : 's'} en oferta`;
        }

        const totalPaginas = Math.max(1, Math.ceil(ofertasReales.length / PAGE_SIZE));
        if (paginaOfertas > totalPaginas) paginaOfertas = totalPaginas;

        const inicioIdx = (paginaOfertas - 1) * PAGE_SIZE;
        const visibles = ofertasReales.slice(inicioIdx, inicioIdx + PAGE_SIZE);

        gridOfertas.innerHTML = visibles.map((p, idx) => crearHtmlTarjeta(p, idx)).join('');
        if (pagEl) {
            pagEl.innerHTML = construirHtmlPaginacion(ofertasReales.length, paginaOfertas, 'irAPaginaOfertas');
        }
    }

    window.irAPaginaOfertas = function (numPagina) {
        paginaOfertas = Math.max(1, Number(numPagina) || 1);
        renderizarVistaOfertas();
        sincronizarUrlConEstado(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /* ======================================================================
        MODAL DE DETALLES DEL PLAN DE MEMBRESÍA ( FLUJO DE CONTRATACIÓN INTACTO )
       ====================================================================== */
    window.abrirDetalleMembresiaTienda = function (cardEl) {
        if (!cardEl) return;
        ultimoElementoEnfocado = cardEl;

        const id = cardEl.getAttribute('data-id');
        const titulo = cardEl.getAttribute('data-titulo');
        const nombreDb = cardEl.getAttribute('data-nombre-db');
        const duracion = cardEl.getAttribute('data-duracion');
        const precio = cardEl.getAttribute('data-precio');
        const tipo = cardEl.getAttribute('data-tipo');
        const disponibilidad = cardEl.getAttribute('data-disponibilidad') || 'Disponible • Activación inmediata';
        const condiciones = cardEl.getAttribute('data-condiciones') || 'Uso personal e intransferible • Contratación en recepción.';
        const esPopular = cardEl.getAttribute('data-popular') === '1';
        const sociosActivos = parseInt(cardEl.getAttribute('data-socios') || '0', 10);

        let beneficios = [];
        try {
            beneficios = JSON.parse(cardEl.getAttribute('data-beneficios') || '[]');
        } catch (e) {
            beneficios = [];
        }

        planTiendaActual = { id: id, titulo: titulo, precio: precio, duracion: duracion };

        const setTxt = (elId, txt) => {
            const el = document.getElementById(elId);
            if (el) el.textContent = txt;
        };

        setTxt('wgModalTitulo', titulo);
        setTxt('wgModalDuracion', 'MEMBRESÍA WORLD GYM • ' + duracion);
        setTxt('wgModalPrecio', precio);
        setTxt('wgModalNombreDb', nombreDb);
        setTxt('wgModalVigenciaSpec', duracion);
        setTxt('wgModalTipoId', tipo + ' (#' + id + ')');

        let dispTexto = disponibilidad;
        if (sociosActivos > 0) {
            dispTexto += ' • ' + sociosActivos + (sociosActivos === 1 ? ' socio activo' : ' socios activos');
        }
        setTxt('wgModalDisponibilidad', dispTexto);

        const popEl = document.getElementById('wgModalPopularTag');
        if (popEl) popEl.style.display = esPopular ? 'inline-flex' : 'none';

        const benUl = document.getElementById('wgModalBeneficios');
        if (benUl) {
            if (Array.isArray(beneficios) && beneficios.length > 0) {
                benUl.innerHTML = beneficios.map(b =>
                    `<li><i class="fas fa-check" aria-hidden="true"></i><span>${escaparHtml(b)}</span></li>`
                ).join('');
            } else {
                benUl.innerHTML = '<li><i class="fas fa-check" aria-hidden="true"></i><span>Acceso a instalaciones y equipamiento durante la vigencia del plan.</span></li>';
            }
        }

        setTxt('wgModalCondiciones', condiciones);

        const btnSel = document.getElementById('wgModalBtnSeleccionar');
        if (btnSel) btnSel.href = '/cliente_membresia?id_membresia=' + encodeURIComponent(id);
        const btnEd = document.getElementById('wgModalBtnEditar');
        if (btnEd) btnEd.href = '/membresia_actualizar?id=' + encodeURIComponent(id);
        const btnEl = document.getElementById('wgModalBtnEliminar');
        if (btnEl) btnEl.href = '/membresia_eliminar?id=' + encodeURIComponent(id);

        const overlay = document.getElementById('wgModalPlan');
        if (!overlay) return;
        overlay.style.display = 'flex';
        setTimeout(() => {
            overlay.classList.add('active');
            document.getElementById('wgModalCloseBtn')?.focus();
        }, 15);
    };

    window.cerrarDetalleMembresiaTienda = function () {
        const overlay = document.getElementById('wgModalPlan');
        if (!overlay || overlay.style.display === 'none') return;
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.style.display = 'none';
            if (ultimoElementoEnfocado && typeof ultimoElementoEnfocado.focus === 'function') {
                ultimoElementoEnfocado.focus();
                ultimoElementoEnfocado = null;
            }
        }, 180);
    };

    window.seleccionarPlanComoCliente = function () {
        cerrarDetalleMembresiaTienda();
        const msg = `Plan seleccionado: ${planTiendaActual.titulo} (${planTiendaActual.duracion} — C$${planTiendaActual.precio}). Solicita tu activación en recepción de World Gym.`;
        window.mostrarToastTienda(msg, 'success');
    };

    /* ======================================================================
        MODAL DE DETALLE DE PRODUCTO (IMAGEN IZQ + COMPRA DER + FICHA DEBAJO)
       ====================================================================== */
    window.cambiarCantidadModalProducto = function (delta, maxPermitido) {
        const input = document.getElementById('modalProdQty');
        if (!input) return;
        const max = Math.max(1, Number(maxPermitido || 1));
        const actual = Math.floor(Number(input.value) || 1);
        input.value = String(Math.min(max, Math.max(1, actual + Number(delta))));
    };

    window.agregarDesdeModalProducto = function (idProducto) {
        const input = document.getElementById('modalProdQty');
        const cant = input ? Math.max(1, Math.floor(Number(input.value) || 1)) : 1;
        if (window.agregarAlCarrito(idProducto, cant)) {
            cerrarModalProducto();
        }
    };

    window.abrirDetalleProducto = function (idProducto, triggerEl) {
        const prod = catalogoProductos.find(p => Number(p.IdProducto) === Number(idProducto));
        if (!prod) return;
        if (triggerEl) ultimoElementoEnfocado = triggerEl;

        const modal = document.getElementById('storeProductModal');
        const content = document.getElementById('storeProductModalContent');
        if (!modal || !content) return;

        const stockTotal = Number(prod.Stock || 0);
        const agotado = stockTotal <= 0;
        const ultimas = stockTotal > 0 && stockTotal <= 5;
        const enCarritoItem = carrito.find(i => Number(i.IdProducto) === Number(prod.IdProducto));
        const cantEnCarrito = enCarritoItem ? Number(enCarritoItem.Cantidad) : 0;
        const maxAgregable = Math.max(0, stockTotal - cantEnCarrito);

        const enOferta = Boolean(prod.EnOferta) && Number(prod.Descuento) > 0;
        const categoriaVisible = prod.CategoriaEtiqueta || ETIQUETAS_CATEGORIA[prod.CategoriaTienda] || prod.Categoria || 'Suplementos';
        const textoPresentacion = obtenerTextoPresentacion(prod);
        const variantes = Array.isArray(prod.Variantes) ? prod.Variantes : [];

        let badgeModal = '';
        if (agotado) badgeModal = `<span class="store-pill-agotado">Agotado</span>`;
        else if (enOferta) badgeModal = `<span class="store-pill-oferta">OFERTA -${Number(prod.Descuento)}%</span>`;
        else if (ultimas) badgeModal = `<span class="store-pill-ultimas">Últimas unidades</span>`;
        else if (prod.EsNuevo) badgeModal = `<span class="store-pill-nuevo">Nuevo</span>`;

        let selectorVariantesHtml = '';
        if (variantes.length > 1) {
            selectorVariantesHtml = `
                <div>
                    <span style="display: block; font-size: 12px; font-weight: 700; color: #6B7280; margin-bottom: 4px;">
                        Otras presentaciones registradas:
                    </span>
                    <div class="store-variant-chips">
                        ${variantes.map(v => {
                            const activa = Number(v.IdProducto) === Number(prod.IdProducto);
                            return `
                                <button type="button"
                                        class="store-variant-chip ${activa ? 'active' : ''}"
                                        onclick="abrirDetalleProducto(${Number(v.IdProducto)})">
                                    ${escaparHtml(v.Etiqueta || v.Presentacion)} • ${formatearCordobas(v.Precio)}
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        const deshabilitarCompra = agotado || maxAgregable <= 0;
        const textoBotonCompra = agotado
            ? 'Agotado'
            : (maxAgregable <= 0 ? 'Existencia máxima ya en tu carrito' : 'Agregar al carrito');

        content.innerHTML = `
            <div class="store-detail-grid">
                <div class="store-detail-img-box">
                    <img src="${escaparHtml(prod.ImagenUrl)}"
                         alt="${escaparHtml(prod.NombreProducto)}"
                         width="300"
                         height="300"
                         onerror="this.src='/static/image/productos/real_whey_gold.webp'">
                </div>

                <div>
                    ${badgeModal ? `<div style="margin-bottom: 10px;">${badgeModal}</div>` : ''}
                    <span class="store-card-brand" style="display: block; margin-bottom: 4px;">
                        ${escaparHtml(prod.Marca || 'WORLDGYM')} • ${escaparHtml(categoriaVisible)}
                    </span>
                    <h2 id="storeProductModalHeading" style="margin: 0 0 6px 0; font-size: 22px; font-weight: 800; color: #111827; line-height: 1.25;">
                        ${escaparHtml(prod.NombreProducto)}
                    </h2>
                    <p style="margin: 0 0 12px 0; font-size: 13.5px; font-weight: 700; color: #F58220;">
                        Presentación: ${escaparHtml(textoPresentacion)}
                    </p>

                    ${selectorVariantesHtml}

                    <div style="display: flex; align-items: baseline; gap: 10px; margin: 12px 0;">
                        <span style="font-size: 26px; font-weight: 900; color: #F58220;">${formatearCordobas(prod.Precio)}</span>
                        ${enOferta && Number(prod.PrecioAnterior) > Number(prod.Precio)
                            ? `<span style="font-size: 15px; color: #9CA3AF; text-decoration: line-through; font-weight: 600;">${formatearCordobas(prod.PrecioAnterior)}</span>`
                            : ''
                        }
                    </div>

                    <div class="store-stock-row" style="margin-bottom: 10px;">
                        <span class="store-stock-status ${escaparHtml(prod.ClaseStock || 'disponible')}">
                            <span class="store-stock-dot" aria-hidden="true"></span>
                            <span>${escaparHtml(prod.EstadoStock)}</span>
                        </span>
                        ${cantEnCarrito > 0 ? `<span style="font-size: 12.5px; color: #6B7280;">En carrito: <strong>${cantEnCarrito}</strong> uds.</span>` : ''}
                    </div>

                    <div class="store-detail-purchase-row">
                        <div class="store-detail-qty-box" aria-label="Seleccionar cantidad">
                            <button type="button" class="store-detail-qty-btn"
                                    onclick="cambiarCantidadModalProducto(-1, ${maxAgregable})"
                                    ${deshabilitarCompra ? 'disabled' : ''} aria-label="Reducir cantidad">&minus;</button>
                            <input type="number" id="modalProdQty" class="store-detail-qty-input"
                                   min="1" max="${Math.max(1, maxAgregable)}" value="1"
                                   ${deshabilitarCompra ? 'disabled' : ''}
                                   onchange="this.value = Math.min(${Math.max(1, maxAgregable)}, Math.max(1, Math.floor(Number(this.value) || 1)))"
                                   aria-label="Cantidad de unidades">
                            <button type="button" class="store-detail-qty-btn"
                                    onclick="cambiarCantidadModalProducto(1, ${maxAgregable})"
                                    ${deshabilitarCompra ? 'disabled' : ''} aria-label="Aumentar cantidad">+</button>
                        </div>

                        <button type="button" class="store-add-btn" style="flex: 1; min-width: 190px; height: 46px; font-size: 14px;"
                                onclick="agregarDesdeModalProducto(${Number(prod.IdProducto)})"
                                ${deshabilitarCompra ? 'disabled' : ''}>
                            <i class="fas ${agotado ? 'fa-ban' : 'fa-cart-plus'}" aria-hidden="true"></i>
                            <span>${escaparHtml(textoBotonCompra)}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="store-detail-below">
                <div>
                    <h4>Descripción</h4>
                    <p>${escaparHtml(prod.Descripcion)}</p>
                </div>

                <div>
                    <h4>Características registradas</h4>
                    <div class="store-detail-specs">
                        <div class="store-detail-spec-item">
                            <span class="store-detail-spec-label">Marca</span>
                            <span class="store-detail-spec-val">${escaparHtml(prod.Marca || 'WORLDGYM')}</span>
                        </div>
                        <div class="store-detail-spec-item">
                            <span class="store-detail-spec-label">Categoría</span>
                            <span class="store-detail-spec-val">${escaparHtml(categoriaVisible)}</span>
                        </div>
                        <div class="store-detail-spec-item">
                            <span class="store-detail-spec-label">Presentación</span>
                            <span class="store-detail-spec-val">${escaparHtml(prod.Presentacion || 'Envase estándar')}</span>
                        </div>
                        <div class="store-detail-spec-item">
                            <span class="store-detail-spec-label">Contenido / Tamaño</span>
                            <span class="store-detail-spec-val">${escaparHtml(prod.ContenidoTamano || 'Estándar')}</span>
                        </div>
                        <div class="store-detail-spec-item">
                            <span class="store-detail-spec-label">Existencias en inventario</span>
                            <span class="store-detail-spec-val">${stockTotal} ${stockTotal === 1 ? 'unidad' : 'unidades'}</span>
                        </div>
                        <div class="store-detail-spec-item">
                            <span class="store-detail-spec-label">Código de registro</span>
                            <span class="store-detail-spec-val">#${Number(prod.IdProducto)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('open');
        setTimeout(() => {
            document.getElementById('storeProductModalCloseBtn')?.focus();
        }, 15);
    };

    window.cerrarModalProducto = function () {
        const modal = document.getElementById('storeProductModal');
        if (!modal || !modal.classList.contains('open')) return;
        modal.classList.remove('open');
        if (ultimoElementoEnfocado && typeof ultimoElementoEnfocado.focus === 'function') {
            ultimoElementoEnfocado.focus();
            ultimoElementoEnfocado = null;
        }
    };

    window.cerrarModalComprobante = function () {
        const modal = document.getElementById('storeReceiptModal');
        if (!modal || !modal.classList.contains('open')) return;
        modal.classList.remove('open');
    };

    /* ======================================================================
        CARRITO DE COMPRAS Y VERIFICACIÓN DE STOCK EN VIVO AL COMPRAR
       ====================================================================== */
    function cargarCarrito() {
        try {
            const guardado = localStorage.getItem(CART_STORAGE_KEY);
            carrito = guardado ? JSON.parse(guardado) : [];
            if (!Array.isArray(carrito)) carrito = [];
        } catch (e) {
            carrito = [];
        }
        sincronizarCarritoConStock();
    }

    function guardarCarrito() {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carrito));
        } catch (e) {
            console.error('Error al guardar carrito:', e);
        }
        renderizarCarrito();
    }

    function sincronizarCarritoConStock() {
        const mapa = new Map(catalogoProductos.map(p => [Number(p.IdProducto), p]));
        carrito = carrito.filter(item => {
            const p = mapa.get(Number(item.IdProducto));
            if (!p || !esProductoPublicoActivo(p) || Number(p.Stock) <= 0) return false;
            const cantEntera = Math.floor(Number(item.Cantidad) || 0);
            if (cantEntera <= 0) return false;
            item.Cantidad = Math.min(cantEntera, Number(p.Stock));
            item.Precio = Number(p.Precio);
            item.PrecioAnterior = Number(p.PrecioAnterior || p.Precio);
            item.NombreProducto = p.NombreProducto;
            item.Marca = p.Marca;
            item.Presentacion = obtenerTextoPresentacion(p);
            item.ImagenUrl = p.ImagenUrl;
            item.StockMax = Number(p.Stock);
            return item.Cantidad > 0;
        });
    }

    window.mostrarToastTienda = function (mensaje, tipo) {
        const container = document.getElementById('storeToastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'store-toast';
        if (tipo === 'error') toast.style.borderLeftColor = '#EF4444';
        else if (tipo === 'warning') toast.style.borderLeftColor = '#F59E0B';

        const icon = tipo === 'error'
            ? 'fa-circle-exclamation'
            : (tipo === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-check');
        const iconColor = tipo === 'error' ? '#EF4444' : (tipo === 'warning' ? '#F59E0B' : '#F58220');
        toast.innerHTML = `<i class="fas ${icon}" style="color: ${iconColor};" aria-hidden="true"></i> <span>${escaparHtml(mensaje)}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.22s ease';
            setTimeout(() => toast.remove(), 240);
        }, 3200);
    };

    window.agregarAlCarrito = function (idProducto, cantidadAgregar) {
        const id = Number(idProducto);
        const cant = Math.max(1, Math.floor(Number(cantidadAgregar || 1)));
        const prod = catalogoProductos.find(p => Number(p.IdProducto) === id);

        if (!prod || !esProductoPublicoActivo(prod)) {
            window.mostrarToastTienda('Este producto no está disponible en el catálogo.', 'error');
            return false;
        }

        const stockDisponible = Number(prod.Stock || 0);
        if (stockDisponible <= 0) {
            window.mostrarToastTienda('Este producto se encuentra agotado.', 'error');
            return false;
        }

        const existente = carrito.find(i => Number(i.IdProducto) === id);
        const cantidadActual = existente ? Number(existente.Cantidad) : 0;

        if (cantidadActual + cant > stockDisponible) {
            window.mostrarToastTienda(`Solo hay ${stockDisponible} unidades disponibles de "${prod.NombreProducto}".`, 'warning');
            return false;
        }

        if (existente) {
            existente.Cantidad += cant;
            existente.StockMax = stockDisponible;
            existente.Precio = Number(prod.Precio);
            existente.PrecioAnterior = Number(prod.PrecioAnterior || prod.Precio);
        } else {
            carrito.push({
                IdProducto: id,
                NombreProducto: prod.NombreProducto,
                Marca: prod.Marca,
                Presentacion: obtenerTextoPresentacion(prod),
                Precio: Number(prod.Precio),
                PrecioAnterior: Number(prod.PrecioAnterior || prod.Precio),
                ImagenUrl: prod.ImagenUrl,
                Cantidad: cant,
                StockMax: stockDisponible
            });
        }

        guardarCarrito();
        window.mostrarToastTienda(
            cant > 1
                ? `${cant} uds. de "${prod.NombreProducto}" agregadas al carrito`
                : `"${prod.NombreProducto}" agregado al carrito`,
            'success'
        );
        return true;
    };

    window.cambiarCantidadCarrito = function (idProducto, delta) {
        const id = Number(idProducto);
        const idx = carrito.findIndex(i => Number(i.IdProducto) === id);
        if (idx === -1) return;

        const item = carrito[idx];
        const prod = catalogoProductos.find(p => Number(p.IdProducto) === id);
        const maxStock = prod ? Number(prod.Stock) : Number(item.StockMax || 0);

        if (maxStock <= 0) {
            carrito.splice(idx, 1);
            guardarCarrito();
            window.mostrarToastTienda(`"${item.NombreProducto}" se agotó y fue retirado del carrito.`, 'warning');
            return;
        }

        const nuevaCantidad = Number(item.Cantidad) + Number(delta);
        if (nuevaCantidad <= 0) {
            carrito.splice(idx, 1);
        } else if (nuevaCantidad > maxStock) {
            window.mostrarToastTienda(`Existencia máxima disponible: ${maxStock} uds.`, 'warning');
            return;
        } else {
            item.Cantidad = nuevaCantidad;
            item.StockMax = maxStock;
        }
        guardarCarrito();
    };

    window.eliminarDelCarrito = function (idProducto) {
        const id = Number(idProducto);
        carrito = carrito.filter(i => Number(i.IdProducto) !== id);
        guardarCarrito();
    };

    window.vaciarCarrito = function () {
        if (carrito.length === 0) return;
        carrito = [];
        guardarCarrito();
        window.mostrarToastTienda('Se vació el carrito de compras.', 'info');
    };

    window.abrirCarrito = function () {
        ultimoElementoEnfocado = document.activeElement;
        document.getElementById('storeCartBackdrop')?.classList.add('open');
        document.getElementById('storeCartDrawer')?.classList.add('open');
        setTimeout(() => {
            document.getElementById('storeCartCloseBtn')?.focus();
        }, 20);
    };

    window.cerrarCarrito = function () {
        const drawer = document.getElementById('storeCartDrawer');
        if (!drawer || !drawer.classList.contains('open')) return;
        document.getElementById('storeCartBackdrop')?.classList.remove('open');
        drawer.classList.remove('open');
        if (ultimoElementoEnfocado && typeof ultimoElementoEnfocado.focus === 'function') {
            ultimoElementoEnfocado.focus();
            ultimoElementoEnfocado = null;
        }
    };

    function renderizarCarrito() {
        const badge = document.getElementById('storeCartBadge');
        const btnClearCart = document.getElementById('storeCartClearBtn');
        const lista = document.getElementById('storeCartItems');
        const subtotalEl = document.getElementById('storeCartSubtotal');
        const descuentoEl = document.getElementById('storeCartDiscount');
        const rowDescuentoEl = document.getElementById('storeCartDiscountRow');
        const totalEl = document.getElementById('storeCartTotal');
        const btnCheckout = document.getElementById('storeCheckoutBtn');

        const totalUnidades = carrito.reduce((acc, item) => acc + Number(item.Cantidad || 0), 0);
        if (badge) badge.textContent = String(totalUnidades);
        if (btnClearCart) btnClearCart.style.display = carrito.length > 0 ? 'inline-block' : 'none';

        if (!lista) return;

        if (carrito.length === 0) {
            lista.innerHTML = `
                <div style="text-align: center; padding: 48px 16px; color: #6B7280;">
                    <i class="fas fa-cart-shopping" style="font-size: 40px; color: #D1D5DB; margin-bottom: 12px; display: block;" aria-hidden="true"></i>
                    <strong style="display: block; color: #111827; font-size: 15px; margin-bottom: 4px;">Tu carrito está vacío</strong>
                    <span style="font-size: 13px;">Explora el catálogo y agrega productos con existencias disponibles.</span>
                </div>
            `;
            if (subtotalEl) subtotalEl.textContent = 'C$0.00';
            if (descuentoEl) descuentoEl.textContent = '-C$0.00';
            if (rowDescuentoEl) rowDescuentoEl.style.display = 'none';
            if (totalEl) totalEl.textContent = 'C$0.00';
            if (btnCheckout) btnCheckout.disabled = true;
            return;
        }

        let subtotalOriginal = 0;
        let totalPagar = 0;

        lista.innerHTML = carrito.map(item => {
            const precioUnit = Number(item.Precio || 0);
            const precioAnt = Number(item.PrecioAnterior || precioUnit);
            const subItem = precioUnit * Number(item.Cantidad);
            subtotalOriginal += Math.max(precioAnt, precioUnit) * Number(item.Cantidad);
            totalPagar += subItem;
            const enLimiteStock = Number(item.Cantidad) >= Number(item.StockMax);

            return `
                <div class="store-cart-item">
                    <img src="${escaparHtml(item.ImagenUrl)}"
                         alt="${escaparHtml(item.NombreProducto)}"
                         class="store-cart-item-img"
                         width="66"
                         height="66"
                         loading="lazy"
                         onerror="this.src='/static/image/productos/real_whey_gold.webp'">
                    <div class="store-cart-item-info">
                        <h4 class="store-cart-item-title" title="${escaparHtml(item.NombreProducto)}">${escaparHtml(item.NombreProducto)}</h4>
                        <span class="store-cart-item-brand" style="font-size: 12px;">
                            ${escaparHtml(item.Marca)}${item.Presentacion ? ' • ' + escaparHtml(item.Presentacion) : ''}
                        </span>
                        <small style="display: block; font-size: 12px; color: ${enLimiteStock ? '#D97706' : '#6B7280'}; margin-bottom: 6px;">
                            ${formatearCordobas(precioUnit)} c/u • Disponibles: ${Number(item.StockMax)}
                        </small>
                        <div class="store-cart-item-bottom">
                            <div class="store-cart-qty-controls">
                                <button type="button" class="store-qty-btn" onclick="cambiarCantidadCarrito(${Number(item.IdProducto)}, -1)" aria-label="Disminuir cantidad">-</button>
                                <span class="store-qty-val">${Number(item.Cantidad)}</span>
                                <button type="button" class="store-qty-btn" onclick="cambiarCantidadCarrito(${Number(item.IdProducto)}, 1)" aria-label="Aumentar cantidad">+</button>
                            </div>
                            <span class="store-cart-item-price">${formatearCordobas(subItem)}</span>
                        </div>
                    </div>
                    <button type="button" class="store-cart-remove" onclick="eliminarDelCarrito(${Number(item.IdProducto)})" title="Eliminar producto" aria-label="Eliminar ${escaparHtml(item.NombreProducto)}">
                        <i class="fas fa-trash-can" aria-hidden="true"></i>
                    </button>
                </div>
            `;
        }).join('');

        const ahorro = Math.max(0, subtotalOriginal - totalPagar);
        if (subtotalEl) subtotalEl.textContent = formatearCordobas(ahorro > 0.01 ? subtotalOriginal : totalPagar);
        if (rowDescuentoEl) rowDescuentoEl.style.display = ahorro > 0.01 ? 'flex' : 'none';
        if (descuentoEl) descuentoEl.textContent = '-' + formatearCordobas(ahorro);
        if (totalEl) totalEl.textContent = formatearCordobas(totalPagar);
        if (btnCheckout) btnCheckout.disabled = false;
    }

    window.confirmarCompraTienda = async function () {
        if (carrito.length === 0) return;

        const btn = document.getElementById('storeCheckoutBtn');
        const notasInput = document.getElementById('storeOrderNotes');
        const notas = notasInput ? notasInput.value.trim() : '';

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Verificando inventario...`;
        }

        try {
            const checkResp = await fetch('/api/tienda/productos', { method: 'GET' });
            if (checkResp.ok) {
                const checkData = await checkResp.json();
                if (checkData.success && Array.isArray(checkData.productos)) {
                    catalogoProductos = checkData.productos;
                    const mapaVivo = new Map(catalogoProductos.map(p => [Number(p.IdProducto), p]));
                    for (const item of carrito) {
                        const prodVivo = mapaVivo.get(Number(item.IdProducto));
                        if (!prodVivo || !esProductoPublicoActivo(prodVivo) || Number(prodVivo.Stock) <= 0) {
                            sincronizarCarritoConStock();
                            guardarCarrito();
                            refrescarVistaActivaSinRemontar();
                            window.mostrarToastTienda(`"${item.NombreProducto}" ya no tiene existencias disponibles. Se actualizó tu carrito.`, 'error');
                            return;
                        }
                        if (Number(item.Cantidad) > Number(prodVivo.Stock)) {
                            sincronizarCarritoConStock();
                            guardarCarrito();
                            refrescarVistaActivaSinRemontar();
                            window.mostrarToastTienda(`Solo quedan ${prodVivo.Stock} uds. de "${item.NombreProducto}". Revisa la cantidad ajustada en tu carrito.`, 'warning');
                            return;
                        }
                    }
                }
            }

            if (btn) btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Procesando pedido...`;

            const resp = await fetch('/api/tienda/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: carrito.map(i => ({ IdProducto: i.IdProducto, Cantidad: i.Cantidad })),
                    notas: notas
                })
            });
            const data = await resp.json();

            if (!data.success) {
                window.mostrarToastTienda(data.error || 'No se pudo procesar el pedido.', 'error');
                return;
            }

            if (Array.isArray(data.catalogo)) {
                catalogoProductos = data.catalogo;
            }
            carrito = [];
            if (notasInput) notasInput.value = '';
            guardarCarrito();
            actualizarBadgeOfertasHeader();
            refrescarVistaActivaSinRemontar();
            cerrarCarrito();
            mostrarComprobantePedido(data.comprobante, data.mensaje);
        } catch (err) {
            console.error(err);
            window.mostrarToastTienda('Error de conexión al procesar el pedido.', 'error');
        } finally {
            if (btn) {
                btn.disabled = carrito.length === 0;
                btn.innerHTML = `<i class="fas fa-check-circle"></i> Confirmar Pedido en Gimnasio`;
            }
        }
    };

    function mostrarComprobantePedido(comp, mensaje) {
        const modal = document.getElementById('storeReceiptModal');
        const body = document.getElementById('storeReceiptContent');
        if (!modal || !body || !comp) return;

        const filasHtml = (comp.Items || []).map(item => `
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; font-size: 13px;">
                    <strong>${escaparHtml(item.NombreProducto)}</strong>
                    <small style="display: block; color: #6B7280; font-size: 12px;">${escaparHtml(item.Marca)}${item.Presentacion ? ' • ' + escaparHtml(item.Presentacion) : ''}</small>
                </td>
                <td style="padding: 8px 8px; border-bottom: 1px solid #E5E7EB; text-align: center; font-weight: 700; font-size: 13px;">
                    x${Number(item.Cantidad)}
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid #E5E7EB; text-align: right; font-weight: 800; font-size: 13px;">
                    ${formatearCordobas(item.Subtotal)}
                </td>
            </tr>
        `).join('');

        body.innerHTML = `
            <div style="text-align: center; margin-bottom: 18px;">
                <div style="width: 54px; height: 54px; border-radius: 50%; background: #ECFDF5; color: #10B981; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 10px;">
                    <i class="fas fa-check" aria-hidden="true"></i>
                </div>
                <h2 id="storeReceiptHeading" style="margin: 0 0 4px 0; font-size: 20px; font-weight: 800;">¡Pedido Confirmado!</h2>
                <p style="margin: 0; font-size: 13px; color: #6B7280;">${escaparHtml(mensaje)}</p>
            </div>

            <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 14px; padding: 14px 16px; margin-bottom: 16px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="color: #6B7280;">Folio de Pedido:</span>
                    <strong style="color: #111827;">${escaparHtml(comp.Folio)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="color: #6B7280;">Fecha y Hora:</span>
                    <strong>${escaparHtml(comp.Fecha)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6B7280;">Cliente:</span>
                    <strong>${escaparHtml(comp.Cliente)}</strong>
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <thead>
                    <tr style="border-bottom: 2px solid #E5E7EB; font-size: 12px; color: #6B7280; text-transform: uppercase;">
                        <th style="text-align: left; padding-bottom: 6px;">Producto</th>
                        <th style="text-align: center; padding-bottom: 6px;">Cant.</th>
                        <th style="text-align: right; padding-bottom: 6px;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>${filasHtml}</tbody>
            </table>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 900; padding-top: 8px; margin-bottom: 18px;">
                <span>Total a Pagar en Recepción:</span>
                <span style="color: #F58220;">${formatearCordobas(comp.Total)}</span>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button type="button" class="store-add-btn" id="storeReceiptOkBtn" onclick="cerrarModalComprobante()">
                    <i class="fas fa-check" aria-hidden="true"></i> Entendido
                </button>
            </div>
        `;
        modal.classList.add('open');
        setTimeout(() => {
            document.getElementById('storeReceiptOkBtn')?.focus();
        }, 20);
    }

    /* ======================================================================
        INICIALIZACIÓN GENERAL
       ====================================================================== */
    document.addEventListener('DOMContentLoaded', function () {
        cargarCarrito();
        renderizarCarrito();

        // Montar inicialmente la vista indicada en la URL (#inicio por defecto)
        const rutaInicial = leerRutaDesdeUrl();
        estadoFiltros = rutaInicial.filtros;
        paginaOfertas = rutaInicial.paginaOfertas;
        montarVista(rutaInicial.vista, { reemplazarHistorial: true, subirAlInicio: true });

        // Escuchar navegación atrás/adelante o cambios manuales de hash
        const sincronizarDesdeNavegador = function () {
            const ruta = leerRutaDesdeUrl();
            estadoFiltros = ruta.filtros;
            paginaOfertas = ruta.paginaOfertas;
            montarVista(ruta.vista, { desdePopState: true });
        };
        window.addEventListener('hashchange', sincronizarDesdeNavegador);
        window.addEventListener('popstate', sincronizarDesdeNavegador);

        // Buscador del encabezado con debounce de 250 ms
        const searchInput = document.getElementById('storeSearchInput');
        const clearBtn = document.getElementById('storeSearchClear');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                const texto = this.value;
                if (clearBtn) clearBtn.style.display = texto ? 'block' : 'none';
                if (timerBusqueda) clearTimeout(timerBusqueda);
                timerBusqueda = setTimeout(function () {
                    estadoFiltros.busqueda = texto;
                    estadoFiltros.pagina = 1;
                    if (vistaActual !== 'productos') {
                        if (texto.trim() !== '') {
                            montarVista('productos', { reemplazarHistorial: false, subirAlInicio: true });
                        }
                    } else {
                        actualizarResultadosCatalogo({ reemplazarUrl: true });
                    }
                }, DEBOUNCE_MS);
            });

            searchInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    window.ejecutarBusquedaHeader();
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (timerBusqueda) clearTimeout(timerBusqueda);
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                }
                clearBtn.style.display = 'none';
                if (vistaActual === 'productos') {
                    estadoFiltros.busqueda = '';
                    estadoFiltros.pagina = 1;
                    actualizarResultadosCatalogo({ reemplazarUrl: true });
                }
            });
        }

        // Menú desplegable de usuario en el encabezado
        const userBtn = document.getElementById('storeUserBtn');
        const userDropdown = document.getElementById('storeUserDropdown');
        if (userBtn && userDropdown) {
            userBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                userDropdown.classList.toggle('open');
            });
            document.addEventListener('click', function () {
                userDropdown.classList.remove('open');
            });
        }

        document.addEventListener('keydown', manejarTecladoGlobal);
    });
})();
