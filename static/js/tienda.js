/**
 * WORLDGYM STORE — Arquitectura Multivista Integrada a SYSTEM-GYM (v5.0)
 * Vistas sin recarga: #inicio, #membresias, #productos, #categorias, #marcas, #ofertas.
 * Incluye barra de filtros interactiva con slider dual en C$, píldoras deslizantes,
 * switches modernos, vuelo al carrito, verificación de stock en tiempo real y checkout.
 */

(function () {
    'use strict';

    const CART_STORAGE_KEY = 'worldgym_store_cart_v1';
    const PAGE_SIZE = 24;
    const DEBOUNCE_MS = 220;

    const VISTAS_VALIDAS = new Set(['inicio', 'membresias', 'productos', 'categorias', 'marcas', 'ofertas']);

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

    const META_CATEGORIAS_UI = {
        'Todos': {
            icono: 'fa-border-all',
            imagen: '/static/image/productos/cat_proteinas.png',
            descripcion: 'Suplementación deportiva, hidratación y accesorios con existencias verificadas en vivo.'
        },
        'Proteínas': {
            icono: 'fa-jar',
            imagen: '/static/image/productos/cat_proteinas.png',
            descripcion: 'Aislados de suero, mezclas proteicas y porciones individuales para síntesis y recuperación muscular.'
        },
        'Creatina': {
            icono: 'fa-bolt',
            imagen: '/static/image/productos/cat_creatinas.png',
            descripcion: 'Creatina monohidratada micronizada de alta pureza para fuerza explosiva y rendimiento.'
        },
        'Preentrenos': {
            icono: 'fa-fire-flame-curved',
            imagen: '/static/image/productos/cat_preentreno.png',
            descripcion: 'Energía sostenida, concentración mental y vasodilatación para entrenamientos de máxima intensidad.'
        },
        'Ganadores de masa': {
            icono: 'fa-dumbbell',
            imagen: '/static/image/productos/cat_massgainer.png',
            descripcion: 'Fórmulas hipercalóricas con carbohidratos complejos y proteína para etapas de volumen.'
        },
        'Bebidas energéticas': {
            icono: 'fa-bottle-water',
            imagen: '/static/image/productos/cat_aminoacidos.png',
            descripcion: 'Bebidas isotónicas, electrolitos, agua purificada y energizantes fríos listos para entrenar.'
        },
        'Accesorios': {
            icono: 'fa-mitten',
            imagen: '/static/image/productos/cat_accesorios.webp',
            descripcion: 'Guantes, shakers, cinturones y equipamiento de apoyo para tus sesiones en WorldGym.'
        },
        'Suplementos': {
            icono: 'fa-capsules',
            imagen: '/static/image/productos/cat_vitaminas.png',
            descripcion: 'Aminoácidos BCAA, glutamina, multivitamínicos, omega 3 y snacks proteicos.'
        }
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
        { valor: 'todos', etiqueta: 'Todos', dotClass: 'todos' },
        { valor: 'disponibles', etiqueta: 'Disponible', dotClass: 'disponible' },
        { valor: 'ultimas', etiqueta: 'Últimas unidades', dotClass: 'bajo' },
        { valor: 'agotados', etiqueta: 'Agotado', dotClass: 'agotado' }
    ];

    let catalogoProductos = Array.isArray(window.CATALOGO_INICIAL) ? window.CATALOGO_INICIAL : [];
    let cargandoCatalogo = false;
    let errorCargaCatalogo = '';

    let vistaActual = '';
    let carrito = [];
    let busquedaMarcaSidebar = '';
    let busquedaDirectorioMarcas = '';
    let paginaOfertas = 1;
    let lotesAcumuladosCatalogo = 1;

    let timerBusqueda = null;
    let timerPrecio = null;
    let ultimoElementoEnfocado = null;
    let planTiendaActual = { id: '', titulo: '', precio: '', duracion: '' };
    let accionPendienteAuth = null;

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

    function obtenerLimitesPrecioReales() {
        const precios = obtenerProductosActivosBase()
            .map(p => Number(p.Precio || 0))
            .filter(n => n > 0);
        if (precios.length === 0) {
            return { min: 0, max: 2000 };
        }
        const minReal = Math.floor(Math.min(...precios));
        const maxReal = Math.ceil(Math.max(...precios) / 10) * 10;
        return { min: Math.max(0, minReal), max: Math.max(100, maxReal) };
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
        const modalCheckout = document.getElementById('wgModalCheckoutMembresia');
        if (modalCheckout && modalCheckout.classList.contains('active')) {
            return modalCheckout.querySelector('.wg-modal-dialog');
        }
        const modalPlan = document.getElementById('wgModalPlan');
        if (modalPlan && modalPlan.classList.contains('active')) {
            return modalPlan.querySelector('.wg-modal-dialog');
        }
        const modalProd = document.getElementById('storeProductModal');
        if (modalProd && modalProd.classList.contains('open')) {
            return modalProd.querySelector('.store-modal-card');
        }
        const modalAuth = document.getElementById('storeAuthModal');
        if (modalAuth && modalAuth.classList.contains('open')) {
            return modalAuth.querySelector('.store-modal-card');
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
            if (typeof window.cerrarModalAuthTienda === 'function') window.cerrarModalAuthTienda();
            if (typeof window.cerrarCheckoutMembresiaTienda === 'function') window.cerrarCheckoutMembresiaTienda();
            cerrarDetalleMembresiaTienda();
            cerrarModalProducto();
            cerrarModalComprobante();
            cerrarCarrito();
            cerrarSidebarFiltrosMovil();
            if (typeof window.cerrarBuscadorHeader === 'function') window.cerrarBuscadorHeader();
            if (typeof window.cerrarMenuMovilTienda === 'function') window.cerrarMenuMovilTienda();
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
        ROUTER DE VISTAS Y ESTADO EN URL
        (#inicio, #membresias, #productos, #categorias, #marcas, #ofertas)
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
        if (vistaActual === 'categorias') return '#categorias';
        if (vistaActual === 'marcas') return '#marcas';
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
        const filtrandoMarca = vistaActual === 'productos' && Boolean(estadoFiltros.marca);
        const filtrandoCat = vistaActual === 'productos' && !filtrandoMarca && estadoFiltros.categoria !== 'Todos';

        document.querySelectorAll('[data-nav-view]').forEach(link => {
            const vistaLink = link.getAttribute('data-nav-view');
            let esActiva = vistaLink === vistaActual;

            if (vistaLink === 'productos' && (filtrandoMarca || filtrandoCat)) {
                esActiva = false;
            } else if (vistaLink === 'categorias' && filtrandoCat) {
                esActiva = true;
            } else if (vistaLink === 'marcas' && filtrandoMarca) {
                esActiva = true;
            }

            link.classList.toggle('active', esActiva);
            if (esActiva) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        if (window.WGMotion && typeof window.WGMotion.syncNavPill === 'function') {
            window.WGMotion.syncNavPill(false);
        }
    }

    function sincronizarBuscadorHeader() {
        const inputSearch = document.getElementById('storeSearchInput');
        const btnClear = document.getElementById('storeSearchClear');
        const searchStrip = document.getElementById('searchStrip');
        const textoActual = vistaActual === 'productos' ? estadoFiltros.busqueda : '';

        if (inputSearch && document.activeElement !== inputSearch && inputSearch.value !== textoActual) {
            inputSearch.value = textoActual;
        }
        const valorVisible = inputSearch ? inputSearch.value : textoActual;
        if (btnClear) {
            btnClear.style.display = valorVisible ? 'block' : 'none';
        }
        if (searchStrip && valorVisible.trim() !== '') {
            searchStrip.classList.add('is-open');
            searchStrip.setAttribute('aria-hidden', 'false');
        }
    }

    /* ======================================================================
        MOTOR DE REVELADO AL SCROLL (60 FPS — SOLO TRANSFORM Y OPACITY)
       ====================================================================== */
    const mediaMovimientoReducido = window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    const timersAsentadoFade = new WeakMap();
    let observadorFade = null;

    function prefiereMovimientoReducido() {
        return Boolean(mediaMovimientoReducido && mediaMovimientoReducido.matches);
    }

    function marcarElementoVisible(el, delayMs) {
        if (!el || el.classList.contains('is-visible')) return;
        const espera = Math.max(0, Number(delayMs) || 0);
        el.style.setProperty('--reveal-delay', espera + 'ms');
        el.classList.add('is-visible');

        const previo = timersAsentadoFade.get(el);
        if (previo) clearTimeout(previo);
        const timerId = setTimeout(function () {
            el.classList.add('is-settled');
            el.style.removeProperty('--reveal-delay');
            timersAsentadoFade.delete(el);
        }, espera + 680);
        timersAsentadoFade.set(el, timerId);
    }

    function ordenarElementosPorLectura(lista) {
        return lista.slice().sort(function (a, b) {
            const diffTop = a.rect.top - b.rect.top;
            if (Math.abs(diffTop) > 24) return diffTop;
            return a.rect.left - b.rect.left;
        });
    }

    function aplicarCascadaEnLote(elementosConRect) {
        const ordenados = ordenarElementosPorLectura(elementosConRect);
        let idxCard = 0;
        let idxBloque = 0;

        ordenados.forEach(function (item) {
            const el = item.el;
            const tipo = el.getAttribute('data-fade') || 'card';
            let delay = 0;

            if (tipo === 'card') {
                delay = Math.min(idxCard * 55, 280);
                idxCard++;
            } else if (tipo === 'heading' || tipo === 'sidebar') {
                delay = Math.min(idxBloque * 40, 120);
                idxBloque++;
            }
            marcarElementoVisible(el, delay);
        });
    }

    function asegurarObservadorDesvanecimiento() {
        if (observadorFade || typeof IntersectionObserver === 'undefined') return observadorFade;

        observadorFade = new IntersectionObserver(function (entries) {
            if (prefiereMovimientoReducido()) return;
            const entrantes = [];

            entries.forEach(function (entry) {
                const el = entry.target;
                if (entry.isIntersecting && !el.classList.contains('is-visible')) {
                    entrantes.push({ el: el, rect: entry.boundingClientRect });
                }
            });

            if (entrantes.length > 0) {
                aplicarCascadaEnLote(entrantes);
            }
        }, {
            threshold: [0, 0.06],
            rootMargin: '0px 0px -24px 0px'
        });

        return observadorFade;
    }

    function limpiarObservadosEnContenedor(contenedor) {
        if (!contenedor) return;
        contenedor.querySelectorAll('[data-fade-bound]').forEach(function (el) {
            const previo = timersAsentadoFade.get(el);
            if (previo) {
                clearTimeout(previo);
                timersAsentadoFade.delete(el);
            }
            if (observadorFade) observadorFade.unobserve(el);
        });
    }

    function sincronizarElementosAnimados(contenedor) {
        const ambito = contenedor || document;
        if (window.WGMotion && typeof window.WGMotion.refreshDynamicElements === 'function') {
            window.WGMotion.refreshDynamicElements(ambito);
        }

        if (prefiereMovimientoReducido()) return;
        const obs = asegurarObservadorDesvanecimiento();
        const nuevos = Array.from(ambito.querySelectorAll('[data-fade]:not([data-fade-bound])'));
        if (nuevos.length === 0) return;

        nuevos.forEach(function (el) {
            el.setAttribute('data-fade-bound', '1');
            if (obs) obs.observe(el);
        });

        requestAnimationFrame(function () {
            if (prefiereMovimientoReducido()) return;
            const vh = window.innerHeight || document.documentElement.clientHeight || 800;
            const visiblesIniciales = [];

            nuevos.forEach(function (el) {
                if (!el.isConnected || el.classList.contains('is-visible')) return;
                const estilo = window.getComputedStyle(el);
                if (estilo.display === 'none' || estilo.visibility === 'hidden') return;
                const rect = el.getBoundingClientRect();
                if (rect.height === 0 && rect.width === 0) return;
                if (rect.top < vh - 16 && rect.bottom > 0) {
                    visiblesIniciales.push({ el: el, rect: rect });
                }
            });

            if (visiblesIniciales.length > 0) {
                aplicarCascadaEnLote(visiblesIniciales);
            }
        });
    }

    function inicializarMotorDesvanecimiento() {
        const aplicarPreferencia = function () {
            if (prefiereMovimientoReducido()) {
                document.body.classList.remove('tienda-fx-ready');
            } else {
                document.body.classList.add('tienda-fx-ready');
                sincronizarElementosAnimados(document);
            }
        };

        aplicarPreferencia();
        if (mediaMovimientoReducido && typeof mediaMovimientoReducido.addEventListener === 'function') {
            mediaMovimientoReducido.addEventListener('change', aplicarPreferencia);
        }
    }

    /* ======================================================================
        MONTAJE MULTIVISTA CON TRANSICIÓN FLUIDA ENTRE APARTADOS
       ====================================================================== */
    function montarVista(nuevaVista, opciones) {
        const opts = opciones || {};
        const vistaObjetivo = VISTAS_VALIDAS.has(nuevaVista) ? nuevaVista : 'inicio';
        const inputSearch = document.getElementById('storeSearchInput');
        const usarTransicionVista = (
            vistaActual !== '' &&
            vistaActual !== vistaObjetivo &&
            !opts.desdePopState &&
            !prefiereMovimientoReducido() &&
            document.activeElement !== inputSearch &&
            !obtenerContenedorModalActivo()
        );

        if (usarTransicionVista && typeof document.startViewTransition === 'function') {
            try {
                document.startViewTransition(function () {
                    ejecutarMontajeVista(vistaObjetivo, opts, false);
                });
                return;
            } catch (e) {
                // Respaldo inmediato si la API de transición se cancela
            }
        }

        ejecutarMontajeVista(vistaObjetivo, opts, usarTransicionVista);
    }

    function ejecutarMontajeVista(nuevaVista, opciones, animarPanelFallback) {
        const opts = opciones || {};
        const vistaObjetivo = VISTAS_VALIDAS.has(nuevaVista) ? nuevaVista : 'inicio';
        const root = document.getElementById('storeViewRoot');
        if (!root) return;

        const cambioDeVista = vistaActual !== vistaObjetivo || root.children.length === 0;
        vistaActual = vistaObjetivo;
        document.body.setAttribute('data-current-view', vistaObjetivo);

        if (cambioDeVista) {
            cerrarSidebarFiltrosMovil();

            const mapaTemplates = {
                inicio: 'tplVistaInicio',
                membresias: 'tplVistaMembresias',
                productos: 'tplVistaProductos',
                categorias: 'tplVistaCategorias',
                marcas: 'tplVistaMarcas',
                ofertas: 'tplVistaOfertas'
            };
            const tpl = document.getElementById(mapaTemplates[vistaObjetivo]);
            limpiarObservadosEnContenedor(root);
            root.innerHTML = '';
            if (tpl && tpl.content) {
                root.appendChild(tpl.content.cloneNode(true));
            }
            root.setAttribute('data-active-view', vistaObjetivo);
            if (animarPanelFallback) {
                root.querySelector('.store-view-panel')?.classList.add('is-entering');
            }

            if (vistaObjetivo === 'productos') {
                vincularEventosVistaProductos();
            } else if (vistaObjetivo === 'marcas') {
                vincularEventosVistaMarcas();
            }
        }

        actualizarNavegacionActivaHeader();
        sincronizarBuscadorHeader();
        actualizarBadgeOfertasHeader();

        if (vistaObjetivo === 'inicio') {
            renderizarVistaInicio();
        } else if (vistaObjetivo === 'membresias') {
            renderizarEstadoMembresiaClienteEnVista();
        } else if (vistaObjetivo === 'productos') {
            renderizarVistaProductos();
        } else if (vistaObjetivo === 'categorias') {
            renderizarVistaCategorias();
        } else if (vistaObjetivo === 'marcas') {
            renderizarVistaMarcas();
        } else if (vistaObjetivo === 'ofertas') {
            renderizarVistaOfertas();
        }

        if (!opts.desdePopState) {
            sincronizarUrlConEstado(Boolean(opts.reemplazarHistorial));
        }

        if (cambioDeVista || opts.subirAlInicio) {
            if (window.WGMotion && typeof window.WGMotion.scrollToTop === 'function') {
                window.WGMotion.scrollToTop(true);
            } else {
                window.scrollTo(0, 0);
            }
        }
        sincronizarElementosAnimados(root);
        if (window.WGMotion && typeof window.WGMotion.onViewMounted === 'function') {
            window.WGMotion.onViewMounted(vistaObjetivo);
        }
    }

    /* ======================================================================
        FUNCIONES PÚBLICAS DE NAVEGACIÓN ENTRE VISTAS
       ====================================================================== */
    window.navegarVistaTienda = function (vista, ev) {
        if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
        cerrarDropdownsHeader();
        if (vista === 'ofertas') paginaOfertas = 1;
        if (vista === 'marcas') busquedaDirectorioMarcas = '';
        montarVista(vista, { subirAlInicio: true });
        return false;
    };

    window.navegarVistaProductosLimpia = function (ev) {
        if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
        cerrarDropdownsHeader();
        estadoFiltros = crearEstadoFiltrosInicial();
        lotesAcumuladosCatalogo = 1;
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
        lotesAcumuladosCatalogo = 1;
        busquedaMarcaSidebar = '';
        const inputSearch = document.getElementById('storeSearchInput');
        if (inputSearch) inputSearch.value = '';
        montarVista('productos', { subirAlInicio: true });
    };

    window.abrirMarcaDesdeMenu = function (marca) {
        cerrarDropdownsHeader();
        const valorMarca = String(marca || '').trim();
        if (!valorMarca) {
            montarVista('marcas', { subirAlInicio: true });
            return;
        }
        estadoFiltros = crearEstadoFiltrosInicial();
        estadoFiltros.marca = valorMarca;
        lotesAcumuladosCatalogo = 1;
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
        lotesAcumuladosCatalogo = 1;
        montarVista('productos', { subirAlInicio: vistaActual !== 'productos' });
    };

    window.enfocarBuscador = function () {
        const strip = document.getElementById('searchStrip');
        const input = document.getElementById('storeSearchInput');
        if (strip && strip.classList.contains('is-open') && input && !input.value.trim()) {
            if (typeof window.cerrarBuscadorHeader === 'function') window.cerrarBuscadorHeader();
            return;
        }
        if (typeof window.abrirBuscadorHeader === 'function') {
            window.abrirBuscadorHeader();
        } else if (input) {
            input.focus();
        }
    };

    window.abrirSidebarFiltrosMovil = function () {
        document.getElementById('storeFiltersBackdrop')?.classList.add('open');
        document.getElementById('storeFiltersSidebar')?.classList.add('open');
        if (window.WGMotion && typeof window.WGMotion.syncSidebarPills === 'function') {
            setTimeout(() => window.WGMotion.syncSidebarPills(true), 60);
        }
    };

    window.cerrarSidebarFiltrosMovil = function () {
        document.getElementById('storeFiltersBackdrop')?.classList.remove('open');
        document.getElementById('storeFiltersSidebar')?.classList.remove('open');
    };

    /* ======================================================================
        RECARGA Y ESTADOS DEL CATÁLOGO EN TIEMPO REAL
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
        else if (vistaActual === 'categorias') renderizarVistaCategorias();
        else if (vistaActual === 'marcas') renderizarVistaMarcas();
        else if (vistaActual === 'ofertas') renderizarVistaOfertas();
    }

    function crearHtmlSkeletons(cantidad) {
        const items = [];
        for (let i = 0; i < cantidad; i++) {
            items.push(`
                <div class="store-skeleton-card" aria-hidden="true">
                    <div class="store-skeleton-block" style="height: 196px;"></div>
                    <div class="store-skeleton-block" style="height: 12px; width: 42%;"></div>
                    <div class="store-skeleton-block" style="height: 18px; width: 88%;"></div>
                    <div class="store-skeleton-block" style="height: 22px; width: 38%; margin-top: auto;"></div>
                    <div class="store-skeleton-block" style="height: 44px; width: 100%;"></div>
                </div>
            `);
        }
        return items.join('');
    }

    /* ======================================================================
        TARJETAS DE PRODUCTO (LIMPIAS + QUICK VIEW + VUELO AL CARRITO)
       ====================================================================== */
    function crearHtmlTarjeta(p, indiceEnVista, sinReveal) {
        const stock = Number(p.Stock || 0);
        const agotado = stock <= 0;
        const ultimasUnidades = stock > 0 && stock <= 5;
        const enOferta = Boolean(p.EnOferta) && Number(p.Descuento) > 0;
        const mostrarPrecioAnterior = enOferta && Number(p.PrecioAnterior) > Number(p.Precio);

        let badgeHtml = '';
        if (agotado) {
            badgeHtml = `<span class="store-pill-agotado">Agotado</span>`;
        } else if (enOferta) {
            badgeHtml = `<span class="store-pill-oferta">-${Number(p.Descuento)}%</span>`;
        } else if (ultimasUnidades) {
            badgeHtml = `<span class="store-pill-ultimas">Últimas uds.</span>`;
        } else if (p.EsNuevo) {
            badgeHtml = `<span class="store-pill-nuevo">Nuevo</span>`;
        }

        const textoPresentacion = obtenerTextoPresentacion(p);
        const cargaImg = (typeof indiceEnVista === 'number' && indiceEnVista < 4) ? 'eager' : 'lazy';
        const attrFade = sinReveal ? '' : 'data-fade="card"';

        return `
            <article class="store-card" data-id="${Number(p.IdProducto)}" ${attrFade}>
                <div class="store-card-badges">
                    <div>${badgeHtml}</div>
                    <button type="button"
                            class="store-quickview-btn"
                            onclick="event.stopPropagation(); abrirDetalleProducto(${Number(p.IdProducto)}, this)"
                            title="Vista rápida de ${escaparHtml(p.NombreProducto)}"
                            aria-label="Vista rápida de ${escaparHtml(p.NombreProducto)}">
                        <i class="far fa-eye" aria-hidden="true"></i>
                    </button>
                </div>

                <div class="store-card-image-wrap is-img-loading" onclick="abrirDetalleProducto(${Number(p.IdProducto)}, this)">
                    <img src="${escaparHtml(p.ImagenUrl)}"
                         alt="${escaparHtml(p.NombreProducto)}"
                         width="220"
                         height="210"
                         loading="${cargaImg}"
                         onload="this.parentElement.classList.remove('is-img-loading')"
                         onerror="this.parentElement.classList.remove('is-img-loading'); this.src='/static/image/productos/real_whey_gold.webp'">
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
                                onclick="agregarAlCarrito(${Number(p.IdProducto)}, 1, this)"
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
        CONTEOS REALES 1 A 1 EN CATEGORÍAS, MARCAS, DISPONIBILIDAD Y CONDICIÓN
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
            const actual = mapa.get(marca) || { marca: marca, cantidad: 0, categorias: new Set(), imagenMuestra: p.ImagenUrl };
            actual.cantidad += 1;
            if (p.CategoriaTienda) {
                actual.categorias.add(ETIQUETAS_CATEGORIA[p.CategoriaTienda] || p.CategoriaTienda);
            }
            mapa.set(marca, actual);
        });
        return Array.from(mapa.values())
            .sort((a, b) => a.marca.localeCompare(b.marca, 'es', { sensitivity: 'base' }))
            .map(item => ({
                marca: item.marca,
                cantidad: item.cantidad,
                categorias: Array.from(item.categorias).slice(0, 2),
                imagenMuestra: item.imagenMuestra
            }));
    }

    function calcularConteosDisponibilidadYCondicion() {
        const activos = obtenerProductosActivosBase();
        const disp = { todos: activos.length, disponibles: 0, ultimas: 0, agotados: 0 };
        let ofertas = 0;
        let nuevos = 0;

        activos.forEach(p => {
            const stock = Number(p.Stock || 0);
            if (stock > 0) disp.disponibles++;
            if (stock > 0 && stock <= 5) disp.ultimas++;
            if (stock <= 0) disp.agotados++;
            if (Boolean(p.EnOferta) && Number(p.Descuento) > 0) ofertas++;
            if (Boolean(p.EsNuevo)) nuevos++;
        });

        return { disp, ofertas, nuevos };
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
            secDestacados.style.display = 'none';
            gridDestacados.innerHTML = '';
            return;
        }

        secDestacados.style.display = '';
        limpiarObservadosEnContenedor(gridDestacados);
        gridDestacados.innerHTML = destacados.map((p, idx) => crearHtmlTarjeta(p, idx, false)).join('');
        sincronizarElementosAnimados(gridDestacados);
    }

    /* ======================================================================
        VISTA 3: PRODUCTOS / CATÁLOGO COMPLETO + BARRA DE FILTROS DINÁMICA
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

    function actualizarVisualizacionSliderPrecio() {
        const rangeMin = document.getElementById('storePriceRangeMin');
        const rangeMax = document.getElementById('storePriceRangeMax');
        const fill = document.getElementById('storePriceRangeFill');
        const readout = document.getElementById('storePriceLiveReadout');
        if (!rangeMin || !rangeMax || !fill) return;

        const limites = obtenerLimitesPrecioReales();
        rangeMin.min = String(limites.min);
        rangeMin.max = String(limites.max);
        rangeMax.min = String(limites.min);
        rangeMax.max = String(limites.max);

        const valMin = estadoFiltros.precioMin !== ''
            ? Math.max(limites.min, Math.min(limites.max, Number(estadoFiltros.precioMin)))
            : limites.min;
        const valMax = estadoFiltros.precioMax !== ''
            ? Math.max(valMin, Math.min(limites.max, Number(estadoFiltros.precioMax)))
            : limites.max;

        rangeMin.value = String(valMin);
        rangeMax.value = String(valMax);

        const span = Math.max(1, limites.max - limites.min);
        const pctLeft = ((valMin - limites.min) / span) * 100;
        const pctRight = ((valMax - limites.min) / span) * 100;

        fill.style.left = `${Math.max(0, Math.min(100, pctLeft))}%`;
        fill.style.width = `${Math.max(0, Math.min(100 - pctLeft, pctRight - pctLeft))}%`;

        if (readout) {
            readout.textContent = `C$${valMin.toLocaleString('es-NI')} – C$${valMax.toLocaleString('es-NI')}`;
        }

        // Resaltar preset rápido si coincide exactamente
        document.querySelectorAll('#storePriceQuickPresets .store-price-preset-chip').forEach(chip => {
            const cMin = chip.getAttribute('data-pmin') || '';
            const cMax = chip.getAttribute('data-pmax') || '';
            chip.classList.toggle('active', estadoFiltros.precioMin === cMin && estadoFiltros.precioMax === cMax);
        });
    }

    window.aplicarPresetPrecio = function (minStr, maxStr) {
        const yaActivo = estadoFiltros.precioMin === String(minStr) && estadoFiltros.precioMax === String(maxStr);
        estadoFiltros.precioMin = yaActivo ? '' : String(minStr);
        estadoFiltros.precioMax = yaActivo ? '' : String(maxStr);
        estadoFiltros.pagina = 1;
        lotesAcumuladosCatalogo = 1;
        actualizarResultadosCatalogo({ reemplazarUrl: false, animarGrilla: true });
    };

    window.limpiarBusquedaMarcaSidebar = function () {
        busquedaMarcaSidebar = '';
        const brandSearch = document.getElementById('sidebarBrandSearch');
        const brandClear = document.getElementById('sidebarBrandClearBtn');
        if (brandSearch) {
            brandSearch.value = '';
            brandSearch.focus();
        }
        if (brandClear) brandClear.style.display = 'none';
        renderizarListaMarcasSidebar();
    };

    function vincularEventosVistaProductos() {
        const brandSearch = document.getElementById('sidebarBrandSearch');
        const brandClear = document.getElementById('sidebarBrandClearBtn');
        const priceMin = document.getElementById('storePriceMin');
        const priceMax = document.getElementById('storePriceMax');
        const rangeMin = document.getElementById('storePriceRangeMin');
        const rangeMax = document.getElementById('storePriceRangeMax');
        const chkOffers = document.getElementById('storeFilterOffers');
        const chkNew = document.getElementById('storeFilterNew');
        const selSort = document.getElementById('storeSortSelect');

        if (brandSearch) {
            brandSearch.value = busquedaMarcaSidebar;
            if (brandClear) brandClear.style.display = busquedaMarcaSidebar ? 'inline-flex' : 'none';
            brandSearch.addEventListener('input', function () {
                busquedaMarcaSidebar = this.value;
                if (brandClear) brandClear.style.display = busquedaMarcaSidebar ? 'inline-flex' : 'none';
                renderizarListaMarcasSidebar();
            });
        }

        const manejarCambioPrecioInputs = function () {
            if (timerPrecio) clearTimeout(timerPrecio);
            timerPrecio = setTimeout(function () {
                estadoFiltros.precioMin = priceMin ? priceMin.value.trim() : '';
                estadoFiltros.precioMax = priceMax ? priceMax.value.trim() : '';
                estadoFiltros.pagina = 1;
                lotesAcumuladosCatalogo = 1;
                actualizarResultadosCatalogo({ reemplazarUrl: true, animarGrilla: true });
            }, DEBOUNCE_MS);
        };

        if (priceMin) priceMin.addEventListener('input', manejarCambioPrecioInputs);
        if (priceMax) priceMax.addEventListener('input', manejarCambioPrecioInputs);

        const manejarSliderDual = function (esMin) {
            if (!rangeMin || !rangeMax) return;
            const limites = obtenerLimitesPrecioReales();
            let vMin = Number(rangeMin.value);
            let vMax = Number(rangeMax.value);

            if (esMin && vMin > vMax) {
                vMin = vMax;
                rangeMin.value = String(vMin);
            } else if (!esMin && vMax < vMin) {
                vMax = vMin;
                rangeMax.value = String(vMax);
            }

            estadoFiltros.precioMin = vMin <= limites.min ? '' : String(vMin);
            estadoFiltros.precioMax = vMax >= limites.max ? '' : String(vMax);

            if (priceMin) priceMin.value = estadoFiltros.precioMin;
            if (priceMax) priceMax.value = estadoFiltros.precioMax;
            actualizarVisualizacionSliderPrecio();

            if (timerPrecio) clearTimeout(timerPrecio);
            timerPrecio = setTimeout(function () {
                estadoFiltros.pagina = 1;
                lotesAcumuladosCatalogo = 1;
                actualizarResultadosCatalogo({ reemplazarUrl: true, animarGrilla: true });
            }, 140);
        };

        if (rangeMin) rangeMin.addEventListener('input', function () { manejarSliderDual(true); });
        if (rangeMax) rangeMax.addEventListener('input', function () { manejarSliderDual(false); });

        if (chkOffers) {
            chkOffers.addEventListener('change', function () {
                estadoFiltros.soloOfertas = this.checked;
                estadoFiltros.pagina = 1;
                lotesAcumuladosCatalogo = 1;
                actualizarResultadosCatalogo({ reemplazarUrl: false, animarGrilla: true });
            });
        }

        if (chkNew) {
            chkNew.addEventListener('change', function () {
                estadoFiltros.soloNuevos = this.checked;
                estadoFiltros.pagina = 1;
                lotesAcumuladosCatalogo = 1;
                actualizarResultadosCatalogo({ reemplazarUrl: false, animarGrilla: true });
            });
        }

        if (selSort) {
            selSort.addEventListener('change', function () {
                estadoFiltros.orden = this.value;
                estadoFiltros.pagina = 1;
                lotesAcumuladosCatalogo = 1;
                actualizarResultadosCatalogo({ reemplazarUrl: false, animarGrilla: true });
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

        const opciones = [{ valor: 'relevancia', texto: 'Ordenar: Relevancia' }];
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
        const countOffersEl = document.getElementById('countFilterOffers');
        const countNewEl = document.getElementById('countFilterNew');
        const btnClear = document.getElementById('storeClearFiltersBtn');
        const badgeMovil = document.getElementById('storeMobileFiltersBadge');

        const conteosCat = calcularConteosPorCategoria();
        const metricasEstado = calcularConteosDisponibilidadYCondicion();

        if (catContainer) {
            const pillExistente = catContainer.querySelector('.wg-sidebar-sliding-pill');
            const htmlOpcionesCat = ORDEN_CATEGORIAS_SIDEBAR
                .filter(c => !c.ocultarSiCero || (conteosCat[c.clave] || 0) > 0 || estadoFiltros.categoria === c.clave)
                .map(c => {
                    const activa = estadoFiltros.categoria === c.clave;
                    const cant = conteosCat[c.clave] || 0;
                    const meta = META_CATEGORIAS_UI[c.clave] || META_CATEGORIAS_UI['Todos'];
                    return `
                        <button type="button"
                                class="store-sidebar-option ${activa ? 'active' : ''}"
                                data-sidebar-cat="${escaparHtml(c.clave)}"
                                ${activa ? 'aria-current="true"' : ''}
                                onclick="seleccionarCategoriaCatalogo(this.getAttribute('data-sidebar-cat'))">
                            <span class="store-sidebar-opt-left">
                                <i class="fas ${meta.icono} store-sidebar-opt-icon" aria-hidden="true"></i>
                                <span>${escaparHtml(c.nombre)}</span>
                            </span>
                            <span class="store-sidebar-count">${cant}</span>
                        </button>
                    `;
                }).join('');

            catContainer.innerHTML = htmlOpcionesCat;
            if (pillExistente) catContainer.prepend(pillExistente);
        }

        renderizarListaMarcasSidebar();

        if (dispContainer) {
            const pillDisp = dispContainer.querySelector('.wg-sidebar-sliding-pill');
            dispContainer.innerHTML = OPCIONES_DISPONIBILIDAD.map(op => {
                const activa = estadoFiltros.disponibilidad === op.valor;
                const cantDisp = metricasEstado.disp[op.valor] ?? 0;
                return `
                    <button type="button"
                            class="store-sidebar-option ${activa ? 'active' : ''}"
                            onclick="seleccionarDisponibilidadCatalogo('${op.valor}')">
                        <span class="store-sidebar-opt-left">
                            <span class="store-disp-dot is-${op.dotClass}" aria-hidden="true"></span>
                            <span>${escaparHtml(op.etiqueta)}</span>
                        </span>
                        <span class="store-sidebar-count">${cantDisp}</span>
                    </button>
                `;
            }).join('');
            if (pillDisp) dispContainer.prepend(pillDisp);
        }

        if (priceMin && document.activeElement !== priceMin) {
            priceMin.value = estadoFiltros.precioMin;
        }
        if (priceMax && document.activeElement !== priceMax) {
            priceMax.value = estadoFiltros.precioMax;
        }
        actualizarVisualizacionSliderPrecio();

        if (chkOffers) {
            chkOffers.checked = estadoFiltros.soloOfertas;
            chkOffers.closest('.store-switch-row')?.classList.toggle('is-checked', estadoFiltros.soloOfertas);
        }
        if (chkNew) {
            chkNew.checked = estadoFiltros.soloNuevos;
            chkNew.closest('.store-switch-row')?.classList.toggle('is-checked', estadoFiltros.soloNuevos);
        }
        if (countOffersEl) countOffersEl.textContent = String(metricasEstado.ofertas);
        if (countNewEl) countNewEl.textContent = String(metricasEstado.nuevos);

        // Indicadores vivos de filtros aplicados en la cabecera y en cada acordeón
        const cantFiltros = contarFiltrosActivosCatalogo();
        const summaryEl = document.getElementById('sidebarActiveSummary');
        const countBadge = document.getElementById('sidebarActiveCountBadge');
        const quickReset = document.getElementById('sidebarQuickResetBtn');

        if (summaryEl) {
            summaryEl.textContent = cantFiltros > 0
                ? `${cantFiltros} filtro${cantFiltros === 1 ? '' : 's'} activo${cantFiltros === 1 ? '' : 's'}`
                : 'Catálogo completo';
        }
        if (countBadge) {
            countBadge.textContent = String(cantFiltros);
            countBadge.style.display = cantFiltros > 0 ? 'inline-flex' : 'none';
        }
        if (quickReset) {
            quickReset.style.display = cantFiltros > 0 ? 'inline-flex' : 'none';
        }

        const setDot = (id, show) => {
            const el = document.getElementById(id);
            if (el) el.hidden = !show;
        };
        setDot('dotFilterCat', estadoFiltros.categoria !== 'Todos');
        setDot('dotFilterBrand', estadoFiltros.marca !== '');
        setDot('dotFilterPrice', estadoFiltros.precioMin !== '' || estadoFiltros.precioMax !== '');
        setDot('dotFilterDisp', estadoFiltros.disponibilidad !== 'todos');
        setDot('dotFilterCond', estadoFiltros.soloOfertas || estadoFiltros.soloNuevos);

        if (btnClear) {
            btnClear.classList.toggle('has-active', cantFiltros > 0 || estadoFiltros.orden !== 'relevancia');
        }
        if (badgeMovil) {
            badgeMovil.textContent = String(cantFiltros);
            badgeMovil.style.display = cantFiltros > 0 ? 'inline-flex' : 'none';
        }

        if (window.WGMotion && typeof window.WGMotion.syncSidebarPills === 'function') {
            requestAnimationFrame(() => window.WGMotion.syncSidebarPills(false));
        }
    }

    function renderizarListaMarcasSidebar() {
        const brandContainer = document.getElementById('sidebarBrandList');
        const searchWrap = document.getElementById('sidebarBrandSearchWrap');
        if (!brandContainer) return;

        const todasLasMarcas = calcularConteosPorMarca();
        if (searchWrap) {
            searchWrap.style.display = todasLasMarcas.length > 5 ? 'flex' : 'none';
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
                <span class="store-sidebar-opt-left">
                    <span>Todas las marcas</span>
                </span>
                <span class="store-sidebar-count">${totalActivos}</span>
            </button>
        ` : '';

        if (marcasVisibles.length === 0 && filtroMarcaTexto) {
            brandContainer.innerHTML = `<p class="store-sidebar-empty-hint">Sin marcas que coincidan con "${escaparHtml(busquedaMarcaSidebar.trim())}".</p>`;
            return;
        }

        brandContainer.innerHTML = opcionTodas + marcasVisibles.map(item => {
            const activa = normalizarTexto(estadoFiltros.marca) === normalizarTexto(item.marca);
            return `
                <button type="button"
                        class="store-sidebar-option ${activa ? 'active' : ''}"
                        data-sidebar-brand="${escaparHtml(item.marca)}"
                        onclick="seleccionarMarcaCatalogo(this.getAttribute('data-sidebar-brand'))">
                    <span class="store-sidebar-opt-left">
                        <span>${escaparHtml(item.marca)}</span>
                    </span>
                    <span class="store-sidebar-count">${item.cantidad}</span>
                </button>
            `;
        }).join('');
    }

    function sincronizarBotonAdminCatalogo() {
        const topbarControls = document.querySelector('.store-topbar-right-controls');
        if (!topbarControls) return;
        let btnAdmin = topbarControls.querySelector('.store-grid-admin-btn');
        if (window.ES_ADMIN_TIENDA) {
            if (!btnAdmin) {
                btnAdmin = document.createElement('a');
                btnAdmin.href = '/producto_listar';
                btnAdmin.className = 'store-grid-admin-btn';
                btnAdmin.title = 'Ir al panel administrativo de productos';
                btnAdmin.innerHTML = '<i class="fas fa-sliders" aria-hidden="true"></i> <span>Administrar Productos</span>';
                const selectEl = topbarControls.querySelector('#storeSortSelect');
                if (selectEl) {
                    topbarControls.insertBefore(btnAdmin, selectEl);
                } else {
                    topbarControls.appendChild(btnAdmin);
                }
            }
        } else if (btnAdmin) {
            btnAdmin.remove();
        }
    }

    function renderizarMigasYTituloCatalogo() {
        const navMigas = document.getElementById('storeBreadcrumbs');
        const heroContext = document.getElementById('storeCatalogContextHero');

        const catActiva = estadoFiltros.categoria;
        const marcaActiva = estadoFiltros.marca;
        const etiquetaCat = ETIQUETAS_CATEGORIA[catActiva] || catActiva;
        const conteosCat = calcularConteosPorCategoria();

        if (navMigas) {
            if (marcaActiva) {
                navMigas.innerHTML = `
                    <a href="#inicio" onclick="return navegarVistaTienda('inicio', event)">Inicio</a>
                    <span class="store-breadcrumbs-sep" aria-hidden="true">&rsaquo;</span>
                    <a href="#marcas" onclick="return navegarVistaTienda('marcas', event)">Por Marca</a>
                    <span class="store-breadcrumbs-sep" aria-hidden="true">&rsaquo;</span>
                    <span class="store-breadcrumbs-current">${escaparHtml(marcaActiva)}</span>
                `;
            } else if (catActiva !== 'Todos') {
                navMigas.innerHTML = `
                    <a href="#inicio" onclick="return navegarVistaTienda('inicio', event)">Inicio</a>
                    <span class="store-breadcrumbs-sep" aria-hidden="true">&rsaquo;</span>
                    <a href="#categorias" onclick="return navegarVistaTienda('categorias', event)">Por Categoría</a>
                    <span class="store-breadcrumbs-sep" aria-hidden="true">&rsaquo;</span>
                    <span class="store-breadcrumbs-current">${escaparHtml(etiquetaCat)}</span>
                `;
            } else {
                navMigas.innerHTML = `
                    <a href="#inicio" onclick="return navegarVistaTienda('inicio', event)">Inicio</a>
                    <span class="store-breadcrumbs-sep" aria-hidden="true">&rsaquo;</span>
                    <span class="store-breadcrumbs-current">Productos</span>
                `;
            }
        }

        sincronizarBotonAdminCatalogo();
        if (!heroContext) return;

        // 1. Hero especializado cuando se explora una Marca
        if (marcaActiva) {
            const infoMarca = calcularConteosPorMarca().find(m => normalizarTexto(m.marca) === normalizarTexto(marcaActiva));
            const cantMarca = infoMarca ? infoMarca.cantidad : 0;
            const iniciales = marcaActiva.split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || 'WG';
            heroContext.innerHTML = `
                <div class="wg-context-banner is-brand">
                    <div class="wg-context-emblem">${escaparHtml(iniciales)}</div>
                    <div class="wg-context-copy">
                        <span class="wg-section-eyebrow">MARCA OFICIAL EN INVENTARIO</span>
                        <h1 class="store-display-heading store-page-heading" id="storeCatalogTitle">${escaparHtml(marcaActiva)}</h1>
                        <p>${cantMarca} producto${cantMarca === 1 ? '' : 's'} registrado${cantMarca === 1 ? '' : 's'} en el catálogo activo de WorldGym Store.</p>
                    </div>
                    <div class="wg-context-banner-actions">
                        <a href="#marcas" class="store-view-all-link" onclick="return navegarVistaTienda('marcas', event)">
                            Todas las marcas <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        // 2. Hero especializado cuando se explora una Categoría específica
        if (catActiva !== 'Todos') {
            const metaCat = META_CATEGORIAS_UI[catActiva] || META_CATEGORIAS_UI['Todos'];
            const cantCat = conteosCat[catActiva] || 0;
            heroContext.innerHTML = `
                <div class="wg-context-banner is-category">
                    <div class="wg-context-img-box">
                        <img src="${escaparHtml(metaCat.imagen)}" alt="${escaparHtml(etiquetaCat)}">
                    </div>
                    <div class="wg-context-copy">
                        <span class="wg-section-eyebrow">CATEGORÍA NUTRICIONAL · ${cantCat} PRODUCTO${cantCat === 1 ? '' : 'S'}</span>
                        <h1 class="store-display-heading store-page-heading" id="storeCatalogTitle">${escaparHtml(etiquetaCat)}</h1>
                        <p>${escaparHtml(metaCat.descripcion)}</p>
                    </div>
                    <div class="wg-context-banner-actions">
                        <a href="#categorias" class="store-view-all-link" onclick="return navegarVistaTienda('categorias', event)">
                            Ver categorías <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        // 3. Encabezado limpio y monumental del catálogo completo (sin botones apretados bajo el texto)
        const totalCat = obtenerProductosActivosBase().length;
        heroContext.innerHTML = `
            <div class="wg-catalog-default-head">
                <span class="wg-section-eyebrow">CATÁLOGO OFICIAL · ${totalCat} PRODUCTOS ACTIVOS</span>
                <h1 class="store-display-heading store-page-heading" id="storeCatalogTitle">Catálogo de <em>productos</em></h1>
            </div>
        `;
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
            chips.push({ clave: 'soloOfertas', texto: 'En oferta' });
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
                <span class="store-chip-x" aria-hidden="true">&times;</span>
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
        if (totalItems <= PAGE_SIZE) return '';
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
        actualizarResultadosCatalogo({ noSincronizarUrl: true, animarGrilla: false });
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
        const loadMoreWrap = document.getElementById('storeLoadMoreWrap');
        if (!gridCatalogo) return;

        if (cargandoCatalogo) {
            if (contadorEl) contadorEl.textContent = 'Cargando productos...';
            gridCatalogo.innerHTML = crearHtmlSkeletons(8);
            if (paginacionEl) paginacionEl.innerHTML = '';
            if (loadMoreWrap) loadMoreWrap.style.display = 'none';
            return;
        }

        if (errorCargaCatalogo && obtenerProductosActivosBase().length === 0) {
            if (contadorEl) contadorEl.textContent = '0 productos';
            gridCatalogo.innerHTML = `
                <div class="store-state-box" role="alert" data-fade="panel">
                    <i class="fas fa-triangle-exclamation store-state-icon" aria-hidden="true"></i>
                    <h3>No se pudo cargar el catálogo</h3>
                    <p>${escaparHtml(errorCargaCatalogo)}</p>
                    <button type="button" class="store-btn-cta" onclick="recargarCatalogoDesdeServidor()">
                        <i class="fas fa-rotate-right"></i> Reintentar
                    </button>
                </div>
            `;
            if (paginacionEl) paginacionEl.innerHTML = '';
            if (loadMoreWrap) loadMoreWrap.style.display = 'none';
            sincronizarElementosAnimados(gridCatalogo);
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
            const soloCatVacia = estadoFiltros.categoria !== 'Todos' && contarFiltrosActivosCatalogo() === 1;
            const etqVacia = ETIQUETAS_CATEGORIA[estadoFiltros.categoria] || estadoFiltros.categoria;
            const btnAdminHtml = window.ES_ADMIN_TIENDA
                ? `<a href="/producto_listar" class="wg-btn-system-outline"><i class="fas fa-sliders"></i> Administrar Productos</a>`
                : '';

            gridCatalogo.innerHTML = soloCatVacia
                ? `
                    <div class="store-state-box is-empty-category" data-fade="panel">
                        <div class="store-state-badge-icon"><i class="fas fa-box-open" aria-hidden="true"></i></div>
                        <h3>La línea de ${escaparHtml(etqVacia)} aún no tiene existencias publicadas</h3>
                        <p>Pronto incorporaremos productos verificados en esta categoría. Mientras tanto, explora nuestras proteínas, creatinas, pre-entrenos y bebidas en stock.</p>
                        <div class="store-state-actions">
                            <button type="button" class="store-btn-cta" onclick="seleccionarCategoriaCatalogo('Todos')">
                                Ver todos los productos
                            </button>
                            ${btnAdminHtml}
                        </div>
                    </div>
                `
                : `
                    <div class="store-state-box" data-fade="panel">
                        <div class="store-state-badge-icon"><i class="fas fa-magnifying-glass" aria-hidden="true"></i></div>
                        <h3>Sin coincidencias con los filtros seleccionados</h3>
                        <p>Ajusta el rango de precio, marca o disponibilidad para mostrar suplementos disponibles.</p>
                        <div class="store-state-actions">
                            <button type="button" class="store-btn-cta" onclick="limpiarFiltrosCatalogo()">
                                Restablecer filtros
                            </button>
                        </div>
                    </div>
                `;
            if (paginacionEl) paginacionEl.innerHTML = '';
            if (loadMoreWrap) loadMoreWrap.style.display = 'none';
            sincronizarElementosAnimados(gridCatalogo);
            return;
        }

        const inicioIdx = (estadoFiltros.pagina - 1) * PAGE_SIZE;
        const finIdx = inicioIdx + (PAGE_SIZE * lotesAcumuladosCatalogo);
        const paginaItems = filtrados.slice(inicioIdx, finIdx);

        limpiarObservadosEnContenedor(gridCatalogo);
        gridCatalogo.innerHTML = paginaItems.map((p, idx) => crearHtmlTarjeta(p, idx, Boolean(opts.animarGrilla))).join('');

        if (opts.animarGrilla && window.WGMotion && typeof window.WGMotion.animateGridItems === 'function') {
            window.WGMotion.animateGridItems(gridCatalogo);
        } else {
            sincronizarElementosAnimados(gridCatalogo);
        }

        // Botón discreto "Ver más" si hay más productos después del lote actual
        if (loadMoreWrap) {
            const restantes = total - (inicioIdx + paginaItems.length);
            if (restantes > 0 && estadoFiltros.pagina === 1) {
                loadMoreWrap.style.display = 'flex';
                loadMoreWrap.innerHTML = `
                    <button type="button" class="wg-load-more-btn" onclick="cargarMasProductosCatalogo()">
                        <span>Ver más productos (${restantes} restantes)</span>
                        <i class="fas fa-chevron-down" aria-hidden="true"></i>
                    </button>
                `;
            } else {
                loadMoreWrap.style.display = 'none';
                loadMoreWrap.innerHTML = '';
            }
        }

        if (paginacionEl) {
            paginacionEl.innerHTML = lotesAcumuladosCatalogo === 1
                ? construirHtmlPaginacion(total, estadoFiltros.pagina, 'irAPaginaCatalogo')
                : '';
        }
    }

    window.cargarMasProductosCatalogo = function () {
        const gridCatalogo = document.getElementById('storeCatalogGrid');
        if (gridCatalogo) {
            const tempWrap = document.createElement('div');
            tempWrap.style.display = 'contents';
            tempWrap.innerHTML = crearHtmlSkeletons(4);
            gridCatalogo.appendChild(tempWrap);
            setTimeout(function () {
                lotesAcumuladosCatalogo += 1;
                actualizarResultadosCatalogo({ noSincronizarUrl: true, animarGrilla: true });
            }, 240);
        } else {
            lotesAcumuladosCatalogo += 1;
            actualizarResultadosCatalogo({ noSincronizarUrl: true, animarGrilla: true });
        }
    };

    /* Acciones interactivas de filtros dentro de PRODUCTOS */
    window.seleccionarCategoriaCatalogo = function (categoria) {
        estadoFiltros.categoria = resolverCategoriaCanonica(categoria);
        estadoFiltros.pagina = 1;
        lotesAcumuladosCatalogo = 1;
        actualizarResultadosCatalogo({ reemplazarUrl: false, animarGrilla: true });
    };

    window.seleccionarMarcaCatalogo = function (marca) {
        estadoFiltros.marca = String(marca || '').trim();
        estadoFiltros.pagina = 1;
        lotesAcumuladosCatalogo = 1;
        actualizarResultadosCatalogo({ reemplazarUrl: false, animarGrilla: true });
    };

    window.seleccionarDisponibilidadCatalogo = function (disp) {
        estadoFiltros.disponibilidad = disp || 'todos';
        estadoFiltros.pagina = 1;
        lotesAcumuladosCatalogo = 1;
        actualizarResultadosCatalogo({ reemplazarUrl: false, animarGrilla: true });
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
        lotesAcumuladosCatalogo = 1;
        actualizarResultadosCatalogo({ reemplazarUrl: false, animarGrilla: true });
    };

    window.limpiarFiltrosCatalogo = function () {
        estadoFiltros = crearEstadoFiltrosInicial();
        lotesAcumuladosCatalogo = 1;
        busquedaMarcaSidebar = '';
        const brandSearch = document.getElementById('sidebarBrandSearch');
        const brandClear = document.getElementById('sidebarBrandClearBtn');
        if (brandSearch) brandSearch.value = '';
        if (brandClear) brandClear.style.display = 'none';
        const inputSearch = document.getElementById('storeSearchInput');
        if (inputSearch) inputSearch.value = '';
        const selSort = document.getElementById('storeSortSelect');
        if (selSort) selSort.value = 'relevancia';
        actualizarResultadosCatalogo({ reemplazarUrl: false, animarGrilla: true });
    };

    window.irAPaginaCatalogo = function (numPagina) {
        estadoFiltros.pagina = Math.max(1, Number(numPagina) || 1);
        lotesAcumuladosCatalogo = 1;
        actualizarResultadosCatalogo({ reemplazarUrl: false, animarGrilla: true });
        if (window.WGMotion && typeof window.WGMotion.scrollToTop === 'function') {
            window.WGMotion.scrollToTop(false);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    /* ======================================================================
        VISTA 4: POR CATEGORÍA (#categorias — DIRECTORIO COMPLETO)
       ====================================================================== */
    function renderizarVistaCategorias() {
        const grid = document.getElementById('storeCategoriesDirectoryGrid');
        if (!grid) return;

        const conteos = calcularConteosPorCategoria();
        const categoriasMostrar = ORDEN_CATEGORIAS_SIDEBAR.filter(c => c.clave !== 'Todos' && (!c.ocultarSiCero || (conteos[c.clave] || 0) > 0));

        limpiarObservadosEnContenedor(grid);
        grid.innerHTML = categoriasMostrar.map((cat, idx) => {
            const cant = conteos[cat.clave] || 0;
            const meta = META_CATEGORIAS_UI[cat.clave] || META_CATEGORIAS_UI['Todos'];
            return `
                <article class="wg-dir-card ${cant === 0 ? 'is-empty' : ''}"
                         data-fade="card"
                         role="button"
                         tabindex="0"
                         onclick="abrirCategoriaDesdeMenu('${escaparHtml(cat.clave)}')"
                         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();abrirCategoriaDesdeMenu('${escaparHtml(cat.clave)}');}">
                    <div class="wg-dir-card-top">
                        <span class="wg-dir-index">0${idx + 1}</span>
                        <span class="wg-dir-count-pill ${cant === 0 ? 'is-zero' : ''}">${cant} producto${cant === 1 ? '' : 's'}</span>
                    </div>
                    <div class="wg-dir-media">
                        <img src="${escaparHtml(meta.imagen)}" alt="${escaparHtml(cat.nombre)}" loading="lazy">
                    </div>
                    <div class="wg-dir-body">
                        <h2>${escaparHtml(cat.nombre)}</h2>
                        <p>${escaparHtml(meta.descripcion)}</p>
                        <span class="wg-dir-cta">
                            <span>${cant > 0 ? 'Explorar categoría' : 'Ver estado de línea'}</span>
                            <i class="fas fa-arrow-right" aria-hidden="true"></i>
                        </span>
                    </div>
                </article>
            `;
        }).join('');
        sincronizarElementosAnimados(grid);
    }

    /* ======================================================================
        VISTA 5: POR MARCA (#marcas — DIRECTORIO INTERACTIVO DE MARCAS REALES)
       ====================================================================== */
    function vincularEventosVistaMarcas() {
        const searchInput = document.getElementById('brandsDirectorySearch');
        if (!searchInput) return;
        searchInput.value = busquedaDirectorioMarcas;
        searchInput.addEventListener('input', function () {
            busquedaDirectorioMarcas = this.value;
            renderizarVistaMarcas(true);
        });
    }

    function renderizarVistaMarcas(animarSuave) {
        const grid = document.getElementById('storeBrandsDirectoryGrid');
        if (!grid) return;

        const todas = calcularConteosPorMarca();
        const q = normalizarTexto(busquedaDirectorioMarcas);
        const filtradas = q ? todas.filter(m => normalizarTexto(m.marca).includes(q)) : todas;

        if (filtradas.length === 0) {
            grid.innerHTML = `
                <div class="store-state-box">
                    <div class="store-state-badge-icon"><i class="fas fa-certificate" aria-hidden="true"></i></div>
                    <h3>No encontramos marcas con "${escaparHtml(busquedaDirectorioMarcas.trim())}"</h3>
                    <p>Prueba con otro nombre de marca o explora el catálogo completo.</p>
                </div>
            `;
            return;
        }

        limpiarObservadosEnContenedor(grid);
        grid.innerHTML = filtradas.map(item => {
            const iniciales = item.marca.split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || 'WG';
            const subCats = item.categorias.length > 0 ? item.categorias.join(' · ') : 'Suplementación deportiva';
            return `
                <button type="button"
                        class="wg-brand-card"
                        ${animarSuave ? '' : 'data-fade="card"'}
                        data-brand-go="${escaparHtml(item.marca)}"
                        onclick="abrirMarcaDesdeMenu(this.getAttribute('data-brand-go'))">
                    <div class="wg-brand-card-head">
                        <span class="wg-brand-monogram">${escaparHtml(iniciales)}</span>
                        <span class="wg-brand-count">${item.cantidad} prod.</span>
                    </div>
                    <div class="wg-brand-card-main">
                        <h3>${escaparHtml(item.marca)}</h3>
                        <p>${escaparHtml(subCats)}</p>
                    </div>
                    <div class="wg-brand-card-foot">
                        <span>Ver productos</span>
                        <i class="fas fa-arrow-right" aria-hidden="true"></i>
                    </div>
                </button>
            `;
        }).join('');

        if (animarSuave && window.WGMotion && typeof window.WGMotion.animateGridItems === 'function') {
            window.WGMotion.animateGridItems(grid);
        } else {
            sincronizarElementosAnimados(grid);
        }
    }

    /* ======================================================================
        VISTA 6: OFERTAS (#ofertas — BANNER PROMOCIONAL + DESCUENTOS)
       ====================================================================== */
    function renderizarVistaOfertas() {
        const gridOfertas = document.getElementById('storeOffersGrid');
        const topbarWrap = document.getElementById('ofertasTopbarWrap');
        const counterEl = document.getElementById('ofertasResultsCounter');
        const pagEl = document.getElementById('storeOffersPagination');
        const statsWrap = document.getElementById('ofertasPromoStats');
        const subtitleEl = document.getElementById('ofertasPromoSubtitle');
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

        const maxDesc = ofertasReales.reduce((acc, p) => Math.max(acc, Number(p.Descuento || 0)), 0);
        const totalDisponibles = obtenerProductosActivosBase().filter(p => Number(p.Stock) > 0).length;

        if (statsWrap) {
            statsWrap.innerHTML = ofertasReales.length > 0
                ? `
                    <div class="wg-offer-stat-pill">
                        <strong>${ofertasReales.length}</strong>
                        <span>Ofertas activas</span>
                    </div>
                    <div class="wg-offer-stat-pill is-highlight">
                        <strong>-${maxDesc}%</strong>
                        <span>Descuento máximo</span>
                    </div>
                `
                : `
                    <div class="wg-offer-stat-pill">
                        <strong>${totalDisponibles}</strong>
                        <span>Productos en stock</span>
                    </div>
                `;
        }

        if (ofertasReales.length === 0) {
            if (subtitleEl) {
                subtitleEl.textContent = 'En este momento todos los suplementos mantienen su precio regular directo en córdobas (C$).';
            }
            if (topbarWrap) topbarWrap.style.display = 'none';
            if (pagEl) pagEl.innerHTML = '';
            const btnAdminOfertas = window.ES_ADMIN_TIENDA
                ? `<a href="/producto_listar" class="wg-btn-system-outline"><i class="fas fa-sliders"></i> Configurar ofertas en sistema</a>`
                : '';

            gridOfertas.innerHTML = `
                <div class="store-state-box" data-fade="panel">
                    <div class="store-state-badge-icon"><i class="fas fa-tag" aria-hidden="true"></i></div>
                    <h3>No hay promociones con descuento activas hoy</h3>
                    <p>Explora nuestro catálogo completo con precios oficiales en córdobas y existencias reales listas en recepción.</p>
                    <div class="store-state-actions">
                        <button type="button" class="store-btn-cta" onclick="navegarVistaProductosLimpia()">
                            Explorar catálogo <i class="fas fa-arrow-right"></i>
                        </button>
                        ${btnAdminOfertas}
                    </div>
                </div>
            `;
            sincronizarElementosAnimados(gridOfertas);
            return;
        }

        if (subtitleEl) {
            subtitleEl.textContent = 'Descuentos directos aplicados sobre precios reales en córdobas (C$), listos para retiro en gimnasio.';
        }
        if (topbarWrap) topbarWrap.style.display = 'flex';
        if (counterEl) {
            counterEl.innerHTML = `<strong>${ofertasReales.length}</strong> producto${ofertasReales.length === 1 ? '' : 's'} con descuento activo`;
        }

        const totalPaginas = Math.max(1, Math.ceil(ofertasReales.length / PAGE_SIZE));
        if (paginaOfertas > totalPaginas) paginaOfertas = totalPaginas;

        const inicioIdx = (paginaOfertas - 1) * PAGE_SIZE;
        const visibles = ofertasReales.slice(inicioIdx, inicioIdx + PAGE_SIZE);

        limpiarObservadosEnContenedor(gridOfertas);
        gridOfertas.innerHTML = visibles.map((p, idx) => crearHtmlTarjeta(p, idx, false)).join('');
        sincronizarElementosAnimados(gridOfertas);
        if (pagEl) {
            pagEl.innerHTML = construirHtmlPaginacion(ofertasReales.length, paginaOfertas, 'irAPaginaOfertas');
        }
    }

    window.irAPaginaOfertas = function (numPagina) {
        paginaOfertas = Math.max(1, Number(numPagina) || 1);
        renderizarVistaOfertas();
        sincronizarUrlConEstado(false);
        if (window.WGMotion && typeof window.WGMotion.scrollToTop === 'function') {
            window.WGMotion.scrollToTop(false);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    /* ======================================================================
        MODAL DE DETALLES DEL PLAN Y FLUJO DE CONTRATACIÓN Y PAGO DE MEMBRESÍAS
       ====================================================================== */
    let estadoMembresiaCliente = window.ESTADO_MEMBRESIA_INICIAL || {
        autenticado: false,
        id_cliente: null,
        nombre_cliente: null,
        membresia_activa: null,
        solicitudes: []
    };
    let pasarelaConfigActual = window.PASARELA_CONFIG || {
        habilitada: false,
        proveedor: 'Stripe',
        public_key: ''
    };
    let metodoPagoMembresiaActual = 'tarjeta';
    let stripeInstance = null;
    let stripeElementsInstance = null;
    let stripeCardElement = null;
    let stripeScriptPromise = null;

    function cargarStripeJsDinamico() {
        if (window.Stripe) return Promise.resolve(window.Stripe);
        if (stripeScriptPromise) return stripeScriptPromise;
        stripeScriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.async = true;
            script.onload = () => resolve(window.Stripe);
            script.onerror = () => reject(new Error('No se pudo cargar el SDK seguro de Stripe.'));
            document.head.appendChild(script);
        });
        return stripeScriptPromise;
    }

    async function sincronizarEstadoMembresiaServidor() {
        try {
            const resp = await fetch('/api/tienda/membresias/estado', { method: 'GET' });
            if (!resp.ok) return;
            const data = await resp.json();
            if (data.success) {
                if (data.pasarela) pasarelaConfigActual = data.pasarela;
                if (data.estado_cliente) estadoMembresiaCliente = data.estado_cliente;
                renderizarEstadoMembresiaClienteEnVista();
            }
        } catch (err) {
            console.error('Aviso consultando estado de membresía:', err);
        }
    }

    function renderizarEstadoMembresiaClienteEnVista() {
        const wrap = document.getElementById('wgEstadoMembresiaClienteWrap');
        if (!wrap) return;

        if (!window.USUARIO_AUTENTICADO || !estadoMembresiaCliente) {
            wrap.style.display = 'none';
            wrap.innerHTML = '';
            return;
        }

        const activa = estadoMembresiaCliente.membresia_activa;
        const solicitudes = Array.isArray(estadoMembresiaCliente.solicitudes) ? estadoMembresiaCliente.solicitudes : [];
        const pendientes = solicitudes.filter(s => String(s.EstadoPago || '').toLowerCase() === 'pendiente');

        if (!activa && solicitudes.length === 0) {
            wrap.style.display = 'none';
            wrap.innerHTML = '';
            return;
        }

        let bloqueSuperiorHtml = '';
        if (activa) {
            bloqueSuperiorHtml = `
                <div class="wg-client-status-top">
                    <div class="wg-client-status-info">
                        <div class="wg-client-status-icon is-active">
                            <i class="fas fa-id-card-clip" aria-hidden="true"></i>
                        </div>
                        <div>
                            <span class="wg-client-status-kicker">TU MEMBRESÍA EN WORLD GYM</span>
                            <h3 class="wg-client-status-title">${escaparHtml(activa.NombreMembresia || 'Plan Activo')}</h3>
                            <p class="wg-client-status-meta">
                                Vigencia registrada: <strong>${escaparHtml(activa.FechaInicio || '—')}</strong> al <strong>${escaparHtml(activa.FechaFin || '—')}</strong>
                            </p>
                        </div>
                    </div>
                    <span class="wg-client-status-pill is-active">
                        <i class="fas fa-circle-check" aria-hidden="true"></i> Membresía Activa
                    </span>
                </div>
            `;
        } else if (pendientes.length > 0) {
            const ultPend = pendientes[0];
            bloqueSuperiorHtml = `
                <div class="wg-client-status-top">
                    <div class="wg-client-status-info">
                        <div class="wg-client-status-icon">
                            <i class="fas fa-clock" aria-hidden="true"></i>
                        </div>
                        <div>
                            <span class="wg-client-status-kicker">CONTRATACIÓN EN CURSO</span>
                            <h3 class="wg-client-status-title">${escaparHtml(ultPend.TituloPlan || ultPend.NombreMembresia)} (${formatearCordobas(ultPend.Monto)})</h3>
                            <p class="wg-client-status-meta">
                                Folio <strong>${escaparHtml(ultPend.Folio)}</strong> · Método: <strong>${escaparHtml(ultPend.MetodoPago)}</strong> · Presenta tu folio en recepción para confirmar el pago y activar tu plan.
                            </p>
                        </div>
                    </div>
                    <span class="wg-client-status-pill is-pending">
                        <i class="fas fa-hourglass-half" aria-hidden="true"></i> Pendiente de confirmación
                    </span>
                </div>
            `;
        }

        let historialMiniHtml = '';
        if (solicitudes.length > 0) {
            const filas = solicitudes.slice(0, 3).map(s => {
                const esConf = String(s.EstadoPago || '').toLowerCase() === 'confirmado';
                const esCanc = String(s.EstadoPago || '').toLowerCase() === 'cancelado';
                const claseEstado = esConf ? 'is-active' : 'is-pending';
                const iconoEstado = esConf ? 'fa-circle-check' : (esCanc ? 'fa-ban' : 'fa-clock');
                const textoEstado = esConf ? 'Pago Confirmado · Activa' : (esCanc ? 'Cancelada' : 'Pendiente de confirmación en recepción');
                return `
                    <div class="wg-client-req-row">
                        <div>
                            <strong>${escaparHtml(s.TituloPlan || s.NombreMembresia)}</strong>
                            <span style="color:#949AA6;"> · Folio ${escaparHtml(s.Folio)} · ${escaparHtml(s.FechaSolicitud || '')}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                            <span>Método: <strong>${escaparHtml(s.MetodoPago)}</strong></span>
                            <strong style="color:#F58220;">${formatearCordobas(s.Monto)}</strong>
                            <span class="wg-client-status-pill ${claseEstado}" style="padding:3px 9px; font-size:0.7rem;">
                                <i class="fas ${iconoEstado}" aria-hidden="true"></i> ${escaparHtml(textoEstado)}
                            </span>
                        </div>
                    </div>
                `;
            }).join('');

            historialMiniHtml = `
                <div class="wg-client-requests-mini">
                    <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#949AA6;">
                        Tus contrataciones recientes desde la página
                    </span>
                    ${filas}
                </div>
            `;
        }

        wrap.innerHTML = `
            <div class="wg-client-status-banner">
                ${bloqueSuperiorHtml}
                ${historialMiniHtml}
            </div>
        `;
        wrap.style.display = 'block';
    }

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
        const condiciones = cardEl.getAttribute('data-condiciones') || 'Uso personal e intransferible • Contratación desde tu cuenta o en recepción.';
        const esPopular = cardEl.getAttribute('data-popular') === '1';
        const sociosActivos = parseInt(cardEl.getAttribute('data-socios') || '0', 10);

        let beneficios = [];
        try {
            beneficios = JSON.parse(cardEl.getAttribute('data-beneficios') || '[]');
        } catch (e) {
            beneficios = [];
        }

        planTiendaActual = {
            id: id,
            titulo: titulo,
            nombreDb: nombreDb,
            precio: precio,
            duracion: duracion,
            tipo: tipo,
            beneficios: beneficios,
            condiciones: condiciones
        };

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
            document.getElementById('wgModalBtnSeleccionarCliente')?.focus();
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

    function mostrarAlertaCheckoutMembresia(mensaje, tipo) {
        const box = document.getElementById('wgCheckoutAlertBox');
        if (!box) return;
        if (!mensaje) {
            box.style.display = 'none';
            box.textContent = '';
            box.className = 'wg-checkout-alert';
            return;
        }
        box.className = 'wg-checkout-alert ' + (tipo === 'success' ? 'is-success' : 'is-error');
        box.innerHTML = `<i class="fas ${tipo === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}" aria-hidden="true"></i><span>${escaparHtml(mensaje)}</span>`;
        box.style.display = 'flex';
    }

    function calcularFechasEstimadasPlan(duracionTexto) {
        const ahora = new Date();
        let dias = 30;
        const txt = String(duracionTexto || '').toLowerCase();
        const mNum = txt.match(/(\d+)/);
        if (mNum) {
            dias = parseInt(mNum[1], 10) || 30;
        } else if (txt.includes('diario') || txt.includes('día') || txt.includes('dia')) {
            dias = 1;
        } else if (txt.includes('semanal')) {
            dias = 7;
        } else if (txt.includes('quincenal')) {
            dias = 15;
        }
        const fin = new Date(ahora.getTime() + (Math.max(1, dias) * 86400000));
        const fmt = d => d.toLocaleDateString('es-NI', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return {
            inicio: fmt(ahora),
            fin: fmt(fin),
            dias: dias
        };
    }

    window.seleccionarPlanComoCliente = function () {
        if (!window.USUARIO_AUTENTICADO) {
            accionPendienteAuth = { tipo: 'seleccionar_plan' };
            cerrarDetalleMembresiaTienda();
            window.abrirModalAuthTienda(
                'login',
                'Para contratar un plan de membresía desde tu cuenta debes iniciar sesión o registrarte.'
            );
            return;
        }
        cerrarDetalleMembresiaTienda();
        abrirPantallaConfirmacionMembresia();
    };

    async function prepararPasarelaTarjetaEnModal() {
        const wrapActiva = document.getElementById('wgPasarelaActivaWrap');
        const wrapPendiente = document.getElementById('wgPasarelaPendienteConfigWrap');
        if (!wrapActiva || !wrapPendiente) return;

        await sincronizarEstadoMembresiaServidor();

        if (!pasarelaConfigActual || !pasarelaConfigActual.habilitada || !pasarelaConfigActual.public_key) {
            wrapActiva.style.display = 'none';
            wrapPendiente.style.display = 'block';
            return;
        }

        wrapPendiente.style.display = 'none';
        wrapActiva.style.display = 'block';

        try {
            const StripeConstructor = await cargarStripeJsDinamico();
            if (!stripeInstance) {
                stripeInstance = StripeConstructor(pasarelaConfigActual.public_key);
                stripeElementsInstance = stripeInstance.elements({ locale: 'es' });
            }
            const mountEl = document.getElementById('wgStripeCardMount');
            if (mountEl && !stripeCardElement) {
                stripeCardElement = stripeElementsInstance.create('card', {
                    hidePostalCode: true,
                    style: {
                        base: {
                            color: '#FFFFFF',
                            fontFamily: 'Montserrat, Inter, sans-serif',
                            fontSize: '15px',
                            '::placeholder': { color: '#949AA6' }
                        },
                        invalid: { color: '#F87171', iconColor: '#F87171' }
                    }
                });
                stripeCardElement.mount('#wgStripeCardMount');
                stripeCardElement.on('change', function (event) {
                    const errEl = document.getElementById('wgStripeCardErrors');
                    if (errEl) errEl.textContent = event.error ? event.error.message : '';
                });
            }
        } catch (err) {
            console.error(err);
            mostrarAlertaCheckoutMembresia('No se pudo inicializar el componente seguro de la pasarela de pago.', 'error');
        }
    }

    window.seleccionarMetodoPagoMembresia = function (metodo) {
        metodoPagoMembresiaActual = metodo === 'efectivo' ? 'efectivo' : 'tarjeta';
        const tabTarjeta = document.getElementById('wgTabMetodoTarjeta');
        const tabEfectivo = document.getElementById('wgTabMetodoEfectivo');
        const panelTarjeta = document.getElementById('wgPanelPagoTarjeta');
        const panelEfectivo = document.getElementById('wgPanelPagoEfectivo');

        mostrarAlertaCheckoutMembresia('', '');

        if (tabTarjeta && tabEfectivo) {
            const esTarjeta = metodoPagoMembresiaActual === 'tarjeta';
            tabTarjeta.classList.toggle('active', esTarjeta);
            tabTarjeta.setAttribute('aria-selected', esTarjeta ? 'true' : 'false');
            tabEfectivo.classList.toggle('active', !esTarjeta);
            tabEfectivo.setAttribute('aria-selected', !esTarjeta ? 'true' : 'false');
        }

        if (panelTarjeta) panelTarjeta.style.display = metodoPagoMembresiaActual === 'tarjeta' ? 'block' : 'none';
        if (panelEfectivo) panelEfectivo.style.display = metodoPagoMembresiaActual === 'efectivo' ? 'block' : 'none';

        if (metodoPagoMembresiaActual === 'tarjeta') {
            prepararPasarelaTarjetaEnModal();
        }
    };

    function abrirPantallaConfirmacionMembresia() {
        const overlay = document.getElementById('wgModalCheckoutMembresia');
        if (!overlay || !planTiendaActual) return;

        const stepForm = document.getElementById('wgCheckoutFormStep');
        const stepSuccess = document.getElementById('wgCheckoutSuccessStep');
        if (stepForm) stepForm.style.display = 'flex';
        if (stepSuccess) stepSuccess.style.display = 'none';

        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        const precioNum = parseFloat(planTiendaActual.precio || '0') || 0;
        const precioFmt = precioNum.toFixed(2);
        const fechas = calcularFechasEstimadasPlan(planTiendaActual.duracion);

        setTxt('wgCheckoutEyebrow', 'CONFIRMACIÓN DE CONTRATACIÓN · WORLD GYM');
        setTxt('wgCheckoutTituloModal', 'Confirmar Plan y Método de Pago');
        setTxt('wgCheckoutPlanModalidad', 'MODALIDAD ' + String(planTiendaActual.tipo || 'ESTÁNDAR').toUpperCase());
        setTxt('wgCheckoutPlanNombre', planTiendaActual.titulo || planTiendaActual.nombreDb || 'PLAN DE MEMBRESÍA');
        setTxt('wgCheckoutPlanPrecio', precioFmt);
        setTxt('wgCheckoutFechaInicio', fechas.inicio);
        setTxt('wgCheckoutFechaFin', `${fechas.fin} (${fechas.dias} ${fechas.dias === 1 ? 'día' : 'días'})`);
        setTxt('wgCashMontoInstruccion', 'C$' + precioFmt);

        const vigEl = document.getElementById('wgCheckoutPlanVigencia');
        if (vigEl) {
            vigEl.innerHTML = `<i class="fas fa-calendar-check" aria-hidden="true"></i><span>Duración: ${escaparHtml(planTiendaActual.duracion || '30 DÍAS')}</span>`;
        }

        const benUl = document.getElementById('wgCheckoutPlanBeneficios');
        if (benUl) {
            const listaBen = Array.isArray(planTiendaActual.beneficios) && planTiendaActual.beneficios.length > 0
                ? planTiendaActual.beneficios
                : ['Acceso completo a instalaciones y maquinaria durante la vigencia contratada.', 'Control digital de asistencias vinculado a tu perfil.'];
            benUl.innerHTML = listaBen.map(b => `<li><i class="fas fa-check" aria-hidden="true"></i><span>${escaparHtml(b)}</span></li>`).join('');
        }

        const notesIn = document.getElementById('wgCashOrderNotes');
        if (notesIn) notesIn.value = '';

        seleccionarMetodoPagoMembresia('tarjeta');

        overlay.style.display = 'flex';
        setTimeout(() => {
            overlay.classList.add('active');
            document.getElementById('wgCheckoutCloseBtn')?.focus();
        }, 15);
    }

    window.volverADetallePlanDesdeCheckout = function () {
        cerrarCheckoutMembresiaTienda();
        const overlay = document.getElementById('wgModalPlan');
        if (overlay) {
            overlay.style.display = 'flex';
            setTimeout(() => overlay.classList.add('active'), 15);
        }
    };

    window.cerrarCheckoutMembresiaTienda = function () {
        const overlay = document.getElementById('wgModalCheckoutMembresia');
        if (!overlay || overlay.style.display === 'none') return;
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 180);
    };

    function mostrarConfirmacionFinalMembresia(solicitud, mensaje) {
        const stepForm = document.getElementById('wgCheckoutFormStep');
        const stepSuccess = document.getElementById('wgCheckoutSuccessStep');
        const content = document.getElementById('wgCheckoutSuccessContent');
        if (!stepForm || !stepSuccess || !content || !solicitud) return;

        const esConfirmado = String(solicitud.EstadoPago || '').toLowerCase() === 'confirmado';
        const colorEstado = esConfirmado ? '#10B981' : '#F59E0B';
        const bgIcono = esConfirmado ? 'rgba(16, 185, 129, 0.16)' : 'rgba(245, 158, 11, 0.16)';
        const icono = esConfirmado ? 'fa-circle-check' : 'fa-clock';
        const tituloExito = esConfirmado
            ? '¡Membresía Contratada y Activada!'
            : '¡Solicitud de Contratación Registrada!';

        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        setTxt('wgCheckoutEyebrow', 'COMPROBANTE DE CONTRATACIÓN · WORLD GYM');
        setTxt('wgCheckoutTituloModal', tituloExito);

        content.innerHTML = `
            <div style="text-align:center; margin-bottom:18px;">
                <div style="width:60px; height:60px; border-radius:50%; background:${bgIcono}; color:${colorEstado}; display:inline-flex; align-items:center; justify-content:center; font-size:28px; margin-bottom:10px; border:1px solid ${colorEstado};">
                    <i class="fas ${icono}" aria-hidden="true"></i>
                </div>
                <h4 style="margin:0 0 6px 0; font-size:1.25rem; font-weight:800; color:#FFFFFF;">${escaparHtml(tituloExito)}</h4>
                <p style="margin:0; font-size:0.86rem; color:#D5D8DF; line-height:1.5;">${escaparHtml(mensaje)}</p>
            </div>

            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:16px 18px; margin-bottom:18px; font-size:0.85rem; display:flex; flex-direction:column; gap:9px;">
                <div style="display:flex; justify-content:space-between; gap:10px;">
                    <span style="color:#949AA6;">Folio de contratación:</span>
                    <strong style="color:#F58220;">${escaparHtml(solicitud.Folio)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; gap:10px;">
                    <span style="color:#949AA6;">Socio / Cliente:</span>
                    <strong style="color:#FFFFFF;">${escaparHtml(solicitud.NombreCliente)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; gap:10px;">
                    <span style="color:#949AA6;">Plan contratado:</span>
                    <strong style="color:#FFFFFF;">${escaparHtml(solicitud.TituloPlan || solicitud.NombreMembresia)} (${escaparHtml(solicitud.DuracionTexto)})</strong>
                </div>
                <div style="display:flex; justify-content:space-between; gap:10px;">
                    <span style="color:#949AA6;">Método de pago:</span>
                    <strong style="color:#FFFFFF;">${escaparHtml(solicitud.MetodoPago)}${solicitud.Ultimos4 ? ' (•••• ' + escaparHtml(solicitud.Ultimos4) + ')' : ''}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; gap:10px;">
                    <span style="color:#949AA6;">Estado del pago:</span>
                    <strong style="color:${colorEstado};">${escaparHtml(solicitud.EstadoPago)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; gap:10px;">
                    <span style="color:#949AA6;">Estado de la membresía:</span>
                    <strong style="color:${colorEstado};">${escaparHtml(solicitud.EstadoMembresia)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; gap:10px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08); font-size:1rem;">
                    <span style="color:#FFFFFF; font-weight:700;">Monto total:</span>
                    <strong style="color:#F58220; font-size:1.15rem;">${formatearCordobas(solicitud.Monto)}</strong>
                </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button type="button" class="wg-btn-orange-select" id="wgBtnCerrarExitoMembresia" onclick="cerrarCheckoutMembresiaTienda()">
                    <i class="fas fa-check" aria-hidden="true"></i>
                    <span>Entendido</span>
                </button>
            </div>
        `;

        stepForm.style.display = 'none';
        stepSuccess.style.display = 'flex';
        setTimeout(() => {
            document.getElementById('wgBtnCerrarExitoMembresia')?.focus();
        }, 20);
    }

    window.confirmarContratacionEfectivoMembresia = async function () {
        if (!planTiendaActual || !planTiendaActual.id) return;
        const btn = document.getElementById('wgBtnConfirmarEfectivo');
        const notas = document.getElementById('wgCashOrderNotes')?.value.trim() || '';

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin" aria-hidden="true"></i><span>Registrando solicitud...</span>`;
        }
        mostrarAlertaCheckoutMembresia('', '');

        try {
            const resp = await fetch('/api/tienda/membresias/contratar-efectivo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_membresia: Number(planTiendaActual.id),
                    notas: notas
                })
            });
            const data = await resp.json();

            if (resp.status === 401 || data.requiere_login) {
                window.USUARIO_AUTENTICADO = false;
                accionPendienteAuth = { tipo: 'seleccionar_plan' };
                cerrarCheckoutMembresiaTienda();
                window.abrirModalAuthTienda('login', data.error || 'Debes iniciar sesión para contratar una membresía.');
                return;
            }

            if (!data.success) {
                mostrarAlertaCheckoutMembresia(data.error || 'No se pudo registrar la solicitud.', 'error');
                return;
            }

            if (data.estado_cliente) {
                estadoMembresiaCliente = data.estado_cliente;
                renderizarEstadoMembresiaClienteEnVista();
            }
            window.mostrarToastTienda(data.mensaje || 'Solicitud de membresía en efectivo registrada.', 'success');
            mostrarConfirmacionFinalMembresia(data.solicitud, data.mensaje);
        } catch (err) {
            console.error(err);
            mostrarAlertaCheckoutMembresia('Error de conexión al registrar la solicitud en efectivo.', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<i class="fas fa-check-circle" aria-hidden="true"></i><span>Registrar Contratación con Pago en Efectivo</span>`;
            }
        }
    };

    window.procesarPagoTarjetaMembresia = async function () {
        if (!planTiendaActual || !planTiendaActual.id) return;
        const btn = document.getElementById('wgBtnPagarTarjetaReal');
        const titular = document.getElementById('wgCardHolderName')?.value.trim() || '';

        if (!pasarelaConfigActual || !pasarelaConfigActual.habilitada || !stripeInstance || !stripeCardElement) {
            mostrarAlertaCheckoutMembresia(
                'La pasarela de pago electrónico con tarjeta aún no tiene credenciales configuradas en el servidor (.env).',
                'error'
            );
            return;
        }

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin" aria-hidden="true"></i><span>Procesando con la pasarela...</span>`;
        }
        mostrarAlertaCheckoutMembresia('', '');

        try {
            // 1. Solicitar al backend la creación del PaymentIntent real en Stripe
            const respIntento = await fetch('/api/tienda/membresias/crear-intento-tarjeta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_membresia: Number(planTiendaActual.id) })
            });
            const dataIntento = await respIntento.json();
            if (!dataIntento.success || !dataIntento.intento || !dataIntento.intento.client_secret) {
                mostrarAlertaCheckoutMembresia(dataIntento.error || 'No fue posible iniciar la transacción en la pasarela.', 'error');
                return;
            }

            // 2. Confirmar el pago con tarjeta directamente contra Stripe (los datos de la tarjeta nunca pasan por nuestro servidor)
            const resultadoStripe = await stripeInstance.confirmCardPayment(dataIntento.intento.client_secret, {
                payment_method: {
                    card: stripeCardElement,
                    billing_details: {
                        name: titular || (window.USUARIO_ACTUAL && window.USUARIO_ACTUAL.nombre) || 'Cliente World Gym'
                    }
                }
            });

            if (resultadoStripe.error) {
                mostrarAlertaCheckoutMembresia(resultadoStripe.error.message || 'El pago con tarjeta fue rechazado por la pasarela.', 'error');
                return;
            }

            const pi = resultadoStripe.paymentIntent;
            if (!pi || pi.status !== 'succeeded') {
                mostrarAlertaCheckoutMembresia('El pago aún no fue confirmado por la pasarela.', 'error');
                return;
            }

            // 3. Notificar el ID de la transacción (nunca PAN ni CVV) al servidor para verificar en Stripe, activar la membresía y guardar el pago
            const respConf = await fetch('/api/tienda/membresias/confirmar-tarjeta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_membresia: Number(planTiendaActual.id),
                    payment_intent_id: pi.id
                })
            });
            const dataConf = await respConf.json();
            if (!dataConf.success) {
                mostrarAlertaCheckoutMembresia(dataConf.error || 'Error al activar la membresía tras el pago.', 'error');
                return;
            }

            if (dataConf.estado_cliente) {
                estadoMembresiaCliente = dataConf.estado_cliente;
                renderizarEstadoMembresiaClienteEnVista();
            }
            stripeCardElement.clear();
            window.mostrarToastTienda(dataConf.mensaje || '¡Membresía activada con éxito!', 'success');
            mostrarConfirmacionFinalMembresia(dataConf.solicitud, dataConf.mensaje);
        } catch (err) {
            console.error(err);
            mostrarAlertaCheckoutMembresia('Error de comunicación con la pasarela de pagos.', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<i class="fas fa-lock" aria-hidden="true"></i><span>Pagar con Tarjeta y Activar Membresía</span>`;
            }
        }
    };

    /* ======================================================================
        MODAL DE VISTA RÁPIDA / DETALLE DE PRODUCTO
       ====================================================================== */
    window.cambiarCantidadModalProducto = function (delta, maxPermitido) {
        const input = document.getElementById('modalProdQty');
        if (!input) return;
        const max = Math.max(1, Number(maxPermitido || 1));
        const actual = Math.floor(Number(input.value) || 1);
        input.value = String(Math.min(max, Math.max(1, actual + Number(delta))));
    };

    window.agregarDesdeModalProducto = function (idProducto, btnEl) {
        const input = document.getElementById('modalProdQty');
        const cant = input ? Math.max(1, Math.floor(Number(input.value) || 1)) : 1;
        if (window.agregarAlCarrito(idProducto, cant, btnEl)) {
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
                                onclick="agregarDesdeModalProducto(${Number(prod.IdProducto)}, this)"
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
        CARRITO DE COMPRAS + VUELO ANIMADO AL ICONO + CHECKOUT EN VIVO
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
        }, 3000);
    };

    window.agregarAlCarrito = function (idProducto, cantidadAgregar, triggerBtn) {
        if (!window.USUARIO_AUTENTICADO) {
            accionPendienteAuth = {
                tipo: 'agregar_carrito',
                idProducto: Number(idProducto),
                cantidadAgregar: Math.max(1, Math.floor(Number(cantidadAgregar || 1))),
                triggerBtn: triggerBtn || null
            };
            cerrarModalProducto();
            window.abrirModalAuthTienda(
                'login',
                'Para realizar cualquier compra debes iniciar sesión o registrarte.'
            );
            return false;
        }
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

        if (window.WGMotion && typeof window.WGMotion.flyToCart === 'function' && triggerBtn) {
            window.WGMotion.flyToCart(triggerBtn, prod.ImagenUrl);
        } else if (window.WGMotion && typeof window.WGMotion.bounceCartBadge === 'function') {
            window.WGMotion.bounceCartBadge();
        }

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
        if (window.WGMotion && typeof window.WGMotion.bounceCartBadge === 'function') {
            window.WGMotion.bounceCartBadge();
        }
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

        if (!window.USUARIO_AUTENTICADO) {
            accionPendienteAuth = { tipo: 'confirmar_compra' };
            window.abrirModalAuthTienda(
                'login',
                'Para realizar cualquier compra debes iniciar sesión o registrarte.'
            );
            return;
        }

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

            if (resp.status === 401 || data.requiere_login) {
                window.USUARIO_AUTENTICADO = false;
                accionPendienteAuth = { tipo: 'confirmar_compra' };
                window.abrirModalAuthTienda(
                    'login',
                    data.error || 'Para realizar cualquier compra debes iniciar sesión o registrarte.'
                );
                return;
            }

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
        MODAL DE ACCESO Y REGISTRO DE CLIENTES EN TIENDA
       ====================================================================== */
    function mostrarAlertaAuthTienda(mensaje, tipo) {
        const alertEl = document.getElementById('storeAuthAlertBox');
        if (!alertEl) return;
        if (!mensaje) {
            alertEl.style.display = 'none';
            alertEl.textContent = '';
            alertEl.className = 'store-auth-alert';
            return;
        }
        alertEl.className = 'store-auth-alert ' + (tipo === 'success' ? 'is-success' : 'is-error');
        alertEl.innerHTML = `<i class="fas ${tipo === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}" aria-hidden="true"></i> <span>${escaparHtml(mensaje)}</span>`;
        alertEl.style.display = 'flex';
    }

    window.cambiarTabAuthTienda = function (tab) {
        const esRegistro = tab === 'registro';
        const btnLogin = document.getElementById('tabBtnLoginTienda');
        const btnRegistro = document.getElementById('tabBtnRegistroTienda');
        const formLogin = document.getElementById('formLoginTienda');
        const formRegistro = document.getElementById('formRegistroTienda');
        const heading = document.getElementById('storeAuthModalHeading');

        mostrarAlertaAuthTienda('', '');

        if (btnLogin && btnRegistro) {
            btnLogin.classList.toggle('active', !esRegistro);
            btnLogin.setAttribute('aria-selected', esRegistro ? 'false' : 'true');
            btnRegistro.classList.toggle('active', esRegistro);
            btnRegistro.setAttribute('aria-selected', esRegistro ? 'true' : 'false');
        }
        if (formLogin) formLogin.style.display = esRegistro ? 'none' : 'flex';
        if (formRegistro) formRegistro.style.display = esRegistro ? 'flex' : 'none';
        if (heading) {
            heading.textContent = esRegistro
                ? 'Crea tu cuenta de cliente'
                : 'Inicia sesión en tu cuenta';
        }

        setTimeout(() => {
            if (esRegistro) {
                document.getElementById('authRegPrimerNombre')?.focus();
            } else {
                document.getElementById('authLoginUsuario')?.focus();
            }
        }, 25);
    };

    window.abrirModalAuthTienda = function (tabInicial, motivoTexto) {
        const modal = document.getElementById('storeAuthModal');
        if (!modal) {
            window.location.href = '/login';
            return;
        }
        ultimoElementoEnfocado = document.activeElement;
        document.getElementById('storeUserDropdown')?.classList.remove('open');

        const motivoEl = document.getElementById('storeAuthMotivoBanner');
        if (motivoEl) {
            motivoEl.textContent = motivoTexto || 'Para realizar cualquier compra o contratar una membresía debes iniciar sesión o registrarte.';
        }

        window.cambiarTabAuthTienda(tabInicial === 'registro' ? 'registro' : 'login');
        modal.classList.add('open');
    };

    window.cerrarModalAuthTienda = function (conservarPendiente) {
        const modal = document.getElementById('storeAuthModal');
        if (!modal || !modal.classList.contains('open')) return;
        modal.classList.remove('open');
        mostrarAlertaAuthTienda('', '');
        if (!conservarPendiente) {
            accionPendienteAuth = null;
        }
        if (ultimoElementoEnfocado && typeof ultimoElementoEnfocado.focus === 'function') {
            ultimoElementoEnfocado.focus();
            ultimoElementoEnfocado = null;
        }
    };

    function actualizarUIUsuarioAutenticado(usuario) {
        const nombre = (usuario && usuario.nombre) ? String(usuario.nombre) : 'Cliente';
        const rol = (usuario && usuario.rol) ? String(usuario.rol) : 'Cliente';
        const esAdmin = Boolean(usuario && usuario.es_admin);

        window.USUARIO_AUTENTICADO = true;
        window.USUARIO_ACTUAL = { nombre: nombre, rol: rol, es_admin: esAdmin };
        window.ES_ADMIN_TIENDA = esAdmin;

        // 1. Icono y menú desplegable de usuario en el header
        const userBtn = document.getElementById('storeUserBtn');
        const userIcon = document.getElementById('storeUserBtnIcon');
        const dropdownHead = document.getElementById('storeUserDropdownHead');
        const dropdownBody = document.getElementById('storeUserDropdownBody');

        if (userBtn) userBtn.title = `Mi cuenta (${nombre})`;
        if (userIcon) userIcon.className = 'fas fa-user-check';
        if (dropdownHead) {
            dropdownHead.innerHTML = `
                <strong>${escaparHtml(nombre)}</strong>
                <small>Rol: ${escaparHtml(rol)}</small>
            `;
        }
        if (dropdownBody) {
            const linksAdminHtml = esAdmin ? `
                <a href="/dashboard">
                    <i class="fas fa-gauge-high"></i> Panel de Administrador
                </a>
                <a href="/producto_listar">
                    <i class="fas fa-sliders"></i> Administrar Productos
                </a>
                <a href="/membresia_listar">
                    <i class="fas fa-id-card"></i> Administrar Membresías
                </a>
                <a href="/producto_registrar">
                    <i class="fas fa-plus-circle"></i> Nuevo Producto
                </a>
            ` : '';
            dropdownBody.innerHTML = `
                <button type="button" onclick="abrirCarrito()">
                    <i class="fas fa-bag-shopping"></i> Ver Carrito de Compras
                </button>
                ${linksAdminHtml}
                <hr>
                <a href="/logout" class="store-logout-link">
                    <i class="fas fa-right-from-bracket"></i> Cerrar Sesión
                </a>
            `;
        }

        // 2. Slot de acción en el header (ocultar botón Iniciar sesión; mostrar Panel Admin solo si tiene permisos)
        const headerSlot = document.getElementById('storeHeaderAuthSlot');
        if (headerSlot) {
            headerSlot.innerHTML = esAdmin ? `
                <a href="/dashboard" class="store-header-admin-btn" id="storeHeaderAdminBtn" title="Ir al Panel de Administrador">
                    <i class="fas fa-gauge-high" aria-hidden="true"></i>
                    <span>Panel Admin</span>
                </a>
            ` : '';
        }

        // 3. Barra superior ejecutiva SYSTEM-GYM (solo si tiene permisos administrativos)
        let sysBar = document.getElementById('storeSystemBar');
        if (esAdmin) {
            document.body.classList.add('has-system-bar');
            if (!sysBar) {
                sysBar = document.createElement('div');
                sysBar.className = 'store-system-bar';
                sysBar.id = 'storeSystemBar';
                sysBar.setAttribute('role', 'region');
                sysBar.setAttribute('aria-label', 'Accesos rápidos al sistema de gestión');
                sysBar.innerHTML = `
                    <div class="wg-container store-system-bar-inner">
                        <div class="store-system-status">
                            <span class="store-system-dot" aria-hidden="true"></span>
                            <span><strong>SYSTEM-GYM</strong> · Vista Tienda sincronizada con inventario en vivo</span>
                            <span class="store-system-role-pill">${escaparHtml(rol)}</span>
                        </div>
                        <div class="store-system-actions">
                            <a href="/dashboard" class="store-back-dashboard" title="Regresar al Panel de Administrador">
                                <i class="fas fa-gauge-high" aria-hidden="true"></i>
                                <span>Panel de Administrador</span>
                            </a>
                            <a href="/producto_listar" class="store-admin-pill store-only-productos" title="Ir al panel administrativo de productos">
                                <i class="fas fa-sliders" aria-hidden="true"></i>
                                <span>Administrar Productos</span>
                            </a>
                        </div>
                    </div>
                `;
                document.body.insertBefore(sysBar, document.body.firstChild);
            }
        } else {
            document.body.classList.remove('has-system-bar');
            if (sysBar) sysBar.remove();
        }

        // 4. Menú móvil y Footer
        const mobileAuth = document.getElementById('storeMobileNavAuth');
        if (mobileAuth) {
            mobileAuth.innerHTML = esAdmin ? `
                <a href="/dashboard" class="store-back-dashboard">
                    <i class="fas fa-gauge-high"></i> <span>Panel de Administrador</span>
                </a>
                <a href="/producto_listar" class="store-admin-pill">
                    <i class="fas fa-sliders"></i> <span>Administrar Productos</span>
                </a>
            ` : `
                <a href="/logout" class="store-back-dashboard" style="width: 100%; justify-content: center;">
                    <i class="fas fa-right-from-bracket"></i> <span>Cerrar Sesión (${escaparHtml(nombre)})</span>
                </a>
            `;
        }

        const footerCol = document.getElementById('storeFooterAccountCol');
        if (footerCol) {
            footerCol.innerHTML = `
                <h4>Tu Cuenta</h4>
                <button type="button" onclick="abrirCarrito()">Mi Carrito</button>
                ${esAdmin ? '<a href="/dashboard">Panel de Administrador</a><a href="/producto_listar">Administrar Productos</a>' : ''}
                <a href="/logout">Cerrar Sesión</a>
            `;
        }

        const modalPlanFooter = document.getElementById('wgModalPlanFooter');
        if (modalPlanFooter && esAdmin) {
            const idPlan = encodeURIComponent(planTiendaActual.id || '1');
            modalPlanFooter.innerHTML = `
                <div class="wg-modal-admin-links">
                    <button type="button" class="wg-btn-outline-dark" onclick="cerrarDetalleMembresiaTienda()">
                        Cerrar
                    </button>
                    <a href="/cliente_membresia?id_membresia=${idPlan}" id="wgModalBtnSeleccionar" class="wg-btn-outline-dark" title="Asignar en panel administrativo">
                        <i class="fas fa-user-check"></i> Panel Admin
                    </a>
                    <a href="/membresia_actualizar?id=${idPlan}" id="wgModalBtnEditar" class="wg-btn-outline-dark" title="Editar membresía">
                        <i class="fas fa-edit"></i> Editar
                    </a>
                    <a href="/membresia_eliminar?id=${idPlan}" id="wgModalBtnEliminar" class="wg-btn-outline-dark danger" title="Eliminar membresía">
                        <i class="fas fa-trash"></i>
                    </a>
                </div>
                <button type="button" id="wgModalBtnSeleccionarCliente" class="wg-btn-orange-select" onclick="seleccionarPlanComoCliente()">
                    <span>Continuar con la contratación</span>
                    <span aria-hidden="true">&rarr;</span>
                </button>
            `;
        }

        sincronizarEstadoMembresiaServidor();
    }

    function ejecutarAccionPendienteAuth() {
        const pendiente = accionPendienteAuth;
        accionPendienteAuth = null;
        if (!pendiente) return;

        if (pendiente.tipo === 'agregar_carrito') {
            window.agregarAlCarrito(pendiente.idProducto, pendiente.cantidadAgregar, pendiente.triggerBtn);
        } else if (pendiente.tipo === 'confirmar_compra') {
            window.confirmarCompraTienda();
        } else if (pendiente.tipo === 'seleccionar_plan') {
            window.seleccionarPlanComoCliente();
        }
    }

    window.enviarLoginTienda = async function (e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        const inputUsu = document.getElementById('authLoginUsuario');
        const inputPass = document.getElementById('authLoginPassword');
        const btn = document.getElementById('btnSubmitLoginTienda');

        const usuario = inputUsu ? inputUsu.value.trim() : '';
        const password = inputPass ? inputPass.value : '';

        if (!usuario || !password) {
            mostrarAlertaAuthTienda('Por favor ingresa tu nombre de usuario y contraseña.', 'error');
            return false;
        }

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Verificando acceso...</span>`;
        }
        mostrarAlertaAuthTienda('', '');

        try {
            const resp = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    NombreUsuario: usuario,
                    Contrasena: password,
                    origen: 'tienda'
                })
            });
            const data = await resp.json();

            if (!data.success) {
                mostrarAlertaAuthTienda(data.error || 'Usuario o contraseña incorrectos.', 'error');
                return false;
            }

            actualizarUIUsuarioAutenticado(data.usuario || { nombre: usuario, rol: 'Cliente', es_admin: false });
            window.cerrarModalAuthTienda(true);
            if (inputPass) inputPass.value = '';

            const saludo = (data.usuario && data.usuario.es_admin)
                ? `¡Bienvenido, ${data.usuario.nombre}! Panel de Administrador habilitado.`
                : `¡Sesión iniciada como ${data.usuario ? data.usuario.nombre : usuario}!`;
            window.mostrarToastTienda(saludo, 'success');

            ejecutarAccionPendienteAuth();
        } catch (err) {
            console.error(err);
            mostrarAlertaAuthTienda('Error de conexión con el servidor. Intenta nuevamente.', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<i class="fas fa-right-to-bracket"></i> <span>Iniciar Sesión y Continuar</span>`;
            }
        }
        return false;
    };

    window.enviarRegistroTienda = async function (e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        const primerNombre = document.getElementById('authRegPrimerNombre')?.value.trim() || '';
        const segundoNombre = document.getElementById('authRegSegundoNombre')?.value.trim() || '';
        const primerApellido = document.getElementById('authRegPrimerApellido')?.value.trim() || '';
        const segundoApellido = document.getElementById('authRegSegundoApellido')?.value.trim() || '';
        const telefono = document.getElementById('authRegTelefono')?.value.trim() || '';
        const correo = document.getElementById('authRegCorreo')?.value.trim() || '';
        const nombreUsuario = document.getElementById('authRegUsuario')?.value.trim() || '';
        const contrasena = document.getElementById('authRegPassword')?.value || '';
        const btn = document.getElementById('btnSubmitRegistroTienda');

        if (!primerNombre || !primerApellido || !telefono || !correo || !nombreUsuario || !contrasena) {
            mostrarAlertaAuthTienda('Completa todos los campos marcados con asterisco (*).', 'error');
            return false;
        }
        if (contrasena.length < 4) {
            mostrarAlertaAuthTienda('La contraseña debe tener al menos 4 caracteres.', 'error');
            return false;
        }

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Creando cuenta...</span>`;
        }
        mostrarAlertaAuthTienda('', '');

        try {
            const resp = await fetch('/api/tienda/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    PrimerNombre: primerNombre,
                    SegundoNombre: segundoNombre,
                    PrimerApellido: primerApellido,
                    SegundoApellido: segundoApellido,
                    Telefono: telefono,
                    Correo: correo,
                    NombreUsuario: nombreUsuario,
                    Contrasena: contrasena
                })
            });
            const data = await resp.json();

            if (!data.success) {
                mostrarAlertaAuthTienda(data.error || 'No se pudo completar el registro.', 'error');
                return false;
            }

            actualizarUIUsuarioAutenticado(data.usuario || { nombre: nombreUsuario, rol: 'Cliente', es_admin: false });
            window.cerrarModalAuthTienda(true);
            window.mostrarToastTienda(data.mensaje || `¡Cuenta creada exitosamente! Bienvenido, ${nombreUsuario}.`, 'success');

            ejecutarAccionPendienteAuth();
        } catch (err) {
            console.error(err);
            mostrarAlertaAuthTienda('Error de conexión al registrar tu cuenta.', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<i class="fas fa-user-check"></i> <span>Crear Cuenta y Continuar</span>`;
            }
        }
        return false;
    };

    /* ======================================================================
        INICIALIZACIÓN GENERAL
       ====================================================================== */
    document.addEventListener('DOMContentLoaded', function () {
        inicializarMotorDesvanecimiento();
        cargarCarrito();
        renderizarCarrito();

        const rutaInicial = leerRutaDesdeUrl();
        estadoFiltros = rutaInicial.filtros;
        paginaOfertas = rutaInicial.paginaOfertas;
        montarVista(rutaInicial.vista, { reemplazarHistorial: true, subirAlInicio: true });

        const sincronizarDesdeNavegador = function () {
            const ruta = leerRutaDesdeUrl();
            estadoFiltros = ruta.filtros;
            paginaOfertas = ruta.paginaOfertas;
            lotesAcumuladosCatalogo = 1;
            montarVista(ruta.vista, { desdePopState: true });
        };
        window.addEventListener('hashchange', sincronizarDesdeNavegador);
        window.addEventListener('popstate', sincronizarDesdeNavegador);

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
                    lotesAcumuladosCatalogo = 1;
                    if (vistaActual !== 'productos') {
                        if (texto.trim() !== '') {
                            montarVista('productos', { reemplazarHistorial: false, subirAlInicio: true });
                        }
                    } else {
                        actualizarResultadosCatalogo({ reemplazarUrl: true, animarGrilla: true });
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
                    lotesAcumuladosCatalogo = 1;
                    actualizarResultadosCatalogo({ reemplazarUrl: true, animarGrilla: true });
                }
            });
        }

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

        const urlParamsAuth = new URLSearchParams(window.location.search);
        const authParam = (urlParamsAuth.get('auth') || '').toLowerCase();
        if (!window.USUARIO_AUTENTICADO && (authParam === 'login' || authParam === 'registro')) {
            setTimeout(() => {
                window.abrirModalAuthTienda(authParam);
            }, 150);
        }
    });
})();
