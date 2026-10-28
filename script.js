document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Observer para revelar elementos al hacer scroll
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // 2. Movimiento del brillo de fondo interactivo
    const glowOrb = document.querySelector('.glow-orb');
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        glowOrb.style.transform = `translate(calc(-50% + ${(x - centerX) / 15}px), calc(-50% + ${(y - centerY) / 15}px))`;
    });

    // 3. Efecto 3D interactivo en las tarjetas de servicio
    const cards = document.querySelectorAll('.tilt-effect');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Posición X dentro de la tarjeta
            const y = e.clientY - rect.top;  // Posición Y dentro de la tarjeta
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculamos la rotación (mientras más lejos del centro, más rota)
            const rotateX = ((y - centerY) / centerY) * -10; // Máximo 10 grados
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        // Restaurar posición original al salir el ratón
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease';
        });

        // Quitar la transición de restaurado rápido para que el movimiento sea instantáneo al mover el ratón
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });
});

// 4. Lógica de Consulta de Órdenes
    const btnConsultar = document.getElementById('btn-consultar');
    const inputOrden = document.getElementById('numero-orden');
    const resultadoDiv = document.getElementById('resultado-orden');
    const errorDiv = document.getElementById('error-mensaje');
    
    // REEMPLAZA POR TU URL DE GOOGLE APPS SCRIPT
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbySuFyVQV2s_LDYQAknsepPxOc_PYcfRGaxfir740NtIZ3bg7DL4AIh9An6Z1lbf2lE/exec';

    // --- NUEVO: ESCUCHAR LA TECLA ENTER ---
    if (inputOrden) {
        inputOrden.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Evita que la página intente recargarse
                btnConsultar.click();   // Simula un clic en el botón
            }
        });
    }
    // --------------------------------------

    if (btnConsultar) {
        btnConsultar.addEventListener('click', async () => {
            const numeroOrden = inputOrden.value.trim();
            
            // Ocultar paneles al iniciar
            resultadoDiv.style.display = 'none';
            if(errorDiv) errorDiv.style.display = 'none';

            if (!numeroOrden) {
                if(errorDiv) {
                    errorDiv.innerText = "Por favor ingresa un número de orden válido.";
                    errorDiv.style.display = 'block';
                }
                return;
            }

            // Efecto de carga
            const textoOriginal = btnConsultar.innerText;
            btnConsultar.innerText = "Consultando base de datos...";
            btnConsultar.disabled = true;

            try {
                // Llamada a Google Sheets
                const response = await fetch(`${SCRIPT_URL}?orden=${encodeURIComponent(numeroOrden)}`);
                const data = await response.json();

                if (data.encontrado) {
                    
                    // 1. Determinar el color correcto para el estado
                    const estadoMin = String(data.estado).toLowerCase().trim();
                    let claseColor = 'estado-azul'; // Color por defecto
                    
                    if (estadoMin === 'por revisar') {
                        claseColor = 'estado-amarillo';
                    } else if (estadoMin === 'por entregar') {
                        claseColor = 'estado-verde';
                    }

                    // 2. INYECTAR EL HTML DIRECTAMENTE (Esto evita que salga vacío)
                    resultadoDiv.innerHTML = `
                        <div class="resultado-header">
                            <h3>Orden: <span class="highlight">${data.orden}</span></h3>
                        </div>
                        <div class="resultado-body">
                            <p><strong>Cliente:</strong> <span>${data.cliente}</span></p>
                            <p><strong>Estado:</strong> <span class="estado-badge ${claseColor}">${data.estado}</span></p>
                            <p><strong>Diagnóstico:</strong> <span>${data.diagnostico}</span></p>
                        </div>
                    `;
                    
                    // 3. Mostrar el recuadro ya lleno
                    resultadoDiv.style.display = 'block';
                    
                } else {
                    if(errorDiv) {
                        errorDiv.innerText = "No se encontró la orden: " + numeroOrden + ". Verifica e intenta de nuevo.";
                        errorDiv.style.display = 'block';
                    }
                }
            } catch (error) {
                if(errorDiv) {
                    errorDiv.innerText = "Error de conexión. Intente más tarde.";
                    errorDiv.style.display = 'block';
                }
                console.error(error);
            } finally {
                btnConsultar.innerText = textoOriginal;
                btnConsultar.disabled = false;
            }
        });
    }
