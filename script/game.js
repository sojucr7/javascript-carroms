const canvas = document.getElementById("canvas");
canvas.width = 582;
canvas.height = 578;
const ctx = canvas.getContext("2d");

const ball = {
    x: 160,
    y: canvas.height - 120,
    radius: 11,
    color: "orange",
};

const stick = {
    length: 100,
    thickness: 10,
    color: "red",
};


const spaceBetween = 10;

const board = new Image();

let stickAttachX, stickAttachY, angle, arrowTipX, arrowTipY, arrowTail1X, arrowTail1Y, arrowTail2X, arrowTail2Y

function loadImage(url) {
    return new Promise(r => { let i = new Image(); i.onload = (() => r(i)); i.src = url; });
}

async function setup() {

    board.src = "board.jpg";
}
document.addEventListener("mousemove", function (event) {
    const dx = event.clientX - ball.x;
    const dy = event.clientY - ball.y;
    angle = Math.atan2(dy, dx);
    stickAttachX = ball.x + (ball.radius + spaceBetween) * Math.cos(angle);
    stickAttachY = ball.y + (ball.radius + spaceBetween) * Math.sin(angle);
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(board, 0, 0);
    drawBall()
    let tox = stickAttachX + stick.length * Math.cos(angle)
    let toy = stickAttachY + stick.length * Math.sin(angle)
    drawArrow(stickAttachX, stickAttachY, tox, toy)
    window.requestAnimationFrame(draw);
}

function drawBall(){
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawArrow(x0, y0, x1, y1) {
    const width = 2;
    const headLen = 4;
    const headAngle = Math.PI / 6;

    ctx.lineWidth = width;
    ctx.fillStyle = 'black';

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1 - headLen * Math.cos(angle - headAngle), y1 - headLen * Math.sin(angle - headAngle));
    ctx.lineTo(x1 - headLen * Math.cos(angle + headAngle), y1 - headLen * Math.sin(angle + headAngle));
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}
setup()
draw()
