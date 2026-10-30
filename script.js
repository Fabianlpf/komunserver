document.addEventListener("DOMContentLoaded", () => {
    // --- FUNCIONES DEL MODAL DE IMÁGENES ---
    window.abrirModal = function(src) {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-img');
        if (modal && modalImg) {
            modalImg.src = src;
            modal.style.display = "flex";
        }
    };

    window.cerrarModal = function() {
        const modal = document.getElementById('image-modal');
        if (modal) modal.style.display = "none";
    };

    // Cerrar el modal si el cliente hace clic fuera de la imagen
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('image-modal');
        if (event.target === modal) cerrarModal();
    });
    
    // 1. Observer para revelar elementos al hacer scroll (Animación fade-up)
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
    if (glowOrb) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            glowOrb.style.transform = `translate(calc(-50% + ${(x - centerX) / 15}px), calc(-50% + ${(y - centerY) / 15}px))`;
        });
    }

    // 3. Efecto 3D interactivo en las tarjetas de servicio
    const cards = document.querySelectorAll('.tilt-effect');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;  
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; 
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });

    // =======================================================
    // LA MISMA URL SIRVE PARA ÓRDENES Y CATÁLOGO
    // =======================================================
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxwH7nYKWdX7sXFdxA-K4A74g2-t1xXsdm350NB7iASjM8_1oWgonM3m75ZBWicAZ_d/exec';

    // =======================================================
    // 4. LÓGICA DE ÓRDENES
    // =======================================================
    const btnConsultar = document.getElementById('btn-consultar');
    const inputOrden = document.getElementById('numero-orden');
    const resultadoDiv = document.getElementById('resultado-orden');
    const errorDiv = document.getElementById('error-mensaje');

    if (inputOrden) {
        // Escuchar la tecla Enter
        inputOrden.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                if (btnConsultar) btnConsultar.click();
            }
        });
    }

    if (btnConsultar) {
        btnConsultar.addEventListener('click', async () => {
            const numeroOrden = inputOrden.value.trim();
            
            if (resultadoDiv) resultadoDiv.style.display = 'none';
            if (errorDiv) errorDiv.style.display = 'none';

            if (!numeroOrden) {
                if (errorDiv) {
                    errorDiv.innerText = "Por favor ingresa un número de orden válido.";
                    errorDiv.style.display = 'block';
                }
                return;
            }

            const textoOriginal = btnConsultar.innerText;
            btnConsultar.innerText = "Consultando...";
            btnConsultar.disabled = true;

            try {
                const response = await fetch(`${SCRIPT_URL}?orden=${encodeURIComponent(numeroOrden)}`);
                const data = await response.json();

                if (data.encontrado) {
                    const estadoMin = String(data.estado).toLowerCase().trim();
                    let claseColor = 'estado-azul';
                    
                    if (estadoMin === 'por revisar') claseColor = 'estado-amarillo';
                    else if (estadoMin === 'para entregar') claseColor = 'estado-verde';

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
                    resultadoDiv.style.display = 'block';
                } else {
                    if (errorDiv) {
                        errorDiv.innerText = "No se encontró la orden: " + numeroOrden;
                        errorDiv.style.display = 'block';
                    }
                }
            } catch (error) {
                if (errorDiv) {
                    errorDiv.innerText = "Error de conexión. Intente más tarde.";
                    errorDiv.style.display = 'block';
                }
            } finally {
                btnConsultar.innerText = textoOriginal;
                btnConsultar.disabled = false;
            }
        });
    }

    // =======================================================
    // 5. LÓGICA DE CATÁLOGO DINÁMICO
    // =======================================================
    const catalogoGrid = document.getElementById('catalogo-grid');
    
    if (catalogoGrid) {
        // Función global para mover los carruseles
        window.moverCarrusel = function(idCarrusel, direccion) {
            const track = document.getElementById(idCarrusel);
            const scrollAmount = track.clientWidth; // Se mueve el ancho exacto de una imagen
            track.scrollBy({ left: scrollAmount * direccion, behavior: 'smooth' });
        };

        fetch(`${SCRIPT_URL}?action=catalogo`)
            .then(response => response.json())
            .then(productos => {
                if (productos.length > 0) {
                    catalogoGrid.innerHTML = ''; 
                    
                    // Nota: agregamos 'index' para identificar cada carrusel por separado
                    productos.forEach((prod, index) => {
                        
                        // 1. Crear las imágenes del carrusel
                        let slidesHTML = '';
                        prod.imagenes.forEach(img => {
                            slidesHTML += `<div class="carousel-slide"><img src="${img}" alt="${prod.producto}" style="cursor: pointer;" onclick="abrirModal('${img}')"></div>`;
                        });

                        // 2. Crear botones de navegación solo si hay más de 1 imagen
                        let botonesHTML = '';
                        if (prod.imagenes.length > 1) {
                            botonesHTML = `
                                <button class="carousel-btn prev" onclick="window.moverCarrusel('carrusel-${index}', -1)">&#10094;</button>
                                <button class="carousel-btn next" onclick="window.moverCarrusel('carrusel-${index}', 1)">&#10095;</button>
                            `;
                        }

                        // 3. Ensamblar la tarjeta
                        const cardHTML = `
                            <div class="tech-card tilt-effect">
                                <div class="carousel-container">
                                    <div class="carousel-track" id="carrusel-${index}">
                                        ${slidesHTML}
                                    </div>
                                    ${botonesHTML}
                                </div>
                                <div class="card-content">
                                    <h3 style="color: #fff; font-size:1.3rem; margin-bottom: 0.5rem;">${prod.producto}</h3>
                                    <p style="font-size: 0.95rem; margin-bottom: 1rem; color: var(--text-muted);">${prod.caracteristicas}</p>
                                    <h4 class="highlight" style="font-size: 1.5rem; margin-bottom: 1.5rem;">${prod.precio}</h4>
                                    
                                    <a href="https://wa.me/573103043323?text=Hola%20Komunserver,%20estoy%20interesado%20en%20adquirir:%20${encodeURIComponent(prod.producto)}" 
                                       target="_blank" 
                                       class="btn-primary form-btn" 
                                       style="display:block; text-align:center; padding: 0.8rem; font-size: 0.9rem;">
                                       COMPRAR AHORA
                                    </a>
                                </div>
                            </div>
                        `;
                        catalogoGrid.innerHTML += cardHTML;
                    });
                } else {
                    catalogoGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted);">Sin stock disponible.</p>';
                }
            })
            .catch(error => {
                catalogoGrid.innerHTML = '<p style="text-align:center; width:100%; color: #ef4444;">Error conectando al inventario.</p>';
            });
    }
});

