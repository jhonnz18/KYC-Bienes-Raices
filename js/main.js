/* ==========================================================================
   LÓGICA DEL CARRUSEL PROFESIONAL
   ========================================================================== */
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.carousel-dot');
const track = document.getElementById('track');
const counter = document.getElementById('counter');
const progress = document.getElementById('progress');
let current = 0, timer, progTimer;

function goTo(idx) {
    if (!track || slides.length === 0) return;
    
    slides[current]?.classList.remove('active');
    dots[current]?.classList.remove('active');
    
    current = (idx + slides.length) % slides.length;
    
    slides[current]?.classList.add('active');
    dots[current]?.classList.add('active');
    
    track.style.transform = `translateX(-${current * 100}vw)`;
    
    if (counter) {
        counter.innerHTML = `<span>${String(current + 1).padStart(2, '0')}</span> / 0${slides.length}`;
    }
    
    restartProgress();
}

function restartProgress() {
    if (!progress) return;
    progress.style.transition = 'none';
    progress.style.width = '0%';
    clearTimeout(progTimer);
    progTimer = setTimeout(() => {
        progress.style.transition = 'width 5s linear';
        progress.style.width = '100%';
    }, 50);
}

function startAuto() {
    if (slides.length === 0) return;
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
}

/* EVENT LISTENERS DEL CARRUSEL */
document.getElementById('nextBtn')?.addEventListener('click', () => { goTo(current + 1); startAuto(); });
document.getElementById('prevBtn')?.addEventListener('click', () => { goTo(current - 1); startAuto(); });
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => { goTo(index); startAuto(); });
});


/* ==========================================================================
   INTEGRACIÓN DINÁMICA CON GOOGLE SHEETS & PARSEADOR ULTRA-ROBUSTO
   ========================================================================== */
const URL_PROPIEDADES_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSBOJTt0A76KzoVjE7RXVb1Qyt_ugVa6IsJWkVi2zhP1oPye0CwNb_j-XMGhKGqVT2kYU9OsfIzptzu/pub?output=csv"; 

const CSV_DE_PRUEBA = `id,tipo,operacion,nombre,ubicacion,etiqueta,imagen,precio,metros,habitaciones,banos
1,casa,venta,Casa Campestre Sol del Llano,"Puerto López, Meta",Oportunidad Única,img/propiedades/Propiedad 2_1.jpeg | img/propiedades/Propiedad 2_2.jpeg,350000000,150,3,2
2,lote,venta,Lote de Alta Valorización,"Villavicencio, Meta",Inversión Premium,img/propiedades/lote_venta.webp,180000000,1000,0,0`;

