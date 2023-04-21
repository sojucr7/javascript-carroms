const canvas = document.getElementById("canvas");

const context = canvas.getContext("2d");

const ball = {
    x: 260,
    y: 120,
    radius: 11,
    color: "orange",
};

const stick = {
    length: 50,
    thickness: 10,
    color: "red",
};

const spaceBetween = 10;

const board = new Image();

const BOARD_EDGE_THICKNESS=50

let stickAttachX, stickAttachY, arrowTipX, arrowTipY, arrowTail1X, arrowTail1Y, arrowTail2X, arrowTail2Y;

let shootingVelocity = 0;

let shootingVelocityX=0;

let shootingVelocityY=0;

let shooting = false;

let mouseDownId;

let angle = 0;

let mouseDown = false;

let directionX=1;

let directionY=1;

canvas.width = 582;

canvas.height = 578;

function setup() {
    board.src = "board.jpg";
}

document.addEventListener("mousemove", function (event) {
    if (shooting) {
        return
    }
    const deltaX = event.clientX - ball.x;
    const deltaY = event.clientY - ball.y;
    angle = Math.atan2(deltaY, deltaX);
    stickAttachX = ball.x + (ball.radius + spaceBetween) * Math.cos(angle);
    stickAttachY = ball.y + (ball.radius + spaceBetween) * Math.sin(angle);
});

document.addEventListener("mousedown", function (event) {
    mouseDown = true;
    mouseDownId = setInterval(function () {
        if (shootingVelocity < 6) {
            shootingVelocity += .5;
        }
        document.documentElement.style
            .setProperty('--progress-bar-width', `${shootingVelocity / 6 * 100}%`);
    }, 100)
});

document.addEventListener("mouseup", function (event) {
    console.log("SHOOT!!!")
    mouseDown = false;
    shooting = true;
    if (mouseDownId) {
        clearInterval(mouseDownId)
    }
    document.documentElement.style
        .setProperty('--progress-bar-width', `0%`);
});

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(board, 0, 0);

    drawBall()

    if (!mouseDown && shooting) {

        updateBall()
    }

    ballWallCollision()

    let stickEndX = stickAttachX + stick.length * Math.cos(angle)
    let stickEndY = stickAttachY + stick.length * Math.sin(angle)

    if (!shooting) {
        drawArrow(stickAttachX, stickAttachY, stickEndX, stickEndY)
    }

    window.requestAnimationFrame(draw);
}

function drawBall() {
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fillStyle = ball.color;
    context.fill();
    context.closePath();
}

function updateBall() {
    
    if(shootingVelocity<0){
        shootingVelocity+=.01
    } 
    if(shootingVelocity>0){
        shootingVelocity-=.01
    } 
    ball.y += Math.sin(angle) * shootingVelocity*directionY
    ball.x += Math.cos(angle) * shootingVelocity*directionX
}

function ballWallCollision(){
    if(ball.x>canvas.width-BOARD_EDGE_THICKNESS || ball.x<BOARD_EDGE_THICKNESS){
        directionX=-directionX
    }
    if(ball.y>canvas.height-BOARD_EDGE_THICKNESS || ball.y<BOARD_EDGE_THICKNESS){
        directionY=-directionY
    }
}

function drawArrow(x0, y0, x1, y1) {
    const width = 6;
    const headLen = 4;
    const headAngle = Math.PI / 6;
    context.lineWidth = width;
    context.fillStyle = stick.color;

    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();

    context.beginPath();
    context.lineTo(x1, y1);
    context.lineTo(x1 - headLen * Math.cos(angle - headAngle), y1 - headLen * Math.sin(angle - headAngle));
    context.lineTo(x1 - headLen * Math.cos(angle + headAngle), y1 - headLen * Math.sin(angle + headAngle));
    context.closePath();
    context.stroke();
    context.fill();
}

setup()

draw()