// =======================================================
    // 6. LÓGICA DE LA CALCULADORA DE MANTENIMIENTO
    // =======================================================
    const btnCalcular = document.getElementById('btn-calcular');
    const resultadoCotizacion = document.getElementById('resultado-cotizacion');
    const totalTexto = document.getElementById('total-cotizacion');
    const btnWaCotizacion = document.getElementById('btn-whatsapp-cotizacion');

    if (btnCalcular) {
        btnCalcular.addEventListener('click', () => {
            // 1. Obtener cantidades de servicios base
            const cantSoftware = parseInt(document.getElementById('cant-software').value) || 0;
            const cantFormateo = parseInt(document.getElementById('cant-formateo').value) || 0;
            const cantPreventivo = parseInt(document.getElementById('cant-preventivo').value) || 0;
            
            // 2. Obtener checkboxes de servicios especiales
            const reqServidores = document.getElementById('req-servidores').checked;
            const reqCamaras = document.getElementById('req-camaras').checked;
            const reqRedes = document.getElementById('req-redes').checked;

            // 3. Precios base
            const precioSoftware = 60000;
            const precioFormateo = 90000;
            const precioPreventivo = 60000;

            // 4. Calcular total base
            let total = (cantSoftware * precioSoftware) + (cantFormateo * precioFormateo) + (cantPreventivo * precioPreventivo);

            const totalFormateado = new Intl.NumberFormat('es-CO', { 
                style: 'currency', 
                currency: 'COP', 
                maximumFractionDigits: 0 
            }).format(total);

            // 5. Ajustar lo que se muestra en pantalla
            const requiereCotizacionExtra = reqServidores || reqCamaras || reqRedes;

            if (requiereCotizacionExtra && total === 0) {
                // Si solo marcaron cámaras/redes sin computadores
                totalTexto.innerText = "Por Cotizar";
                totalTexto.style.fontSize = "2.2rem";
            } else if (requiereCotizacionExtra && total > 0) {
                // Si tienen computadores + servicios especiales
                totalTexto.innerText = `${totalFormateado} + Visita`;
                totalTexto.style.fontSize = "2rem";
            } else {
                // Si solo son servicios base
                totalTexto.innerText = `${totalFormateado}*`;
                totalTexto.style.fontSize = "2.8rem";
            }
            
            resultadoCotizacion.style.display = 'block';

            // 6. Armar el mensaje de WhatsApp detallado
            let mensajeWa = `Hola Komunserver, solicito atención para los siguientes servicios:%0A`;
            
            if (cantSoftware > 0) mensajeWa += `- ${cantSoftware}x Mantenimiento de Software Básico%0A`;
            if (cantFormateo > 0) mensajeWa += `- ${cantFormateo}x Formateo y Configuración%0A`;
            if (cantPreventivo > 0) mensajeWa += `- ${cantPreventivo}x Mantenimiento Preventivo Físico%0A`;
            
            if (requiereCotizacionExtra) {
                mensajeWa += `%0A*Requiero cotización/visita para:*%0A`;
                if (reqServidores) mensajeWa += `- Servidores%0A`;
                if (reqCamaras) mensajeWa += `- Cámaras de seguridad (CCTV)%0A`;
                if (reqRedes) mensajeWa += `- Redes empresariales%0A`;
            }
            
            if (total > 0) {
                mensajeWa += `%0A*Presupuesto base estimado:* ${totalFormateado}%0A`;
            }

            mensajeWa += `%0A¿Podemos agendar una visita técnica?`;

            // 7. Enviar al botón (Asegúrate de que tu número esté correcto)
            btnWaCotizacion.href = `https://wa.me/573103043323?text=${mensajeWa}`;
        });
    }

   