/* EL PARSEADOR PREMIUM TOLERANTE A SALTOS DE LÍNEA INTERNOS (CORREGIDO) */
function parsearCSV(texto) {
    const resultado = [];
    let filaActual = [];
    let celdaActual = "";
    let dentroDeComillas = false;

    for (let i = 0; i < texto.length; i++) {
        const char = texto[i];
        const siguienteChar = texto[i + 1];

        if (char === '"') {
            if (dentroDeComillas && siguienteChar === '"') {
                celdaActual += '"';
                i++; 
            } else {
                dentroDeComillas = !dentroDeComillas;
            }
        } else if (char === ',' && !dentroDeComillas) {
            filaActual.push(celdaActual.trim());
            celdaActual = "";
        } else if ((char === '\r' || char === '\n') && !dentroDeComillas) {
            if (char === '\r' && siguienteChar === '\n') {
                i++; 
            }
            filaActual.push(celdaActual.trim());
            if (filaActual.length > 0 && filaActual.some(c => c !== "")) {
                resultado.push(filaActual);
            }
            filaActual = [];
            celdaActual = "";
        } else {
            celdaActual += char;
        }
    }

    if (celdaActual !== "" || filaActual.length > 0) {
        filaActual.push(celdaActual.trim());
        resultado.push(filaActual);
    }

    if (resultado.length === 0) return [];

    const encabezados = resultado[0].map(h => h.toLowerCase().replace(/^["']|["']$/g, ""));
    const datosFinales = [];

    for (let i = 1; i < resultado.length; i++) {
        const fila = resultado[i];
        if (fila.length < encabezados.length) continue; 

        const objeto = {};
        encabezados.forEach((encabezado, index) => {
            objeto[encabezado] = fila[index] || "";
        });
        datosFinales.push(objeto);
    }

    return datosFinales;
}

// --- FUNCIÓN AUXILIAR: SALTAR BLOQUEO DE DRIVE ---
function optimizarEnlaceDrive(url) {
    if (!url) return 'assets/images/placeholder-kc.jpg'; 
    
    if (url.includes('drive.google.com')) {
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//) || url.match(/id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w2000`;
        }
    }
    return url; 
}

// --- FUNCIÓN PRINCIPAL DE RENDERIZADO HÍBRIDA ---
// --- FUNCIÓN PRINCIPAL DE RENDERIZADO HÍBRIDA (SIN ERRORES DE SINTAXIS) ---
function renderizarTarjetas(listaPropiedades) {
    const contenedorGrid = document.querySelector(".properties-grid");
    if (!contenedorGrid) return;

    contenedorGrid.innerHTML = ""; 

    listaPropiedades.forEach(prop => {
        // Limpiamos los enlaces vacíos para evitar llamadas fantasmas y errores 404
        const enlacesCrudos = prop.imagen ? prop.imagen.split("|") : [];
        const fotosArray = enlacesCrudos
            .map(url => optimizarEnlaceDrive(url.trim()))
            .filter(url => url !== "" && url !== "undefined");
        
        // Declaramos la variable una única vez de forma segura
        const fotoPortada = fotosArray[0] || 'img/favicon.png'; 
        const todasLasFotosString = fotosArray.join(",");

        let precioFormateado = prop.precio;
        if (prop.precio && !isNaN(prop.precio.replace(/[^0-9]/g, ''))) {
            const numeroLimpio = parseInt(prop.precio.replace(/[^0-9]/g, ''), 10);
            precioFormateado = new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
            }).format(numeroLimpio);
        }

        const mensajeWhatsApp = `Hola KC Inmobiliaria, me interesa la propiedad "${prop.nombre || 'Sin nombre'}" (${prop.tipo} en ${prop.operacion}) ubicada en ${prop.ubicacion}. ¿Sigue disponible?`;

        let detallesHTML = "";
        if (prop.tipo && prop.tipo.toLowerCase() === "vehiculo") {
            detallesHTML = `
                <span>${prop.metros ? 'Mod. ' + prop.metros : 'N/A'}</span>
                ${prop.habitaciones && prop.habitaciones !== '0' ? `<span>${prop.habitaciones}</span>` : ''}
                ${prop.banos && prop.banos !== '0' ? `<span>${prop.banos}</span>` : ''}
            `;
        } else {
            detallesHTML = `
                <span>${prop.metros ? prop.metros + ' m²' : 'N/A'}</span>
                ${prop.habitaciones && prop.habitaciones !== '0' ? `<span>${prop.habitaciones} Hab</span>` : ''}
                ${prop.banos && prop.banos !== '0' ? `<span>${prop.banos} Baños</span>` : ''}
            `;
        }

        const tarjetaHTML = `
            <div class="prop-card ${prop.tipo} ${prop.operacion}"> 
                <div class="img-container" style="cursor: pointer;" onclick="abrirGaleria('${todasLasFotosString}')">
                    <img src="${fotoPortada}" alt="${prop.nombre}" class="prop-card-img" loading="lazy">
                    <span class="photo-counter-tag">📷 Ver fotos (${fotosArray.length})</span>
                </div>
                <div class="prop-info">
                    <span class="prop-tag">${prop.etiqueta || 'Destacado'}</span>
                    <h3 class="prop-name">${prop.nombre || 'Propiedad'}</h3>
                    <p class="prop-location">${prop.ubicacion}</p>
                    
                    <div class="prop-details">
                        ${detallesHTML}
                    </div>
                    
                    <div class="prop-price">${precioFormateado}</div>
                    
                    <a href="https://wa.me/573138341671?text=${encodeURIComponent(mensajeWhatsApp)}" target="_blank" class="btn-primary" style="display: inline-block; margin-top: 10px; text-decoration: none;">Ver Detalles</a>
                </div>
            </div>
        `;
        contenedorGrid.insertAdjacentHTML("beforeend", tarjetaHTML);
    });
}


