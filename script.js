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