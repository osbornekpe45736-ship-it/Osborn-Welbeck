// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddle = {
    x: 10,
    y: canvas.height / 2 - 50,
    width: 15,
    height: 100,
    speed: 6,
    dy: 0
};

const computer = {
    x: canvas.width - 25,
    y: canvas.height / 2 - 50,
    width: 15,
    height: 100,
    speed: 5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5,
    speed: 5
};

let playerScore = 0;
let computerScore = 0;

// Keyboard input
const keys = {
    ArrowUp: false,
    ArrowDown: false
};

// Mouse input
let mouseY = canvas.height / 2;

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') keys.ArrowUp = true;
    if (e.key === 'ArrowDown') keys.ArrowDown = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') keys.ArrowUp = false;
    if (e.key === 'ArrowDown') keys.ArrowDown = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

document.getElementById('resetButton').addEventListener('click', resetGame);

// Update player paddle position
function updatePlayerPaddle() {
    // Keyboard input
    if (keys.ArrowUp && paddle.y > 0) {
        paddle.dy = -paddle.speed;
    } else if (keys.ArrowDown && paddle.y + paddle.height < canvas.height) {
        paddle.dy = paddle.speed;
    } else {
        paddle.dy = 0;
    }

    // Mouse input (override keyboard if used)
    const paddleCenter = paddle.height / 2;
    const targetY = mouseY - paddleCenter;

    if (Math.abs(mouseY - (paddle.y + paddleCenter)) > 5) {
        paddle.y = targetY;
        if (paddle.y < 0) paddle.y = 0;
        if (paddle.y + paddle.height > canvas.height) {
            paddle.y = canvas.height - paddle.height;
        }
    } else {
        paddle.y += paddle.dy;
        if (paddle.y < 0) paddle.y = 0;
        if (paddle.y + paddle.height > canvas.height) {
            paddle.y = canvas.height - paddle.height;
        }
    }
}

// Update computer paddle (AI)
function updateComputerPaddle() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;

    if (computerCenter < ballCenter - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= computer.speed;
    }

    // Keep computer paddle in bounds
    if (computer.y < 0) computer.y = 0;
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Player paddle collision
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.y > paddle.y &&
        ball.y < paddle.y + paddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = paddle.x + paddle.width + ball.radius;
        
        // Add spin based on paddle movement
        const paddleCenter = paddle.y + paddle.height / 2;
        const deltaY = ball.y - paddleCenter;
        ball.dy = deltaY * 0.1;
        
        // Increase speed slightly
        ball.speed += 0.3;
        ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
    }

    // Computer paddle collision
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        
        // Add spin based on paddle movement
        const computerCenter = computer.y + computer.height / 2;
        const deltaY = ball.y - computerCenter;
        ball.dy = deltaY * 0.1;
        
        // Increase speed slightly
        ball.speed += 0.3;
        ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
    }

    // Scoring
    if (ball.x < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    } else if (ball.x > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
}

// Reset game
function resetGame() {
    playerScore = 0;
    computerScore = 0;
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
    resetBall();
    paddle.y = canvas.height / 2 - 50;
    computer.y = canvas.height / 2 - 50;
}

// Draw functions
function drawPaddle(p) {
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(p.x, p.y, p.width, p.height);
    ctx.shadowColor = 'rgba(0, 255, 136, 0.5)';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#00cc6a';
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.y, p.width, p.height);
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowColor = 'rgba(0, 255, 136, 0.8)';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#00cc6a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawCenter() {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenter();

    // Draw paddles
    drawPaddle(paddle);
    drawPaddle(computer);

    // Draw ball
    drawBall();
}

// Game loop
function gameLoop() {
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();