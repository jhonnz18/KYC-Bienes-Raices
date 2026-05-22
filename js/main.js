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
    if (!track) return;
    
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    
    current = (idx + slides.length) % slides.length;
    
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    
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
   INTEGRACIÓN DINÁMICA CON GOOGLE SHEETS & PARSEADOR ROBUSTO
   ========================================================================== */
// Cuando tengas el enlace de Google Sheets, lo pegas aquí. Mientras esté vacío, usará el simulador local.
const URL_PROPIEDADES_CSV = ""; 

// DATOS DE PRUEBA LOCALES (Simulan exactamente el comportamiento del Excel)
const CSV_DE_PRUEBA = `id,tipo,operacion,nombre,ubicacion,etiqueta,imagen,link_wa
1,casa,venta,Casa Campestre Sol del Llano,"Puerto López, Meta",Oportunidad Única,img/propiedades/Propiedad 2_1.jpeg,Hola KC Bienes Raíces me interesa la Casa Campestre
2,lote,venta,Lote de Alta Valorización,"Villavicencio, Meta",Inversión Premium,img/propiedades/lote_venta.webp,Hola KC Bienes Raíces me interesa el Lote de Terreno`;

async function cargarInventarioDesdeSheets() {
    try {
        // CONTROL DE CONTINGENCIA: Si no hay URL configurada, procesa el Mock local de inmediato
        if (!URL_PROPIEDADES_CSV || URL_PROPIEDADES_CSV === "TU_URL_DE_GOOGLE_SHEETS_AQUÍ") {
            console.log("⚠️ Modo Desarrollo: Cargando inventario desde Mock local...");
            const propiedades = parsearCSV(CSV_DE_PRUEBA);
            renderizarTarjetas(propiedades);
            return;
        }

        // Flujo de producción cuando configures la URL real
        const respuesta = await fetch(URL_PROPIEDADES_CSV);
        if (!respuesta.ok) throw new Error("No se pudo conectar con la fuente de datos");
        
        const dataCSV = await respuesta.text();
        const propiedades = parsearCSV(dataCSV);
        renderizarTarjetas(propiedades);
    } catch (error) {
        console.error("Error cargando los datos desde Google Sheets:", error);
    }
}

/* EL PARSEADOR ROBUSTO CON REGEX (Senior-grade) */
function parsearCSV(texto) {
    const lineas = texto.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (lineas.length === 0) return [];

    const encabezados = lineas[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
    const resultado = [];

    for (let i = 1; i < lineas.length; i++) {
        const linea = lineas[i];
        const campos = [];
        let coincidencia;
        const regex = /"([^"]*)"|([^,]+)/g;
        
        while ((coincidencia = regex.exec(linea)) !== null) {
            campos.push((coincidencia[1] !== undefined ? coincidencia[1] : coincidencia[2]).trim());
        }

        if (campos.length < encabezados.length) continue;

        const objeto = {};
        encabezados.forEach((encabezado, index) => {
            objeto[encabezado] = campos[index] || "";
        });
        
        resultado.push(objeto);
    }
    return resultado;
}

function renderizarTarjetas(listaPropiedades) {
    const contenedorGrid = document.querySelector(".properties-grid");
    if (!contenedorGrid) return;

    contenedorGrid.innerHTML = ""; 

    listaPropiedades.forEach(prop => {
        // Separamos las rutas de las imágenes usando el pipe '|'.
        // Si no hay pipe (como en tu mock actual), fotosArray tendrá un solo elemento.
        const fotosArray = prop.imagen.split("|").map(url => url.trim());
        const fotoPortada = fotosArray[0]; // La primera es la portada exterior
        
        // Unificamos el arreglo en un string plano separado por comas para pasarlo al Modal
        const todasLasFotosString = fotosArray.join(",");

        const tarjetaHTML = `
            <div class="prop-card ${prop.tipo} ${prop.operacion}"> 
                <div class="img-container" style="cursor: pointer;" onclick="abrirGaleria('${todasLasFotosString}')">
                    <img src="${fotoPortada}" alt="${prop.nombre}" class="prop-card-img" loading="lazy">
                    <span class="photo-counter-tag">📷 Ver fotos (${fotosArray.length})</span>
                </div>
                <div class="prop-info">
                    <span class="prop-tag">${prop.etiqueta}</span>
                    <h3 class="prop-name">${prop.nombre}</h3>
                    <p class="prop-location">${prop.ubicacion}</p>
                    <a href="https://wa.me/573138341671?text=${encodeURIComponent(prop.link_wa)}" target="_blank" class="btn-primary" style="display: inline-block; margin-top: 10px; text-decoration: none;">Ver Detalles</a>
                </div>
            </div>
        `;
        contenedorGrid.insertAdjacentHTML("beforeend", tarjetaHTML);
    });
    console.log(`¡Éxito! Se renderizaron ${listaPropiedades.length} propiedades con soporte multimedia.`);
}

