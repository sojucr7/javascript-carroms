//reference - http://www.java2s.com/example/javascript-book/multiple-balls-bouncing-and-colliding.html
//https://codepen.io/ztyler/pen/LergVR
const canvas = document.getElementById("canvas");

const context = canvas.getContext("2d");

const ballRadius = 14;

const holes = {
    topLeftHole: [80, 88],
    topRightHole: [493, 88],
    bottomLeftHole: [80, 484],
    bottomRightHole: [493, 484]
}


const balls = [
    {
        x: 223,
        y: 128,
        radius: ballRadius,
        color: "blue",
        striker: true,
        velocityX: 0,
        velocityY: 0
    }
]
for (let i = 0; i < 4; i++) {
    for (let j = 0; j <= 3; j++) {
        balls.push({
            x: 250 + ballRadius * 2 * j,
            y: 256 + ballRadius * 2 * i,
            radius: ballRadius,
            color: j % 2 == 0 ? "orange" : "black",
            velocityX: 0,
            velocityY: 0
        })
    }
}


const strikerBall = balls.find((ball) => {
    return ball.striker == true
})

const stick = {
    length: 50,
    thickness: 10,
    color: "black",
};

const spaceBetween = 10;

const board = new Image();

const BOARD_EDGE_THICKNESS = 50

const FRICTION = 0.01;

const shootingMaxVelocity = 100;

const progressBarContainer = document.getElementById('progress-bar-container')

const sliderConfirm = document.getElementById('slider-confirm')

const shootingSlider = document.getElementById('shooting-slider')

let stickAttachX, stickAttachY, arrowTipX, arrowTipY, arrowTail1X, arrowTail1Y, arrowTail2X, arrowTail2Y;

let shootingVelocity = 0;

let shooting = false;

let mouseDownId;

let angle = 0;

let mouseDown = false;

let directionX = 1;

let directionY = 1;

let draggableX, draggableY;

let ready = false;

canvas.width = 582;

canvas.height = 578;

function setup() {
    board.src = "board.jpg";
}

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function isStrikerDragging(mousePosition) {
     return mousePosition.y>=110 && mousePosition.y<=140 && mousePosition.x>=187 && mousePosition.x <= 398
}
canvas.addEventListener("mousemove", (event) => {
    if (shooting) {
        return
    }
    let mousePosition = getMousePos(event)
    if (
        isStrikerDragging(mousePosition)) {
        strikerBall.x = mousePosition.x
        ready=false
    }else{
        ready=true
    }
})
document.addEventListener("mousemove", function (event) {
    let mousePosition = getMousePos(event)
    if(isStrikerDragging(mousePosition)){
       return;
    }
    if (shooting) {
        return
    }
    const deltaX = event.clientX - strikerBall.x;
    const deltaY = event.clientY - strikerBall.y;
    angle = Math.atan2(deltaY, deltaX);
    stickAttachX = strikerBall.x + (strikerBall.radius + spaceBetween) * Math.cos(angle);
    stickAttachY = strikerBall.y + (strikerBall.radius + spaceBetween) * Math.sin(angle);
});

document.addEventListener("mousedown", function (event) {
    let mousePosition = getMousePos(event)
    if(isStrikerDragging(mousePosition)){
       return;
    }
    if(strikerBall.velocityX || strikerBall.velocityY){
        return;
    }
    mouseDown = true;
    progressBarContainer.style.display = 'block'
    mouseDownId = setInterval(function () {
        if (shootingVelocity < shootingMaxVelocity) {
            shootingVelocity += 5;
        }
        document.documentElement.style
            .setProperty('--progress-bar-width', `${shootingVelocity / shootingMaxVelocity * 100}%`);
    }, 100)
});



document.addEventListener("mouseup", function (event) {
    let mousePosition = getMousePos(event)
    if(isStrikerDragging(mousePosition)){
       return;
    }
    mouseDown = false;
    shooting = true;
    if (mouseDownId) {
        clearInterval(mouseDownId)
    }
    if(strikerBall.velocityX || strikerBall.velocityY){
        return;
    }
    document.documentElement.style
        .setProperty('--progress-bar-width', `0%`);

    progressBarContainer.style.display = 'none'
    strikerBall.velocityY = Math.sin(angle) * shootingVelocity * directionY
    strikerBall.velocityX = Math.cos(angle) * shootingVelocity * directionX
});



function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(board, 0, 0);

    drawBalls()

    if (shooting && Math.abs(strikerBall.velocityX) <= 0.2 && Math.abs(strikerBall.velocityY) <= 0.2) {
        reset()
    }

    if (!mouseDown && shooting) {

        updateBall()
    }
    if (shooting){
        ballWallCollision()

        ballBallCollison()
    }
   

    updateScore()

    let stickEndX = stickAttachX + stick.length * Math.cos(angle)
    let stickEndY = stickAttachY + stick.length * Math.sin(angle)

    if (!shooting && ready) {
        drawArrow(stickAttachX, stickAttachY, stickEndX, stickEndY)
    }

    window.requestAnimationFrame(draw);
}

function drawBalls() {
    for (let i = 0; i < balls.length; i++) {
        context.beginPath();
        context.arc(balls[i].x, balls[i].y, balls[i].radius, 0, Math.PI * 2);
        context.fillStyle = balls[i].color;
        context.fill();
        context.closePath();
    }

}

