# KC · Inmobiliaria & Vehículos 🏠🚗
> Sitio web dinámico de alta gama desarrollado para **Ventas y Cambalaches KC**.

Este proyecto es una plataforma web premium optimizada para la visualización y filtrado en tiempo real de propiedades (casas, lotes, apartamentos) y vehículos, diseñada bajo estándares de UX de lujo y arquitectura desacoplada.

---

## 🚀 Características Principales

* **Core Arquitectónico Asíncrono:** Conexión directa y en vivo con la API de Google Sheets en formato CSV, eliminando la necesidad de una base de datos tradicional costosa o un panel de administración complejo.
* **Parseador Ultra-Robusto Custom:** Algoritmo optimizado carácter por carácter capaz de procesar textos largos y saltos de línea internos (`\n`) dentro de las celdas de descripción de la hoja de cálculo sin romper el flujo de datos.
* **Segmentación Inteligente de Entornos:** Aislamiento lógico basado en el enrutamiento de la URL (`window.location.pathname`). Separa de forma automatizada el catálogo inmobiliario en `index.html` y el inventario automotriz en `vehiculos.html` compartiendo una única fuente de verdad.
* **Optimización de Contenido Multi-Asesor:** Sistema de integración que salta las restricciones de visualización de Google Drive convirtiendo los enlaces a miniaturas de alta definición (`sz=w2000`) y conectando cada tarjeta a flujos de conversión de WhatsApp dinámicos.
* **UX Premium:** Buscador predictivo reactivo en memoria, menús móviles fluidos controlados por estados de CSS/JS (libres de atributos en línea obsoletos) y sistema Lightbox multimedia integrado.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** HTML5 Semántico, CSS3 Personalizado (Paleta de contraste de lujo, Layouts modernos y transiciones suaves).
* **Ecosistema JavaScript:** Vanilla JS (ES6+), Programación Asíncrona (`Fetch API`, `Async/Await`), Manipulación avanzada del DOM.
* **Integraciones:** API de Google Sheets, EmailJS para procesamiento de formularios web, Font Awesome 6.5.1 CDN.
* **Control de Versiones:** Git & GitHub (Desplegado en GitHub Pages).

---

## 🎨 Identidad Visual

* **Colores Principales:** Azul Marino Oscuro (`#0d1b2a`) y Dorado Champagne (`#d4af37`) para transmitir exclusividad y confianza jurídica.
* **Tipografías:** *Cormorant Garamond* (Estilo editorial/ Serif italiano) para títulos y *Jost* (Geométrica/Limpia) para cuerpos de texto y buscadores.

---

## 📊 Estructura de la Base de Datos (Google Sheets)

Para que el sistema indexe correctamente los datos, la hoja de cálculo mantiene la siguiente estructura de cabeceras en la Fila 1:

`id` | `tipo` | `operacion` | `nombre` | `ubicacion` | `etiqueta` | `imagen` | `precio` | `metros` | `habitaciones` | `banos`

* *Nota de Tipo:* Las propiedades de finca raíz utilizan los valores `casa`, `apto` o `lote`, mientras que el inventario automotriz utiliza estrictamente el valor `vehiculo`.

---

## 👨‍💻 Desarrollador
* **Diseño y Arquitectura de Software:** Jhonnier Zambrano (2026).