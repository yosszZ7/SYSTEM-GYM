/**
 * WORLDGYM STORE — Motor Cinematográfico de Animaciones (v5.1)
 * Coreografía fiel al video de referencia (GSAP 3.12.5 + ScrollTrigger + Lenis Smooth Scroll),
 * garantizando visibilidad 100% inmediata de textos, titulares y botones de acceso en todo momento,
 * sin dependencias frágiles que oculten contenidos.
 *
 * Características activas del video de referencia:
 *  1. Smooth Scroll Lenis sincronizado con GSAP ScrollTrigger.
 *  2. Navbar flotante siempre visible con píldora naranja deslizante en vivo (scroll-spy).
 *  3. Hero cinematográfico con zoom Ken Burns continuo, líneas de titular enmascaradas,
 *     barrido de luz vivo en la mini-tarjeta flotante y retroceso en profundidad con scroll.
 *  4. Titulares con revelado ascendente editorial fluido en cada sección.
 *  5. Contadores reales rodantes de 0 al valor exacto con rebote elástico.
 *  6. Tarjetas de membresía con reparto 3D escalonado, parallax de fondo y 3D Tilt suave interpolado.
 *  7. Scrollytelling fijado (pin real) en escritorio con cortina clip-path continua guiada por el scroll.
 *  8. Carrusel horizontal expandible de categorías con arrastre, flechas y floración interna.
 *  9. Grillas dinámicas con cascada de entrada y liberación inmediata de propiedades (clearProps).
 * 10. Línea de tiempo SVG iluminada progresivamente con el scroll y nodos elásticos.
 * 11. Wordmark monumental WORLDGYM en el footer con elevación parallax profunda.
 * 12. Micro-animación de confirmación (✓ Agregado) y vuelo parabólico al icono del carrito.
 */

