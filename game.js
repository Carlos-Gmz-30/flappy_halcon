const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Variables base
let halconY = canvas.height / 2;
let halconVelocity = 0;
let gravity = 0.6;
let jump = -10;
let energy = 100;
let lives = 3;
let score = 0;

// Obstáculos
let pipes = [];
let pipeGap = 150;
let frame = 0;

document.addEventListener("keydown", () => {
    if (energy > 0) {
        halconVelocity = jump;
        energy -= 10;
    }
});

function drawHalcon() {
    ctx.fillStyle = "#007e3a"; // Verde UTEZ
    ctx.beginPath();
    ctx.arc(60, halconY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = "#333";
        ctx.fillRect(pipe.x, 0, 40, pipe.top);
        ctx.fillRect(pipe.x, pipe.top + pipeGap, 40, canvas.height);
    });
}

function drawUI() {
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText(`Vidas: ${lives}`, 10, 20);
    ctx.fillText(`Energía: ${energy}`, 10, 40);
    ctx.fillText(`Puntaje: ${score}`, 10, 60);
}

function update() {
    frame++;
    halconVelocity += gravity;
    halconY += halconVelocity;

    // Crear tuberías
    if (frame % 100 === 0) {
        const top = Math.random() * 200 + 50;
        pipes.push({ x: canvas.width, top });
    }

    // Mover tuberías y detectar colisión
    pipes = pipes.map(pipe => {
        pipe.x -= 2;

        // Colisión
        if (
            60 + 20 > pipe.x && 60 - 20 < pipe.x + 40 &&
            (halconY - 20 < pipe.top || halconY + 20 > pipe.top + pipeGap)
        ) {
            lives--;
            pipe.x = -100; // eliminarlo
        }

        if (pipe.x + 40 < 0) score++; // sumar punto si pasa el tubo

        return pipe;
    });

    // Energía recuperable
    if (frame % 200 === 0 && energy < 100) {
        energy += 10;
    }

    // Fin del juego
    if (lives <= 0 || halconY > canvas.height || halconY < 0) {
        alert("Juego terminado. Puntaje: " + score);
        document.location.reload();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHalcon();
    drawPipes();
    drawUI();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
