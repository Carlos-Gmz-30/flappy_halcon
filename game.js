const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let halconY = canvas.height / 2;
let halconVelocity = 0;
let gravity = 0.6;
let jump = -10;
let energy = 100;
let lives = 3;
let score = 0;

let pipes = [];
let pipeGap = 150;
let frame = 0;



document.addEventListener("keydown", () => {
    if (energy > 0) {
        halconVelocity = jump;
        energy -= 10;
    }
});

const halconImg = new Image();
halconImg.src = "assets/images/Image.png";

function drawHalcon() {
    if (halconImg.complete) {
        ctx.drawImage(halconImg, 40, halconY - 20, 40, 40);
    } else {
        halconImg.onload = () => {
            ctx.drawImage(halconImg, 40, halconY - 20, 40, 40);
        };
    }
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

let loopId;

function showGameOverModal() {
    const modal = document.getElementById("gameOverModal");
    const finalScore = document.getElementById("finalScore");
    finalScore.textContent = "Puntaje: " + score;
    modal.style.display = "flex";
}

function hideGameOverModal() {
    document.getElementById("gameOverModal").style.display = "none";
}

function resetGame() {
    halconY = canvas.height / 2;
    halconVelocity = 0;
    energy = 100;
    lives = 3;
    score = 0;
    pipes = [];
    frame = 0;
}

function update() {
    frame++;
    halconVelocity += gravity;
    halconY += halconVelocity;

    if (frame % 100 === 0) {
        const top = Math.random() * 200 + 50;
        pipes.push({ x: canvas.width, top });
    }

    pipes = pipes.map(pipe => {
        pipe.x -= 2;

        if (
            60 + 20 > pipe.x && 60 - 20 < pipe.x + 40 &&
            (halconY - 20 < pipe.top || halconY + 20 > pipe.top + pipeGap)
        ) {
            lives--;
            pipe.x = -100;
        }

        if (pipe.x + 40 < 0) score++;

        return pipe;
    });

    if (frame % 30 === 0 && energy < 100) {
        energy += 10;
    }

    
    if ((halconY > canvas.height || halconY < 0) && lives > 0) {
        lives--;
        halconY = canvas.height / 2;
        halconVelocity = 0;
    }
    
    if (lives <= 0) {
        showGameOverModal();
        cancelAnimationFrame(loopId); // Stop the loop
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
    loopId = requestAnimationFrame(loop);
}

document.getElementById("playAgainBtn").onclick = function () {
    hideGameOverModal();
    resetGame();
    //cancelAnimationFrame(loopId); // Ensure no previous loop is running
    loop();
};

document.getElementById("startBtn").onclick = function () {
    document.getElementById("startModal").style.display = "none";
    resetGame();
    loop();
};



