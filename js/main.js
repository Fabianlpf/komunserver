// Inicializar iconos de Lucide
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initCanvas();
    initTerminal();
});

// Fondo con efecto Matrix / Puntos Tecnológicos Canvas
function initCanvas() {
    const canvas = document.getElementById("matrix-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const particles = [];
    const count = 40;

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vy: Math.random() * 0.5 + 0.2,
            size: Math.random() * 2 + 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 255, 204, 0.4)";

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.y += p.vy;
            if (p.y > canvas.height) p.y = 0;
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// Lógica de la Consola CLI Interactiva
function initTerminal() {
    const input = document.getElementById("terminal-input");
    const output = document.getElementById("terminal-output");

    if (!input || !output) return;

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const command = input.value.trim().toLowerCase();
            if (!command) return;

            // Mostrar comando ingresado
            const userCommandDiv = document.createElement("div");
            userCommandDiv.innerHTML = `<span class="text-cyan-400">&gt;</span> ${escapeHtml(input.value)}`;
            output.appendChild(userCommandDiv);

            // Procesar respuesta
            const responseDiv = document.createElement("div");
            responseDiv.className = "text-slate-400";

            switch (command) {
                case "ayuda":
                case "help":
                    responseDiv.innerHTML = `Comandos disponibles:<br>
                    - <span class="text-cyan-400">estado</span>: Muestra el estado del servidor.<br>
                    - <span class="text-cyan-400">servicios</span>: Lista los servicios de soporte.<br>
                    - <span class="text-cyan-400">contacto</span>: Muestra información de contacto.<br>
                    - <span class="text-cyan-400">limpiar</span>: Limpia la terminal.`;
                    break;
                case "estado":
                    responseDiv.innerHTML = `<span class="text-emerald-400">[OK] Todos los sistemas operando al 100%. Red segura y sin incidencias.</span>`;
                    break;
                case "servicios":
                    responseDiv.innerHTML = `1. Seguridad y Redes<br>2. Hardware y Mantenimiento<br>3. Soporte Remoto 24/7`;
                    break;
                case "contacto":
                    responseDiv.innerHTML = `Escríbenos a soporte@komunserver.local o agenda tu asistencia técnica en línea.`;
                    break;
                case "limpiar":
                case "clear":
                    output.innerHTML = "";
                    input.value = "";
                    return;
                default:
                    responseDiv.innerHTML = `<span class="text-red-400">Comando no reconocido. Escribe 'ayuda' para ver los comandos válidos.</span>`;
            }

            output.appendChild(responseDiv);
            input.value = "";
            output.scrollTop = output.scrollHeight;
        }
    });
}

function escaparHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
// Alias preventivo por si acaso
const escapeHtml = escaparHtml;