(function () {
    'use strict';

    const finePointerQuery = window.matchMedia
        ? window.matchMedia('(hover: hover) and (pointer: fine)')
        : null;

    let lenisInstance = null;
    let pluginRegistrado = false;
    let vistaTriggers = [];
    let scrollyPinTrigger = null;
    let vistaActivaMotion = 'inicio';
    let indiceCatExpandida = 0;
    let pasoScrollyActual = 0;
    let ultimoScrollY = 0;

    function movimientoDesactivado() {
        return document.documentElement.getAttribute('data-wg-no-motion') === '1';
    }

    function tienePunteroFino() {
        return Boolean(finePointerQuery && finePointerQuery.matches);
    }

    function tieneGSAP() {
        return typeof window.gsap !== 'undefined';
    }

    function tieneScrollTrigger() {
        return tieneGSAP() && typeof window.ScrollTrigger !== 'undefined';
    }

    function registrarPluginsGSAP() {
        if (!tieneGSAP()) return false;
        if (!movimientoDesactivado()) {
            document.body.classList.add('wg-gsap-active');
        }
        if (tieneScrollTrigger() && !pluginRegistrado) {
            window.gsap.registerPlugin(window.ScrollTrigger);
            window.ScrollTrigger.config({ ignoreMobileResize: true });
            pluginRegistrado = true;
        }
        return true;
    }

    function registrarTrigger(st) {
        if (st) vistaTriggers.push(st);
        return st;
    }

    function limpiarTriggersDeVista() {
        scrollyPinTrigger = null;
        vistaTriggers.forEach(function (st) {
            if (st && typeof st.kill === 'function') {
                st.kill();
            }
        });
        vistaTriggers = [];
    }

    /* ======================================================================
       1. SMOOTH SCROLL CON LENIS + SINCRONIZACIÓN CON GSAP SCROLLTRIGGER
       ====================================================================== */
    function inicializarLenis() {
        registrarPluginsGSAP();
        if (movimientoDesactivado() || typeof window.Lenis === 'undefined') {
            return;
        }

        try {
            lenisInstance = new window.Lenis({
                duration: 1.12,
                easing: function (t) {
                    return Math.min(1, 1.001 - Math.pow(2, -10 * t));
                },
                smoothWheel: true,
                wheelMultiplier: 0.96,
                touchMultiplier: 1.4
            });

            if (tieneScrollTrigger()) {
                lenisInstance.on('scroll', window.ScrollTrigger.update);
                lenisInstance.on('scroll', actualizarProgresoYNavbar);
                window.gsap.ticker.add(function (time) {
                    if (lenisInstance) lenisInstance.raf(time * 1000);
                });
                window.gsap.ticker.lagSmoothing(0);
            } else {
                lenisInstance.on('scroll', actualizarProgresoYNavbar);
                const loopRaf = function (time) {
                    if (lenisInstance) lenisInstance.raf(time);
                    requestAnimationFrame(loopRaf);
                };
                requestAnimationFrame(loopRaf);
            }
        } catch (err) {
            console.warn('Lenis no disponible, usando scroll nativo:', err);
            lenisInstance = null;
        }
    }

    /* ======================================================================
       2. PROGRESO DE SCROLL + NAVBAR FLOTANTE CON AUTO-HIDE INTELIGENTE
       Se oculta al bajar y reaparece suavemente al subir (o en el tope)
       ====================================================================== */
    function actualizarProgresoYNavbar() {
        const scrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
        const docHeight = Math.max(
            document.documentElement.scrollHeight,
            document.body ? document.body.scrollHeight : 0
        ) - window.innerHeight;

        const progressBar = document.getElementById('wgScrollProgress');
        if (progressBar) {
            const ratio = docHeight > 4 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;
            progressBar.style.transform = `scaleX(${ratio.toFixed(4)})`;
        }

        const header = document.getElementById('storeHeader');
        if (!header) return;

        const systemBar = document.getElementById('storeSystemBar');
        const altoSystemBar = systemBar ? systemBar.offsetHeight : 0;
        const offsetTopBase = altoSystemBar > 0 ? Math.max(12, (altoSystemBar + 12) - scrollY) : 12;
        header.style.setProperty('--wg-header-top', `${offsetTopBase}px`);

        const delta = scrollY - ultimoScrollY;
        const umbralTope = 90;

        const searchOpen = Boolean(document.getElementById('searchStrip') && document.getElementById('searchStrip').classList.contains('is-open'));
        const navDrawerEl = document.getElementById('storeMobileNavDrawer');
        const filtersSidebarEl = document.getElementById('storeFiltersSidebar');
        const drawerOpen = Boolean(
            (navDrawerEl && (navDrawerEl.classList.contains('open') || navDrawerEl.classList.contains('is-open'))) ||
            (filtersSidebarEl && filtersSidebarEl.classList.contains('open'))
        );

        if (scrollY <= umbralTope || searchOpen || drawerOpen) {
            header.classList.remove('is-hidden');
        } else if (delta > 6) {
            // Bajando: ocultar la barra flotante
            header.classList.add('is-hidden');
        } else if (delta < -6) {
            // Subiendo: revelar la barra flotante
            header.classList.remove('is-hidden');
        }

        header.classList.toggle('is-scrolled', scrollY > 36);
        ultimoScrollY = scrollY;
    }

    /* ======================================================================
       3. PÍLDORA NARANJA DESLIZANTE EN EL NAVBAR + SCROLL-SPY EN INICIO
       ====================================================================== */
    function moverPildoraNavbarAElemento(targetEl, inmediato) {
        const navContainer = document.getElementById('storeNavLinks');
        const pill = document.getElementById('wgNavActivePill');
        if (!navContainer || !pill || !targetEl) return;

        const navRect = navContainer.getBoundingClientRect();
        const elRect = targetEl.getBoundingClientRect();
        if (navRect.width === 0 || elRect.width === 0) return;

        const destinoX = elRect.left - navRect.left;
        const destinoAncho = elRect.width;

        navContainer.querySelectorAll('.store-nav-link').forEach(function (lnk) {
            lnk.classList.toggle('is-pill-active', lnk === targetEl);
        });

        pill.style.opacity = '1';

        if (!tieneGSAP() || movimientoDesactivado() || inmediato) {
            pill.style.width = `${destinoAncho}px`;
            pill.style.transform = `translate3d(${destinoX}px, -50%, 0)`;
            return;
        }

        window.gsap.to(pill, {
            x: destinoX,
            yPercent: -50,
            width: destinoAncho,
            duration: 0.42,
            ease: 'power3.out',
            overwrite: 'auto'
        });
    }

    function obtenerElementoNavActivoPorEstado() {
        const navContainer = document.getElementById('storeNavLinks');
        if (!navContainer) return null;

        const prioridad = navContainer.querySelector('.store-nav-link.active');
        if (prioridad) return prioridad;

        return navContainer.querySelector(`[data-nav-view="${vistaActivaMotion}"]`)
            || navContainer.querySelector('[data-nav-view="inicio"]');
    }

    function sincronizarPildoraNavbar(inmediato) {
        const objetivo = obtenerElementoNavActivoPorEstado();
        if (objetivo) {
            moverPildoraNavbarAElemento(objetivo, Boolean(inmediato));
        }
    }

    /* ======================================================================
       4. PÍLDORAS ACTIVAS DESLIZANTES EN LA BARRA DE FILTROS DE PRODUCTOS
       ====================================================================== */
    function sincronizarPildoraListaSidebar(contenedorId, inmediato) {
        const lista = document.getElementById(contenedorId);
        if (!lista) return;

        let pill = lista.querySelector('.wg-sidebar-sliding-pill');
        if (!pill) {
            pill = document.createElement('span');
            pill.className = 'wg-sidebar-sliding-pill';
            pill.setAttribute('aria-hidden', 'true');
            lista.prepend(pill);
        }

        const opcionActiva = lista.querySelector('.store-sidebar-option.active');
        if (!opcionActiva) {
            pill.style.opacity = '0';
            return;
        }

        const destinoY = opcionActiva.offsetTop;
        const destinoAlto = opcionActiva.offsetHeight;
        if (destinoAlto === 0) return;

        pill.style.opacity = '1';

        if (!tieneGSAP() || movimientoDesactivado() || inmediato) {
            pill.style.height = `${destinoAlto}px`;
            pill.style.transform = `translate3d(0, ${destinoY}px, 0)`;
            return;
        }

        window.gsap.to(pill, {
            y: destinoY,
            height: destinoAlto,
            duration: 0.36,
            ease: 'power3.out',
            overwrite: 'auto'
        });
    }

    function sincronizarPildorasSidebar(inmediato) {
        sincronizarPildoraListaSidebar('sidebarCategoryList', inmediato);
        sincronizarPildoraListaSidebar('sidebarAvailabilityList', inmediato);
    }

    /* ======================================================================
       5. ACORDEONES INTERACTIVOS: BARRA DE FILTROS Y PREGUNTAS FRECUENTES
       ====================================================================== */
    window.alternarGrupoFiltroSidebar = function (btnTrigger) {
        const grupo = btnTrigger ? btnTrigger.closest('.store-filter-group') : null;
        if (!grupo) return;

        const abrir = !grupo.classList.contains('is-open');
        grupo.classList.toggle('is-open', abrir);
        btnTrigger.setAttribute('aria-expanded', abrir ? 'true' : 'false');

        if (abrir) {
            setTimeout(function () {
                sincronizarPildorasSidebar(true);
            }, 220);
        }
    };

    window.alternarAcordeonFaq = function (btnTrigger) {
        const item = btnTrigger ? btnTrigger.closest('.wg-faq-item') : null;
        const contenedor = btnTrigger ? btnTrigger.closest('.wg-faq-list') : null;
        if (!item) return;

        const abrir = !item.classList.contains('is-open');
        if (contenedor && abrir) {
            contenedor.querySelectorAll('.wg-faq-item.is-open').forEach(function (otro) {
                if (otro !== item) {
                    otro.classList.remove('is-open');
                    otro.querySelector('.wg-faq-trigger')?.setAttribute('aria-expanded', 'false');
                }
            });
        }

        item.classList.toggle('is-open', abrir);
        btnTrigger.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    };

    /* ======================================================================
       6. REVELADO EDITORIAL DE ENCABEZADOS Y TITULARES (SEGURO Y ROBUSTO)
       ====================================================================== */
    function configurarTitularesSecciones(ambito) {
        if (movimientoDesactivado() || !tieneGSAP()) return;
        const root = ambito || document.getElementById('storeViewRoot') || document;

        const bloques = root.querySelectorAll(
            '.store-section-head:not([data-head-animated]), .wg-page-hero-header:not([data-head-animated]), .wg-subblock-head:not([data-head-animated]), .wg-offers-promo-copy:not([data-head-animated])'
        );

        bloques.forEach(function (head) {
            head.setAttribute('data-head-animated', '1');
            const items = head.querySelectorAll('.wg-section-eyebrow, .store-display-heading, .wg-section-lead, .wg-offers-kicker, .wg-offers-title, #ofertasPromoSubtitle, .wg-subblock-title');
            if (items.length === 0) return;

            if (tieneScrollTrigger()) {
                window.gsap.from(items, {
                    y: 24,
                    opacity: 0,
                    duration: 0.68,
                    stagger: 0.08,
                    ease: 'power3.out',
                    clearProps: 'all',
                    scrollTrigger: {
                        trigger: head,
                        start: 'top 92%',
                        toggleActions: 'play none none none'
                    }
                });
            }
        });
    }

    /* ======================================================================
       7. HERO CINEMATOGRÁFICO (00:01–00:05 DEL VIDEO)
       ====================================================================== */
    function animarHeroYParallax() {
        const hero = document.getElementById('heroSection');
        if (!hero) return;

        const lineas = hero.querySelectorAll('[data-hero-line]');
        const fades = hero.querySelectorAll('[data-hero-fade]');
        const floatCard = hero.querySelector('[data-hero-card]');
        const bgImg = document.getElementById('wgHeroBgImg');
        const mediaWrap = document.getElementById('wgHeroMedia');
        const heroInner = hero.querySelector('.wg-hero-inner');
        const scrollInd = hero.querySelector('.wg-scroll-indicator');

        hero.classList.add('is-hero-ready');

        // Línea de barrido vivo en la tarjeta flotante
        if (floatCard && !floatCard.querySelector('.wg-hero-card-sweep')) {
            const sweep = document.createElement('span');
            sweep.className = 'wg-hero-card-sweep';
            sweep.setAttribute('aria-hidden', 'true');
            floatCard.appendChild(sweep);
        }

        if (movimientoDesactivado() || !tieneGSAP()) return;

        // 1. Imagen de fondo: Desenfoque a nítido + Zoom Ken Burns suave
        if (bgImg) {
            window.gsap.fromTo(
                bgImg,
                { scale: 1.14, filter: 'blur(5px) brightness(0.85)' },
                {
                    scale: 1.03,
                    filter: 'blur(0px) brightness(1)',
                    duration: 1.6,
                    ease: 'power2.out',
                    clearProps: 'filter',
                    onComplete: function () {
                        window.gsap.to(bgImg, {
                            scale: 1.07,
                            duration: 12,
                            ease: 'sine.inOut',
                            yoyo: true,
                            repeat: -1
                        });
                    }
                }
            );
        }

        // 2. Líneas del titular ascendiendo desde sus máscaras
        if (lineas.length > 0) {
            window.gsap.from(lineas, {
                yPercent: 110,
                opacity: 0,
                duration: 0.85,
                stagger: 0.10,
                ease: 'power3.out',
                clearProps: 'all'
            });
        }

        // 3. Subtítulo y botones de acceso en Hero
        if (fades.length > 0) {
            window.gsap.from(fades, {
                y: 22,
                opacity: 0,
                duration: 0.72,
                delay: 0.22,
                stagger: 0.08,
                ease: 'power3.out',
                clearProps: 'all'
            });
        }

        // 4. Mini-tarjeta flotante
        if (floatCard) {
            window.gsap.from(floatCard, {
                y: 28,
                opacity: 0,
                duration: 0.75,
                delay: 0.32,
                ease: 'power3.out',
                clearProps: 'all'
            });
        }

        if (scrollInd) {
            window.gsap.from(scrollInd, {
                y: 16,
                opacity: 0,
                duration: 0.6,
                delay: 0.5,
                ease: 'power3.out',
                clearProps: 'all'
            });
        }

        // 5. Parallax de fondo + retroceso en profundidad 3D al bajar el scroll
        if (tieneScrollTrigger()) {
            if (mediaWrap) {
                registrarTrigger(window.gsap.to(mediaWrap, {
                    yPercent: 20,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: hero,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true
                    }
                }).scrollTrigger);
            }

            if (heroInner && window.innerWidth > 768) {
                registrarTrigger(window.gsap.to(heroInner, {
                    yPercent: -12,
                    scale: 0.97,
                    opacity: 0.22,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: hero,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 0.45
                    }
                }).scrollTrigger);
            }
        }
    }

    /* ======================================================================
       8. CONTADORES REALES CON REBOTE ELÁSTICO + BLOQUES DE ESTADÍSTICAS
       ====================================================================== */
    function configurarSeccionEstadisticas() {
        const secStats = document.getElementById('homeStatsSection');
        const contadores = document.querySelectorAll('#storeViewRoot [data-counter-target]');
        if (!secStats && contadores.length === 0) return;

        if (movimientoDesactivado() || !tieneScrollTrigger()) {
            contadores.forEach(function (el) {
                el.textContent = el.getAttribute('data-counter-target') || '0';
            });
            return;
        }

        if (secStats) {
            const bloques = Array.from(secStats.querySelectorAll('.wg-stat-block'));
            if (bloques.length > 0) {
                window.gsap.from(bloques, {
                    y: 36,
                    opacity: 0,
                    duration: 0.75,
                    stagger: 0.1,
                    ease: 'power3.out',
                    clearProps: 'all',
                    scrollTrigger: {
                        trigger: secStats,
                        start: 'top 88%',
                        toggleActions: 'play none none none'
                    }
                });
            }
        }

        contadores.forEach(function (el, idx) {
            const meta = Math.max(0, parseInt(el.getAttribute('data-counter-target') || '0', 10) || 0);
            el.textContent = '0';

            const estado = { val: 0 };
            registrarTrigger(window.ScrollTrigger.create({
                trigger: secStats || el,
                start: 'top 88%',
                once: true,
                onEnter: function () {
                    window.gsap.to(estado, {
                        val: meta,
                        duration: 1.4,
                        delay: idx * 0.1,
                        ease: 'expo.out',
                        onUpdate: function () {
                            el.textContent = String(Math.round(estado.val));
                        },
                        onComplete: function () {
                            el.textContent = String(meta);
                            window.gsap.fromTo(
                                el,
                                { scale: 1.08 },
                                { scale: 1, duration: 0.35, ease: 'back.out(2.2)', clearProps: 'transform' }
                            );
                        }
                    });
                }
            }));
        });
    }

    /* ======================================================================
       9. MEMBRESÍAS: ENTRADA 3D ESCALONADA + PARALLAX DE FONDO + TILT SUAVE
       ====================================================================== */
    function configurarSeccionesMembresias(ambito) {
        if (movimientoDesactivado() || !tieneScrollTrigger()) return;
        const root = ambito || document.getElementById('storeViewRoot') || document;
        const grids = root.querySelectorAll('.wg-tiers-grid:not([data-tiers-animated])');

        grids.forEach(function (grid) {
            grid.setAttribute('data-tiers-animated', '1');
            const tarjetas = Array.from(grid.querySelectorAll('.wg-tier-card'));
            if (tarjetas.length === 0) return;

            window.gsap.from(tarjetas, {
                opacity: 0,
                y: 44,
                duration: 0.76,
                stagger: 0.09,
                ease: 'power3.out',
                clearProps: 'opacity,transform',
                scrollTrigger: {
                    trigger: grid,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            });

            // Parallax vertical de la imagen de fondo de cada tarjeta
            const imgs = grid.querySelectorAll('.wg-tier-bg-img');
            if (imgs.length > 0 && window.innerWidth > 768) {
                registrarTrigger(window.gsap.fromTo(
                    imgs,
                    { yPercent: -6 },
                    {
                        yPercent: 6,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: grid,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: true
                        }
                    }
                ).scrollTrigger);
            }
        });
    }

    function vincularTarjetasTiltMembresias(ambito) {
        if (movimientoDesactivado() || !tienePunteroFino()) return;

        const root = ambito || document;
        root.querySelectorAll('[data-tilt-card]:not([data-tilt-bound])').forEach(function (card) {
            card.setAttribute('data-tilt-bound', '1');

            let metaRx = 0;
            let metaRy = 0;
            let actualRx = 0;
            let actualRy = 0;
            let rafId = null;

            const animarTiltSuave = function () {
                actualRx += (metaRx - actualRx) * 0.16;
                actualRy += (metaRy - actualRy) * 0.16;

                card.style.setProperty('--tilt-rx', `${actualRx.toFixed(2)}deg`);
                card.style.setProperty('--tilt-ry', `${actualRy.toFixed(2)}deg`);

                if (Math.abs(metaRx - actualRx) > 0.03 || Math.abs(metaRy - actualRy) > 0.03) {
                    rafId = requestAnimationFrame(animarTiltSuave);
                } else {
                    card.style.setProperty('--tilt-rx', `${metaRx.toFixed(2)}deg`);
                    card.style.setProperty('--tilt-ry', `${metaRy.toFixed(2)}deg`);
                    rafId = null;
                }
            };

            card.addEventListener('mousemove', function (e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const pctX = (x / rect.width) - 0.5;
                const pctY = (y / rect.height) - 0.5;

                card.style.setProperty('--glow-x', `${x.toFixed(1)}px`);
                card.style.setProperty('--glow-y', `${y.toFixed(1)}px`);

                metaRx = -pctY * 7.5;
                metaRy = pctX * 8.5;
                if (!rafId) rafId = requestAnimationFrame(animarTiltSuave);
            });

            card.addEventListener('mouseleave', function () {
                metaRx = 0;
                metaRy = 0;
                if (!rafId) rafId = requestAnimationFrame(animarTiltSuave);
            });
        });
    }

    /* ======================================================================
       10. SCROLLYTELLING: PIN REAL EN ESCRITORIO + CORTINA CONTINUA CLIP-PATH
       ====================================================================== */
    function activarPasoScrollyFallback(indice) {
        const pasos = document.querySelectorAll('#wgScrollyLayout [data-scrolly-step]');
        const frames = document.querySelectorAll('#wgScrollyStage [data-scrolly-frame]');
        if (pasos.length === 0 || frames.length === 0) return;

        pasoScrollyActual = indice;
        pasos.forEach(function (paso, idx) {
            const esActivo = idx === indice;
            paso.classList.toggle('is-active', esActivo);
            paso.style.setProperty('--step-progress', idx <= indice ? '1' : '0');
        });

        frames.forEach(function (frame, idx) {
            frame.style.clipPath = '';
            frame.classList.toggle('is-active', idx <= indice);
            frame.classList.toggle('is-top', idx === indice);
        });
    }

    function aplicarProgresoContinuoScrolly(progreso) {
        const pasos = document.querySelectorAll('#wgScrollyLayout [data-scrolly-step]');
        const frames = document.querySelectorAll('#wgScrollyStage [data-scrolly-frame]');
        if (pasos.length < 3 || frames.length < 3) return;

        const p = Math.max(0, Math.min(1, progreso));
        const clamp01 = function (v) { return Math.max(0, Math.min(1, v)); };

        const t1 = clamp01((p - 0.06) / 0.40);
        const t2 = clamp01((p - 0.52) / 0.40);

        frames[0].style.clipPath = 'inset(0% 0% 0% 0%)';
        frames[1].style.clipPath = `inset(${((1 - t1) * 100).toFixed(2)}% 0% 0% 0%)`;
        frames[2].style.clipPath = `inset(${((1 - t2) * 100).toFixed(2)}% 0% 0% 0%)`;

        const img0 = frames[0].querySelector('img');
        const img1 = frames[1].querySelector('img');
        const img2 = frames[2].querySelector('img');
        if (img0) img0.style.transform = `scale(${(1 + t1 * 0.05).toFixed(4)})`;
        if (img1) img1.style.transform = `scale(${(1.12 - t1 * 0.12 + t2 * 0.05).toFixed(4)})`;
        if (img2) img2.style.transform = `scale(${(1.12 - t2 * 0.12).toFixed(4)})`;

        const idxActivo = p < 0.36 ? 0 : (p < 0.72 ? 1 : 2);
        pasoScrollyActual = idxActivo;

        const progPasos = [
            clamp01(0.24 + (p / 0.36) * 0.76),
            clamp01((p - 0.32) / 0.38),
            clamp01((p - 0.68) / 0.32)
        ];

        pasos.forEach(function (paso, idx) {
            paso.classList.toggle('is-active', idx === idxActivo);
            paso.style.setProperty('--step-progress', progPasos[idx].toFixed(3));
        });
    }

    window.activarPasoScrollyManual = function (indice) {
        const idx = Math.max(0, Math.min(2, Number(indice) || 0));

        if (scrollyPinTrigger && window.innerWidth > 980) {
            const objetivos = [0.02, 0.50, 0.96];
            const destinoScroll = scrollyPinTrigger.start
                + (scrollyPinTrigger.end - scrollyPinTrigger.start) * objetivos[idx];

            if (lenisInstance) {
                lenisInstance.scrollTo(destinoScroll, { duration: 0.95 });
            } else {
                window.scrollTo({ top: destinoScroll, behavior: movimientoDesactivado() ? 'auto' : 'smooth' });
            }
            return;
        }

        activarPasoScrollyFallback(idx);
    };

    function configurarScrollytelling() {
        const secScrolly = document.getElementById('homeScrollySection');
        const layout = document.getElementById('wgScrollyLayout');
        const stage = document.getElementById('wgScrollyStage');
        if (!secScrolly || !layout || !stage) return;

        secScrolly.classList.remove('is-gsap-pinned');

        if (movimientoDesactivado() || !tieneScrollTrigger()) {
            activarPasoScrollyFallback(0);
            return;
        }

        const pasos = Array.from(layout.querySelectorAll('[data-scrolly-step]'));
        const floatingWrap = stage.querySelector('.wg-scrolly-floating-stats');

        // En escritorio (> 980px): Pin continuo con scrub estilo video
        if (window.innerWidth > 980) {
            secScrolly.classList.add('is-gsap-pinned');
            aplicarProgresoContinuoScrolly(0);

            scrollyPinTrigger = window.ScrollTrigger.create({
                trigger: layout,
                start: 'top 108px',
                end: '+=140%',
                pin: true,
                pinSpacing: true,
                scrub: 0.5,
                anticipatePin: 1,
                onUpdate: function (self) {
                    aplicarProgresoContinuoScrolly(self.progress);
                    if (floatingWrap) {
                        const offsetMini = (0.5 - self.progress) * 14;
                        floatingWrap.style.transform = `translate3d(0, ${offsetMini.toFixed(2)}px, 0)`;
                    }
                }
            });
            registrarTrigger(scrollyPinTrigger);
        } else {
            activarPasoScrollyFallback(0);
            pasos.forEach(function (paso, idx) {
                registrarTrigger(window.ScrollTrigger.create({
                    trigger: paso,
                    start: 'top 66%',
                    end: 'bottom 44%',
                    onEnter: function () { activarPasoScrollyFallback(idx); },
                    onEnterBack: function () { activarPasoScrollyFallback(idx); }
                }));
            });
        }
    }

    /* ======================================================================
       11. CARRUSEL HORIZONTAL EXPANDIBLE DE CATEGORÍAS (00:19–00:22)
       ====================================================================== */
    window.expandirTarjetaCategoria = function (indice) {
        const carrusel = document.getElementById('wgCatCarousel');
        if (!carrusel) return;
        const tarjetas = carrusel.querySelectorAll('[data-cat-expand]');
        if (tarjetas.length === 0) return;

        const idxSeguro = ((Number(indice) % tarjetas.length) + tarjetas.length) % tarjetas.length;
        const cambioReal = indiceCatExpandida !== idxSeguro;
        indiceCatExpandida = idxSeguro;

        tarjetas.forEach(function (card, i) {
            card.classList.toggle('is-expanded', i === idxSeguro);
        });

        // Floración interna suave al expandir en escritorio
        if (cambioReal && tieneGSAP() && !movimientoDesactivado() && window.innerWidth > 980) {
            const activa = tarjetas[idxSeguro];
            if (!activa) return;

            const img = activa.querySelector('.wg-cat-expand-media img');
            const detalles = activa.querySelectorAll('.wg-cat-expand-desc, .wg-cat-expand-cta');

            if (img) {
                window.gsap.fromTo(
                    img,
                    { scale: 0.92 },
                    { scale: 1.06, duration: 0.44, ease: 'power3.out', overwrite: 'auto' }
                );
            }
            if (detalles.length > 0) {
                window.gsap.fromTo(
                    detalles,
                    { y: 12, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.38,
                        stagger: 0.06,
                        ease: 'power3.out',
                        overwrite: 'auto',
                        clearProps: 'all'
                    }
                );
            }
        }
    };

    window.moverCarruselCategorias = function (delta) {
        const carrusel = document.getElementById('wgCatCarousel');
        if (!carrusel) return;
        const tarjetas = carrusel.querySelectorAll('[data-cat-expand]');
        if (tarjetas.length === 0) return;

        const baseIdx = indiceCatExpandida < 0 ? 0 : indiceCatExpandida;
        const nuevoIdx = ((baseIdx + Number(delta || 1)) % tarjetas.length + tarjetas.length) % tarjetas.length;
        window.expandirTarjetaCategoria(nuevoIdx);

        const tarjetaActiva = tarjetas[nuevoIdx];
        if (tarjetaActiva && carrusel.scrollWidth > carrusel.clientWidth + 8) {
            tarjetaActiva.scrollIntoView({
                behavior: movimientoDesactivado() ? 'auto' : 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }
    };

    window.manejarClickTarjetaCategoria = function (ev, indice, claveCategoria) {
        const carrusel = document.getElementById('wgCatCarousel');
        if (!carrusel) return;
        const tarjeta = carrusel.querySelector(`[data-cat-expand="${indice}"]`);

        if (tarjeta && !tarjeta.classList.contains('is-expanded') && window.innerWidth > 980) {
            if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
            window.expandirTarjetaCategoria(indice);
            return;
        }
        if (typeof window.abrirCategoriaDesdeMenu === 'function') {
            window.abrirCategoriaDesdeMenu(claveCategoria);
        }
    };

    function configurarCarruselCategorias() {
        const carrusel = document.getElementById('wgCatCarousel');
        if (!carrusel) return;
        indiceCatExpandida = 0;

        if (!carrusel.hasAttribute('data-drag-bound')) {
            carrusel.setAttribute('data-drag-bound', '1');
            let arrastrando = false;
            let startX = 0;
            let scrollInicial = 0;

            carrusel.addEventListener('mousedown', function (e) {
                if (carrusel.scrollWidth <= carrusel.clientWidth + 4) return;
                arrastrando = true;
                startX = e.pageX - carrusel.offsetLeft;
                scrollInicial = carrusel.scrollLeft;
                carrusel.classList.add('is-dragging');
            });

            window.addEventListener('mouseup', function () {
                if (!arrastrando) return;
                arrastrando = false;
                carrusel.classList.remove('is-dragging');
            });

            carrusel.addEventListener('mousemove', function (e) {
                if (!arrastrando) return;
                e.preventDefault();
                const x = e.pageX - carrusel.offsetLeft;
                carrusel.scrollLeft = scrollInicial - (x - startX) * 1.4;
            });
        }

        if (movimientoDesactivado() || !tieneScrollTrigger()) return;

        const tarjetas = Array.from(carrusel.querySelectorAll('[data-cat-expand]'));
        if (tarjetas.length === 0) return;

        window.gsap.from(tarjetas, {
            x: 48,
            opacity: 0,
            duration: 0.72,
            stagger: 0.07,
            ease: 'power3.out',
            clearProps: 'all',
            scrollTrigger: {
                trigger: carrusel,
                start: 'top 88%',
                toggleActions: 'play none none none'
            }
        });
    }

    /* ======================================================================
       12. ANIMACIÓN EN GRILLAS DE PRODUCTOS Y DIRECTORIOS
       ====================================================================== */
    function animarTarjetasEnGrillaScroll(gridEl) {
        if (!gridEl || movimientoDesactivado() || !tieneGSAP()) return;

        const items = Array.from(
            gridEl.querySelectorAll('.store-card:not([data-gsap-card]), .wg-dir-card:not([data-gsap-card]), .wg-brand-card:not([data-gsap-card])')
        );
        if (items.length === 0) return;

        items.forEach(function (card) {
            card.setAttribute('data-gsap-card', '1');
        });

        window.gsap.from(items, {
            y: 28,
            opacity: 0,
            duration: 0.56,
            stagger: 0.045,
            ease: 'power3.out',
            clearProps: 'all'
        });
    }

    function configurarComponentesVista(ambito) {
        if (movimientoDesactivado() || !tieneGSAP()) return;
        const root = ambito || document.getElementById('storeViewRoot') || document;

        const selectorGrillas = '#homeFeaturedGrid, #storeCatalogGrid, #storeCategoriesDirectoryGrid, #storeBrandsDirectoryGrid, #storeOffersGrid';
        if (root.matches && root.matches(selectorGrillas)) {
            animarTarjetasEnGrillaScroll(root);
        }
        root.querySelectorAll(selectorGrillas).forEach(animarTarjetasEnGrillaScroll);
    }

    /* ======================================================================
       13. TIMELINE SVG CON BRILLO PROGRESIVO Y PULSO ELÁSTICO (00:16–00:18)
       ====================================================================== */
    function configurarTimelineProgreso() {
        const wrap = document.getElementById('wgTimelineWrap');
        const line = document.getElementById('wgTimelineProgressLine');
        const nodos = wrap ? Array.from(wrap.querySelectorAll('[data-timeline-node]')) : [];
        if (!wrap || !line) return;

        if (movimientoDesactivado() || !tieneScrollTrigger()) {
            line.style.strokeDashoffset = '0';
            nodos.forEach(function (n) { n.classList.add('is-lit'); });
            return;
        }

        line.style.strokeDasharray = '1000';
        line.style.strokeDashoffset = '1000';
        const encendidosPrevios = nodos.map(function (_, i) { return i === 0; });

        registrarTrigger(window.ScrollTrigger.create({
            trigger: wrap,
            start: 'top 78%',
            end: 'bottom 44%',
            scrub: 0.45,
            onUpdate: function (self) {
                const p = self.progress;
                line.style.strokeDashoffset = String((1 - p) * 1000);
                const total = nodos.length || 1;

                nodos.forEach(function (nodo, idx) {
                    const umbral = (idx / Math.max(1, total - 1)) * 0.88;
                    const encendido = p >= umbral;
                    nodo.classList.toggle('is-lit', encendido);

                    if (encendido && !encendidosPrevios[idx]) {
                        const dot = nodo.querySelector('.wg-timeline-dot');
                        if (dot) {
                            window.gsap.fromTo(
                                dot,
                                { scale: 1.25 },
                                { scale: 1.06, duration: 0.4, ease: 'back.out(2.4)', overwrite: 'auto' }
                            );
                        }
                    }
                    encendidosPrevios[idx] = encendido;
                });
            }
        }));
    }

    /* ======================================================================
       14. FOOTER MONUMENTAL CON REVELADO PARALLAX PROFUNDO
       ====================================================================== */
    function configurarParallaxFooter() {
        const footer = document.getElementById('storeFooter');
        const word = document.getElementById('wgFooterGiantWord');
        if (!footer || movimientoDesactivado() || !tieneScrollTrigger()) {
            return;
        }

        if (word) {
            window.gsap.fromTo(
                word,
                { yPercent: 44, scale: 0.94, opacity: 0.14 },
                {
                    yPercent: 0,
                    scale: 1,
                    opacity: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: footer,
                        start: 'top bottom',
                        end: 'bottom bottom',
                        scrub: 0.6
                    }
                }
            );
        }
    }

    function configurarScrollSpyInicio() {
        if (vistaActivaMotion !== 'inicio') return;
        if (!tieneScrollTrigger()) return;

        const secciones = Array.from(document.querySelectorAll('#storeViewRoot [data-spy-section]'));
        secciones.forEach(function (sec) {
            const claveSpy = sec.getAttribute('data-spy-section');
            const navTarget = document.querySelector(`#storeNavLinks [data-spy-target="${claveSpy}"]`);
            if (!navTarget) return;

            registrarTrigger(window.ScrollTrigger.create({
                trigger: sec,
                start: 'top 46%',
                end: 'bottom 46%',
                onEnter: function () {
                    if (vistaActivaMotion === 'inicio') moverPildoraNavbarAElemento(navTarget, false);
                },
                onEnterBack: function () {
                    if (vistaActivaMotion === 'inicio') moverPildoraNavbarAElemento(navTarget, false);
                }
            }));
        });
    }

    /* ======================================================================
       15. BOTONES MAGNÉTICOS + VUELO PARABÓLICO AL CARRITO (FLY-TO-CART)
       ====================================================================== */
    function vincularBotonesMagneticos(ambito) {
        if (movimientoDesactivado() || !tienePunteroFino() || !tieneGSAP()) return;

        const root = ambito || document;
        root.querySelectorAll('[data-magnetic]:not([data-magnetic-bound])').forEach(function (btn) {
            btn.setAttribute('data-magnetic-bound', '1');

            const xTo = window.gsap.quickTo(btn, 'x', { duration: 0.34, ease: 'power3.out' });
            const yTo = window.gsap.quickTo(btn, 'y', { duration: 0.34, ease: 'power3.out' });

            btn.addEventListener('mousemove', function (e) {
                const rect = btn.getBoundingClientRect();
                const relX = e.clientX - (rect.left + rect.width / 2);
                const relY = e.clientY - (rect.top + rect.height / 2);
                xTo(relX * 0.22);
                yTo(relY * 0.26);
            });

            btn.addEventListener('mouseleave', function () {
                xTo(0);
                yTo(0);
            });
        });
    }

    function animarVueloAlCarrito(triggerEl, imagenUrl) {
        const cartBtn = document.getElementById('storeCartTriggerBtn');

        // Micro-animación de confirmación en el botón
        if (triggerEl && triggerEl.classList && triggerEl.classList.contains('store-add-btn') && !triggerEl.disabled) {
            if (!triggerEl._wgTimerCheck) {
                const htmlOriginal = triggerEl.getAttribute('data-orig-html') || triggerEl.innerHTML;
                triggerEl.setAttribute('data-orig-html', htmlOriginal);
                triggerEl.classList.add('is-added');
                triggerEl.innerHTML = `<i class="fas fa-check" aria-hidden="true"></i><span>Agregado</span>`;
                triggerEl._wgTimerCheck = setTimeout(function () {
                    triggerEl.classList.remove('is-added');
                    triggerEl.innerHTML = triggerEl.getAttribute('data-orig-html') || htmlOriginal;
                    triggerEl._wgTimerCheck = null;
                }, 1150);
            }
        }

        if (movimientoDesactivado() || !tieneGSAP() || !cartBtn || !triggerEl) {
            window.WGMotion.bounceCartBadge();
            return;
        }

        const header = document.getElementById('storeHeader');
        if (header) header.classList.remove('is-hidden');

        const tarjeta = triggerEl.closest('.store-card, .store-modal-card');
        const imgOrigen = tarjeta ? tarjeta.querySelector('img') : null;
        const origenRect = (imgOrigen || triggerEl).getBoundingClientRect();
        const destinoRect = cartBtn.getBoundingClientRect();

        if (destinoRect.width === 0 || origenRect.width === 0) {
            window.WGMotion.bounceCartBadge();
            return;
        }

        const clon = document.createElement('div');
        clon.className = 'wg-flying-product';
        const srcSeguro = imagenUrl || (imgOrigen ? imgOrigen.src : '/static/image/productos/real_whey_gold.webp');
        clon.innerHTML = `<img src="${srcSeguro}" alt="">`;
        document.body.appendChild(clon);

        const startX = origenRect.left + origenRect.width / 2 - 28;
        const startY = origenRect.top + origenRect.height / 2 - 28;
        const endX = destinoRect.left + destinoRect.width / 2 - 14;
        const endY = destinoRect.top + destinoRect.height / 2 - 14;

        window.gsap.set(clon, {
            x: startX,
            y: startY,
            scale: 1,
            opacity: 1
        });

        const tl = window.gsap.timeline({
            onComplete: function () {
                clon.remove();
                window.WGMotion.bounceCartBadge();
            }
        });

        tl.to(clon, {
            x: endX,
            scale: 0.34,
            rotation: 12,
            duration: 0.68,
            ease: 'power2.inOut'
        }, 0);

        tl.to(clon, {
            y: Math.min(startY, endY) - 68,
            duration: 0.28,
            ease: 'power2.out'
        }, 0);

        tl.to(clon, {
            y: endY,
            opacity: 0.25,
            duration: 0.40,
            ease: 'power2.in'
        }, 0.28);
    }

    /* ======================================================================
       16. ACCIONES GLOBALES DE SCROLL, BUSCADOR Y MENÚ MÓVIL
       ====================================================================== */
    window.desplazarASiguienteSeccion = function () {
        const destino = document.getElementById('homeStatsSection') || document.getElementById('homeMembresiasSection');
        if (!destino) return;
        if (lenisInstance) {
            lenisInstance.scrollTo(destino, { offset: -64, duration: 1.08 });
        } else {
            destino.scrollIntoView({ behavior: movimientoDesactivado() ? 'auto' : 'smooth' });
        }
    };

    window.volverArribaTienda = function () {
        window.WGMotion.scrollToTop(false);
    };

    window.cerrarBuscadorHeader = function () {
        const strip = document.getElementById('searchStrip');
        if (!strip) return;
        strip.classList.remove('is-open');
        strip.setAttribute('aria-hidden', 'true');
    };

    window.abrirBuscadorHeader = function () {
        const strip = document.getElementById('searchStrip');
        const input = document.getElementById('storeSearchInput');
        const header = document.getElementById('storeHeader');
        if (header) header.classList.remove('is-hidden');
        if (strip) {
            strip.classList.add('is-open');
            strip.setAttribute('aria-hidden', 'false');
        }
        if (input) {
            setTimeout(function () { input.focus(); }, 40);
        }
    };

    window.alternarMenuMovilTienda = function () {
        const drawer = document.getElementById('storeMobileNavDrawer');
        const backdrop = document.getElementById('storeMobileNavBackdrop');
        const btn = document.getElementById('storeMobileMenuBtn');
        if (!drawer) return;
        const abrir = !drawer.classList.contains('open');
        drawer.classList.toggle('open', abrir);
        backdrop?.classList.toggle('open', abrir);
        btn?.classList.toggle('is-active', abrir);
        btn?.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    };

    window.cerrarMenuMovilTienda = function () {
        document.getElementById('storeMobileNavDrawer')?.classList.remove('open');
        document.getElementById('storeMobileNavBackdrop')?.classList.remove('open');
        const btn = document.getElementById('storeMobileMenuBtn');
        btn?.classList.remove('is-active');
        btn?.setAttribute('aria-expanded', 'false');
    };

    /* ======================================================================
       17. API PÚBLICA PARA INTEGRACIÓN CON tienda.js
       ====================================================================== */
    window.WGMotion = {
        onViewMounted: function (vista) {
            registrarPluginsGSAP();
            vistaActivaMotion = vista || 'inicio';
            indiceCatExpandida = 0;
            pasoScrollyActual = 0;
            limpiarTriggersDeVista();

            const root = document.getElementById('storeViewRoot') || document;
            vincularBotonesMagneticos(document);
            vincularTarjetasTiltMembresias(root);
            sincronizarPildoraNavbar(false);

            if (vistaActivaMotion === 'inicio') {
                animarHeroYParallax();
                configurarTitularesSecciones(root);
                configurarSeccionEstadisticas();
                configurarSeccionesMembresias(root);
                configurarScrollytelling();
                configurarCarruselCategorias();
                configurarComponentesVista(root);
                configurarTimelineProgreso();
            } else {
                configurarTitularesSecciones(root);
                configurarSeccionesMembresias(root);
                configurarComponentesVista(root);

                if (vistaActivaMotion === 'productos') {
                    requestAnimationFrame(function () {
                        sincronizarPildorasSidebar(true);
                    });
                }
            }

            requestAnimationFrame(function () {
                configurarScrollSpyInicio();
                if (tieneScrollTrigger()) {
                    window.ScrollTrigger.refresh();
                }
                actualizarProgresoYNavbar();
            });
        },

        refreshDynamicElements: function (contenedor) {
            if (!contenedor || movimientoDesactivado() || !tieneGSAP()) return;
            vincularBotonesMagneticos(contenedor);
            vincularTarjetasTiltMembresias(contenedor);
            configurarTitularesSecciones(contenedor);
            configurarComponentesVista(contenedor);
            if (tieneScrollTrigger()) {
                window.ScrollTrigger.refresh();
            }
        },

        syncNavPill: function (inmediato) {
            sincronizarPildoraNavbar(Boolean(inmediato));
        },

        syncSidebarPills: function (inmediato) {
            sincronizarPildorasSidebar(Boolean(inmediato));
        },

        animateGridItems: function (gridEl) {
            if (!gridEl || movimientoDesactivado() || !tieneGSAP()) return;
            const items = Array.from(gridEl.querySelectorAll('.store-card, .wg-dir-card, .wg-brand-card'));
            if (items.length === 0) return;

            window.gsap.from(items, {
                opacity: 0,
                y: 20,
                duration: 0.44,
                stagger: 0.035,
                ease: 'power3.out',
                clearProps: 'all'
            });
        },

        flyToCart: function (triggerEl, imagenUrl) {
            animarVueloAlCarrito(triggerEl, imagenUrl);
        },

        scrollToTop: function (inmediato) {
            if (lenisInstance) {
                lenisInstance.scrollTo(0, { immediate: Boolean(inmediato) });
            } else {
                window.scrollTo({
                    top: 0,
                    behavior: inmediato || movimientoDesactivado() ? 'auto' : 'smooth'
                });
            }
        },

        bounceCartBadge: function () {
            const btn = document.getElementById('storeCartTriggerBtn');
            const badge = document.getElementById('storeCartBadge');
            if (!tieneGSAP() || movimientoDesactivado()) return;
            if (btn) {
                window.gsap.fromTo(btn, { scale: 0.84 }, { scale: 1, duration: 0.46, ease: 'back.out(2.6)' });
            }
            if (badge) {
                window.gsap.fromTo(badge, { scale: 1.52 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' });
            }
        }
    };

    /* ======================================================================
       18. ARRANQUE INMEDIATO (SIN PANTALLA DE CARGA BLOQUEANTE)
       ====================================================================== */
    document.addEventListener('DOMContentLoaded', function () {
        registrarPluginsGSAP();
        inicializarLenis();
        vincularBotonesMagneticos(document);
        configurarParallaxFooter();
        actualizarProgresoYNavbar();
        sincronizarPildoraNavbar(true);

        window.addEventListener('scroll', actualizarProgresoYNavbar, { passive: true });

        let ultimoAnchoVentana = window.innerWidth;
        window.addEventListener('resize', function () {
            sincronizarPildoraNavbar(true);
            sincronizarPildorasSidebar(true);
            actualizarProgresoYNavbar();

            const anchoActual = window.innerWidth;
            const cruzoBreakpointScrolly = (ultimoAnchoVentana > 980 && anchoActual <= 980)
                || (ultimoAnchoVentana <= 980 && anchoActual > 980);
            ultimoAnchoVentana = anchoActual;

            if (cruzoBreakpointScrolly && vistaActivaMotion === 'inicio') {
                window.WGMotion.onViewMounted('inicio');
            } else if (tieneScrollTrigger()) {
                window.ScrollTrigger.refresh();
            }
        }, { passive: true });

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () {
                sincronizarPildoraNavbar(true);
                sincronizarPildorasSidebar(true);
                if (tieneScrollTrigger()) {
                    window.ScrollTrigger.refresh();
                }
            });
        }
    });
})();