/* ==========================================================================
   SISTEMA DE BÚSQUEDA Y FILTRADO (REACTIVO Y SEGURO)
   ========================================================================== */
// --- SISTEMA DE FILTRADO INTELIGENTE DE ENTORNOS ---
function filtrarPropiedades() {
    const inputBusqueda = document.getElementById("search-input") || document.getElementById("search-text") || document.querySelector(".search-bar input");
    const selectTipo = document.getElementById("filter-tipo") || document.getElementById("search-tipo");
    const selectOperacion = document.getElementById("filter-operacion") || document.getElementById("search-operacion");

    const textoBuscar = inputBusqueda ? inputBusqueda.value.toLowerCase().trim() : "";
    const tipoSeleccionado = selectTipo ? selectTipo.value.toLowerCase().trim() : "todos";
    const operacionSeleccionada = selectOperacion ? selectOperacion.value.toLowerCase().trim() : "todos";

    // Validamos la ventana actual para aplicar segmentación absoluta
    const esPaginaVehiculos = window.location.pathname.includes("vehiculos.html");

    const propiedadesFiltradas = window.inventarioCompleto.filter(prop => {
        const tipoProp = prop.tipo ? prop.tipo.toLowerCase().trim() : "";

        // Regla estricta de aislamiento de catálogo
        if (esPaginaVehiculos) {
            if (tipoProp !== "vehiculo") return false; // Bloquea casas y lotes en la vista de carros
        } else {
            if (tipoProp === "vehiculo") return false; // Bloquea carros en la vista principal de inmuebles
        }

        // Filtros dinámicos tradicionales
        const coincideTexto = !textoBuscar || 
                              (prop.nombre && prop.nombre.toLowerCase().includes(textoBuscar)) || 
                              (prop.ubicacion && prop.ubicacion.toLowerCase().includes(textoBuscar));

        const coincideTipo = tipoSeleccionado === "todos" || tipoProp === tipoSeleccionado;

        const operacionProp = prop.operacion ? prop.operacion.toLowerCase().trim() : "";
        const coincideOperacion = operacionSeleccionada === "todos" || operacionProp === operacionSeleccionada;

        return coincideTexto && coincideTipo && coincideOperacion;
    });

    renderizarTarjetas(propiedadesFiltradas);
    actualizarMensajeVacio(propiedadesFiltradas.length);
}

function actualizarMensajeVacio(cantidad) {
    const contenedorGrid = document.querySelector(".properties-grid");
    let mensaje = document.getElementById("no-results-msg") || document.getElementById("no-results");
    
    if (cantidad === 0) {
        if (!mensaje && contenedorGrid) {
            contenedorGrid.insertAdjacentHTML('afterend', `
                <div id="no-results-msg" style="text-align: center; color: white; padding: 40px; font-family: 'Jost', sans-serif;">
                    <p style="font-size: 18px;">No se encontraron resultados con los filtros seleccionados.</p>
                </div>
            `);
        } else if (mensaje) {
            mensaje.style.display = "block";
        }
    } else {
        if (mensaje) {
            if (mensaje.id === "no-results-msg") mensaje.remove();
            else mensaje.style.display = "none";
        }
    }
}

function inicializarEscuchadoresBuscador() {
    const inputBusqueda = document.getElementById("search-input") || document.getElementById("search-text") || document.querySelector(".search-bar input");
    const selectTipo = document.getElementById("filter-tipo") || document.getElementById("search-tipo");
    const selectOperacion = document.getElementById("filter-operacion") || document.getElementById("search-operacion");

    if (inputBusqueda) inputBusqueda.addEventListener("input", filtrarPropiedades);
    if (selectTipo) selectTipo.addEventListener("change", filtrarPropiedades);
    if (selectOperacion) selectOperacion.addEventListener("change", filtrarPropiedades);
}


/* ==========================================================================
   MENÚ HAMBURGUESA, WHATSAPP FLOATING Y LIGHTBOX
   ========================================================================== */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');