/* ==========================================================================
   INICIALIZACIÓN GLOBAL (DOM Content Loaded)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar carrusel si aplica
    if (track) {
        goTo(0);
        startAuto();
    }
    
    // Inicializar carga dinámica de propiedades desde Google Sheets
    if (document.querySelector(".properties-grid")) {
        cargarInventarioDesdeSheets();
    }
});


/* MENÚ HAMBURGUESA Y MÓVIL */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.style.display === 'flex';
        if (isOpen) {
            mobileMenu.style.opacity = '0';
            setTimeout(() => { mobileMenu.style.display = 'none'; }, 350);
            hamburger.classList.remove('open');
        } else {
            mobileMenu.style.display = 'flex';
            requestAnimationFrame(() => { mobileMenu.style.opacity = '1'; });
            hamburger.classList.add('open');
        }
    });

    document.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.style.opacity = '0';
            hamburger.classList.remove('open');
            setTimeout(() => { mobileMenu.style.display = 'none'; }, 350);
        });
    });
}


/*SISTEMA DE BÚSQUEDA Y FILTRADO (REACTIVO Y COMPATIBLE) */
function ejecutarBusqueda() {
    const tipo = document.getElementById('search-tipo').value;
    const operacion = document.getElementById('search-operacion').value;
    const textoInput = document.getElementById('search-text').value.toLowerCase();
    
    console.log("--- INICIANDO FILTRADO ---");

    const tarjetas = document.querySelectorAll('.prop-card');
    let encontrados = 0;

    tarjetas.forEach((tarjeta) => {
        const contenidoVisible = tarjeta.innerText.toLowerCase();
        
        const coincideTipo = (tipo === "todos" || tarjeta.classList.contains(tipo));
        const coincideOperacion = (operacion === "todos" || tarjeta.classList.contains(operacion));
        const coincideTexto = (textoInput === "" || contenidoVisible.includes(textoInput));

        if (coincideTipo && coincideOperacion && coincideTexto) {
            tarjeta.style.setProperty('display', 'block', 'important');
            tarjeta.style.opacity = "1";
            encontrados++;
        } else {
            tarjeta.style.setProperty('display', 'none', 'important');
            tarjeta.style.opacity = "0";
        }
    });
    
    // Control de mensaje de "No resultados"
    const mensajeNoResultados = document.getElementById('no-results');
    if (mensajeNoResultados) {
        mensajeNoResultados.style.display = (encontrados === 0) ? "block" : "none";
    }
    console.log("--- FILTRADO FINALIZADO ---");
}

function limpiarFiltros() {
    if (document.getElementById('search-text')) document.getElementById('search-text').value = "";
    if (document.getElementById('search-tipo')) document.getElementById('search-tipo').value = "todos";
    if (document.getElementById('search-operacion')) document.getElementById('search-operacion').value = "todos";
    if (document.getElementById('search-precio')) document.getElementById('search-precio').value = "todos";

    const mensajeNoResultados = document.getElementById('no-results');
    if (mensajeNoResultados) mensajeNoResultados.style.display = "none";

    const tarjetas = document.querySelectorAll('.prop-card');
    tarjetas.forEach(tarjeta => {
        tarjeta.style.setProperty('display', 'block', 'important');
        tarjeta.style.opacity = "1";
    });
    
    console.log("Filtros reiniciados exitosamente.");
}

function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu.classList.contains('active')) {
        menu.classList.remove('active');
    } else {
        menu.classList.add('active');
    }
}


/* MENÚ ASESORES WHATSAPP */
function toggleWhatsAppMenu() {
    const waMenu = document.getElementById('waMenu');
    if (waMenu) {
        waMenu.classList.toggle('active');
    }
}

document.addEventListener('click', function(event) {
    const container = document.querySelector('.whatsapp-container');
    const waMenu = document.getElementById('waMenu');
    
    if (container && !container.contains(event.target)) {
        if (waMenu && waMenu.classList.contains('active')) {
            waMenu.classList.remove('active');
        }
    }
});

/* ==========================================================================
   SISTEMA DE GALERÍA FLOTANTE (LIGHTBOX MULTIMEDIA)
   ========================================================================== */
let fotosModalActuales = [];
let indiceFotoModal = 0;

function abrirGaleria(fotosString) {
    const modal = document.getElementById("galleryModal");
    const trackModal = document.getElementById("modalSliderTrack");
    const btnPrev = document.getElementById("modalPrev");
    const btnNext = document.getElementById("modalNext");
    
    if (!modal || !trackModal) return;

    // Convertimos el string de nuevo a un Array de rutas
    fotosModalActuales = fotosString.split(",");
    indiceFotoModal = 0;
    
    // Inyectamos dinámicamente las imágenes al carrusel flotante
    trackModal.innerHTML = fotosModalActuales.map(url => `
        <img src="${url}" class="modal-slide-img" alt="Vista de la propiedad">
    `).join("");
    
    // Mostramos u ocultamos las flechas según la cantidad de fotos
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
    if (trackModal) {
        // Usamos '%' para el desplazamiento ya que 'vw' traería problemas en el modal
        trackModal.style.transform = `translateX(-${indiceFotoModal * 100}%)`;
    }
}

function cerrarGaleria() {
    const modal = document.getElementById("galleryModal");
    if (modal) modal.style.display = "none";
}

// Cerrar si hacen clic fuera de la imagen (en el fondo oscuro)
window.addEventListener("click", (e) => {
    const modal = document.getElementById("galleryModal");
    if (e.target === modal) cerrarGaleria();
});

// Cerrar con la tecla Esc
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        cerrarGaleria();
    }
});