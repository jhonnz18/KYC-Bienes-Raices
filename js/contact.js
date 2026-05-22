// 1. Inicialización con tu Public Key confirmada
(function() {
    emailjs.init("ZRuh7Q31bINQACQ1B"); 
})();

// 2. Función Global para cerrar el modal de éxito
function closeModal() {
    const modal = document.getElementById('custom-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 3. Lógica única del Formulario de Contacto
const contactForm = document.getElementById('form-agendar');

if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        // Bloqueo total de recarga y propagación
        event.preventDefault(); 
        event.stopPropagation();

        const btn = document.getElementById('btn-enviar');
        const originalText = btn.innerText;

        // Feedback visual de carga
        btn.innerText = 'Enviando...';
        btn.disabled = true;

        // Parámetros confirmados
        const serviceID = 'service_pgouv7g'; 
        const templateID = 'template_sczu6vr'; 

        emailjs.sendForm(serviceID, templateID, this)
            .then(() => {
                // ÉXITO: Activamos el modal con estética Navy/Gold
                const modal = document.getElementById('custom-modal');
                if (modal) {
                    modal.style.display = 'flex';
                }

                // Restauramos el estado del formulario
                btn.innerText = originalText;
                btn.disabled = false;
                contactForm.reset();
            })
            .catch((err) => {
                // MANEJO DE ERROR
                btn.innerText = 'Error al enviar';
                btn.disabled = false;
                console.error("EmailJS Error:", err);
                
                setTimeout(() => {
                    btn.innerText = originalText;
                }, 3000);
            });
    });
}