function updateBall() {
    for (let i = 0; i < balls.length; i++) {
        ball = balls[i];
        ball.velocityX += dragForce(ball.velocityX, FRICTION);
        ball.velocityY += dragForce(ball.velocityY, FRICTION);
        ball.x = ball.x + ball.velocityX;
        ball.y = ball.y + ball.velocityY;
    }

}

function reset() {
    shootingVelocity = 0;
    strikerBall.x = 223
    strikerBall.y = 128
    mouseDown = false;
    shooting = false;
    ready = false;
    for (let i = 0; i < balls.length; i++) {
        ball = balls[i];
        ball.velocityX = 0;
        ball.velocityY = 0;

    }
}


function dragForce(velocity, coefficient) {
    return -1 * coefficient * velocity;
}

function ballWallCollision() {

    for (let i = 0; i < balls.length; i++) {
        if (balls[i].x > canvas.width - BOARD_EDGE_THICKNESS || balls[i].x < BOARD_EDGE_THICKNESS) {
            balls[i].velocityX *= -1
        }
        if (balls[i].y > canvas.height - BOARD_EDGE_THICKNESS || balls[i].y < BOARD_EDGE_THICKNESS) {
            balls[i].velocityY *= -1
        }
    }
}

function ballBallCollison() {
    let ball;
    let testBall;
    for (let i = 0; i < balls.length; i++) {
        ball = balls[i];
        for (let j = i + 1; j < balls.length; j++) {
            testBall = balls[j];
            var collision = isCirclesCollided(ball, testBall)

            if (collision[0]) {
                adjustPositions(ball, testBall, collision[1]);
                resolveBallCollision(ball, testBall);
            }
        }
    }
}

function isCirclesCollided(ballA, ballB) {

    var rSum = ballA.radius + ballB.radius;
    var dx = ballB.x - ballA.x;
    var dy = ballB.y - ballA.y;
    return [
        rSum * rSum > dx * dx + dy * dy,
        rSum - Math.sqrt(dx * dx + dy * dy),
    ];
}

function resolveBallCollision(ballA, ballB) {

    var relVel = [ballB.velocityX - ballA.velocityX, ballB.velocityY - ballA.velocityY];
    var norm = [ballB.x - ballA.x, ballB.y - ballA.y];
    var mag = Math.sqrt(norm[0] * norm[0] + norm[1] * norm[1]);
    norm = [norm[0] / mag, norm[1] / mag];

    var velAlongNorm = relVel[0] * norm[0] + relVel[1] * norm[1];
    if (velAlongNorm > 0) return;

    var bounce = 0.7;
    var j = -(1 + bounce) * velAlongNorm;
    j /= 1 / ballA.radius + 1 / ballB.radius;

    var impulse = [j * norm[0], j * norm[1]];
    ballA.velocityX -= (1 / ballA.radius) * impulse[0];
    ballA.velocityY -= (1 / ballA.radius) * impulse[1];
    ballB.velocityX += (1 / ballB.radius) * impulse[0];
    ballB.velocityY += (1 / ballB.radius) * impulse[1];
}


function adjustPositions(ballA, ballB, depth) {
    //Inefficient implementation for now
    const percent = 0.2;
    const slop = 0.01;
    var correction =
        (Math.max(depth - slop, 0) / (1 / ballA.radius + 1 / ballB.radius)) * percent;

    var norm = [ballB.x - ballA.x, ballB.y - ballA.y];
    var mag = Math.sqrt(norm[0] * norm[0] + norm[1] * norm[1]);
    norm = [norm[0] / mag, norm[1] / mag];
    correction = [correction * norm[0], correction * norm[1]];
    ballA.x -= (1 / ballA.radius) * correction[0];
    ballA.y -= (1 / ballA.radius) * correction[1];
    ballB.x += (1 / ballB.radius) * correction[0];
    ballB.y += (1 / ballB.radius) * correction[1];
}

function drawArrow(x0, y0, x1, y1) {
    
    const width = 6;
    const headLen = 4;
    const headAngle = Math.PI / 6;
    context.lineWidth = width;

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
    context.strokeStyle = stick.color;
    context.fill();
}

function updateScore() {
    for (let i = balls.length - 1; i >= 0; i--) {
        if (balls[i].striker) {
            continue
        }
        if (balls[i].x < holes.topLeftHole[0] && balls[i].y < holes.topLeftHole[1]) {
            balls[i].velocityX = 0;
            balls[i].velocityY = 0;
            balls[i].x = 64
            balls[i].y = 73
            balls.splice(i, 1)
            i--;

            continue;
        }

        if (balls[i].x > holes.topRightHole[0] && balls[i].y < holes.topRightHole[1]) {
            balls[i].velocityX = 0;
            balls[i].velocityY = 0;
            balls[i].x = 519
            balls[i].y = 65
            balls.splice(i, 1)
            i--;
            continue;
        }

        if (balls[i].x > holes.bottomRightHole[0] && balls[i].y > holes.bottomRightHole[1]) {
            balls[i].velocityX = 0;
            balls[i].velocityY = 0;
            balls[i].x = 516
            balls[i].y = 516
            balls.splice(i, 1)
            i--;
            continue;
        }

        if (balls[i].x < holes.bottomLeftHole[0] && balls[i].y > holes.bottomLeftHole[1]) {
            balls[i].velocityX = 0;
            balls[i].velocityY = 0;
            balls[i].x = 66
            balls[i].y = 513
            balls.splice(i, 1)
            i--;
            continue;
        }

    }
}

setup()

draw()