function cerrarMenuMovil() {
    if (!mobileMenu) return;
    mobileMenu.style.opacity = '0';
    hamburger?.classList.remove('open');
    setTimeout(() => { mobileMenu.style.display = 'none'; }, 350);
}

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.style.display === 'flex';
        if (isOpen) {
            cerrarMenuMovil();
        } else {
            mobileMenu.style.display = 'flex';
            requestAnimationFrame(() => { mobileMenu.style.opacity = '1'; });
            hamburger.classList.add('open');
        }
    });

    if (closeMenu) {
        closeMenu.addEventListener('click', cerrarMenuMovil);
    }

    document.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
        link.addEventListener('click', cerrarMenuMovil);
    });
}

// Evento global para cerrar el menú si se hace clic afuera (UX Premium)
window.addEventListener('click', (e) => {
    if (mobileMenu && mobileMenu.style.display === 'flex' && !mobileMenu.contains(e.target) && e.target !== hamburger && !hamburger.contains(e.target)) {
        cerrarMenuMovil();
    }
});

function toggleWhatsAppMenu() {
    const waMenu = document.getElementById('waMenu');
    if (waMenu) waMenu.classList.toggle('active');
}

document.addEventListener('click', function(event) {
    const container = document.querySelector('.whatsapp-container');
    const waMenu = document.getElementById('waMenu');
    if (container && !container.contains(event.target)) {
        if (waMenu?.classList.contains('active')) waMenu.classList.remove('active');
    }
});


/* ==========================================================================
   SISTEMA DE GALERÍA FLOTANTE (LIGHTBOX)
   ========================================================================== */
let fotosModalActuales = [];
let indiceFotoModal = 0;

function abrirGaleria(fotosString) {
    const modal = document.getElementById("galleryModal");
    const trackModal = document.getElementById("modalSliderTrack");
    const btnPrev = document.getElementById("modalPrev");
    const btnNext = document.getElementById("modalNext");
    
    if (!modal || !trackModal || !fotosString) return;

    fotosModalActuales = fotosString.split(",");
    indiceFotoModal = 0;
    
    trackModal.innerHTML = fotosModalActuales.map(url => `
        <img src="${url}" class="modal-slide-img" alt="Vista de la propiedad">
    `).join("");
    
    if (fotosModalActuales.length <= 1) {
        if (btnPrev) btnPrev.style.display = "none";
        if (btnNext) btnNext.style.display = "none";
    } else {
        if (btnPrev) btnPrev.style.display = "block";
        if (btnNext) btnNext.style.display = "block";
    }
    
    modal.style.display = "flex";
    actualizarPosicionModal();
}

function cambiarFotoModal(direccion) {
    if (fotosModalActuales.length <= 1) return;
    indiceFotoModal = (indiceFotoModal + direccion + fotosModalActuales.length) % fotosModalActuales.length;
    actualizarPosicionModal();
}

function actualizarPosicionModal() {
    const trackModal = document.getElementById("modalSliderTrack");
    if (trackModal) trackModal.style.transform = `translateX(-${indiceFotoModal * 100}%)`;
}

function cerrarGaleria() {
    const modal = document.getElementById("galleryModal");
    if (modal) modal.style.display = "none";
}

window.addEventListener("click", (e) => {
    if (e.target === document.getElementById("galleryModal")) cerrarGaleria();
});

document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") cerrarGaleria();
});


/* ==========================================================================
   INICIALIZACIÓN ÚNICA DE LA APLICACIÓN
   ========================================================================== */
async function iniciarAplicacion() {
    let datosCrudos = "";

    if (track && slides.length > 0) {
        goTo(0);
        startAuto();
    }

    if (document.querySelector(".properties-grid")) {
        try {
            const respuesta = await fetch(URL_PROPIEDADES_CSV);
            if (!respuesta.ok) throw new Error("Error en respuesta HTTP");
            datosCrudos = await respuesta.text();
            console.log("¡Conexión exitosa con Google Sheets en vivo!");
        } catch (error) {
            console.warn("Conexión fallida en vivo. Activando datos locales:", error);
            datosCrudos = CSV_DE_PRUEBA; 
        }

        const listaPropiedades = parsearCSV(datosCrudos);
        window.inventarioCompleto = listaPropiedades;

        filtrarPropiedades();
        inicializarEscuchadoresBuscador();
    }
}

document.addEventListener("DOMContentLoaded", iniciarAplicacion);