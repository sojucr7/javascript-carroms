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

let stickAttachX, stickAttachY, angle, arrowTipX, arrowTipY, arrowTail1X, arrowTail1Y, arrowTail2X, arrowTail2Y;

let shootingPower = 0;

let mouseDownId;

canvas.width = 582;

canvas.height = 578;

function setup() {
    board.src = "board.jpg";
}

document.addEventListener("mousemove", function (event) {
    const deltaX = event.clientX - ball.x;
    const deltaY = event.clientY - ball.y;
    angle = Math.atan2(deltaY, deltaX);
    stickAttachX = ball.x + (ball.radius + spaceBetween) * Math.cos(angle);
    stickAttachY = ball.y + (ball.radius + spaceBetween) * Math.sin(angle);
});

document.addEventListener("mousedown", function (event) {
    mouseDownId = setInterval(function () {
        if (shootingPower < 6) {
            shootingPower += .5;
        }
        document.documentElement.style
            .setProperty('--progress-bar-width', `${shootingPower / 6 * 100}%`);
    }, 100)
});

document.addEventListener("mouseup", function (event) {
    console.log("SHOOT!!!")

    if (mouseDownId) {
        clearInterval(mouseDownId)
    }

    shootingPower = 0;
    document.documentElement.style
        .setProperty('--progress-bar-width', `0%`);

    //TODO - calculate carrom piece velocity
    // let y = Math.sin(angle) * shootingPower
    // let x = Math.cos(angle) * shootingPower;
    // console.log(x, y)
});

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(board, 0, 0);

    drawBall()

    let stickEndX = stickAttachX + stick.length * Math.cos(angle)
    let stickEndY = stickAttachY + stick.length * Math.sin(angle)
    drawArrow(stickAttachX, stickAttachY, stickEndX, stickEndY)

    window.requestAnimationFrame(draw);
}

function drawBall() {
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fillStyle = ball.color;
    context.fill();
    context.closePath();
}

function drawArrow(x0, y0, x1, y1) {
    const width = 6;
    const headLen = 4;
    const headAngle = Math.PI / 6;
    context.lineWidth = width;
    context.fillStyle = 'black';

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
