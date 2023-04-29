//reference - http://www.java2s.com/example/javascript-book/multiple-balls-bouncing-and-colliding.html
const canvas = document.getElementById("canvas");

const context = canvas.getContext("2d");

const ballRadius=13;
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
for(let i=0;i<3;i++){
    for(let j=0;j<=i;j++){
        balls.push({
            x: 270+ballRadius*2*j+(j*20),
            y: 256+ballRadius*2*i+(i*30),
            radius: ballRadius,
            color: j%2==0?"orange":"black",
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
    color: "red",
};

const spaceBetween = 10;

const board = new Image();

const BOARD_EDGE_THICKNESS = 50

const FRICTION = 0.01;

const shootingMaxVelocity = 100;

const progressBarContainer = document.getElementById('progress-bar-container')

const rangeSlider = document.getElementById('range-slider')

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
    rangeSlider.value = strikerBall.x
}

document.addEventListener("mousemove", function (event) {
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
    if (!ready) {
        return
    }
    mouseDown = true;
    progressBarContainer.style.display='block'
    mouseDownId = setInterval(function () {
        if (shootingVelocity < shootingMaxVelocity) {
            shootingVelocity += 20;
        }
        document.documentElement.style
            .setProperty('--progress-bar-width', `${shootingVelocity / shootingMaxVelocity * 100}%`);
    }, 100)
});

sliderConfirm.addEventListener('click', function (event) {
    ready = true;
})

document.addEventListener("mouseup", function (event) {
    if (!ready) {
        return;
    }
    mouseDown = false;
    shooting = true;
    if (mouseDownId) {
        clearInterval(mouseDownId)
    }
    document.documentElement.style
        .setProperty('--progress-bar-width', `0%`);

    progressBarContainer.style.display='none'
    strikerBall.velocityY = Math.sin(angle) * shootingVelocity * directionY
    strikerBall.velocityX = Math.cos(angle) * shootingVelocity * directionX
});

rangeSlider.addEventListener("input", function (event) {
    strikerBall.x = parseInt(event.target.value)
});



function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(board, 0, 0);

    drawBalls()

    if (shooting && Math.abs(strikerBall.velocityX)<=0.2 && Math.abs(strikerBall.velocityY) <= 0.2) {
       reset()
    }

    if (!mouseDown && shooting) {

        updateBall()
    }

    ballWallCollision()

    ballBallCollison()

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
    ready=false;
    rangeSlider.value = strikerBall.x
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
            if (isCirclesCollided(ball, testBall)) {
                resolveBallCollision(ball, testBall)
            }
        }
    }
}

function isCirclesCollided(ball1, ball2) {
    let retval = false;
    let dx = ball1.x - ball2.x;
    let dy = ball1.y - ball2.y;
    let distance = (dx * dx + dy * dy);
    if (distance <= (ball1.radius + ball2.radius) * (ball1.radius + ball2.radius)) {
        retval = true;
    }
    return retval;
}

function resolveBallCollision(ball1, ball2) {

    let dx = ball1.x - ball2.x;
    let dy = ball1.y - ball2.y;

    let collisionAngle = Math.atan2(dy, dx);

    let speed1 = Math.sqrt(ball1.velocityX * ball1.velocityX + ball1.velocityY * ball1.velocityY);
    let speed2 = Math.sqrt(ball2.velocityX * ball2.velocityX + ball2.velocityY * ball2.velocityY);

    let direction1 = Math.atan2(ball1.velocityY, ball1.velocityX);
    let direction2 = Math.atan2(ball2.velocityY, ball2.velocityX);

    let velocityX1 = speed1 * Math.cos(direction1 - collisionAngle);
    let velocityY1 = speed1 * Math.sin(direction1 - collisionAngle);
    let velocityX2 = speed2 * Math.cos(direction2 - collisionAngle);
    let velocityY2 = speed2 * Math.sin(direction2 - collisionAngle);

    let finalVelocityX1 = ((ball1.radius - ball2.radius) * velocityX1 + (ball2.radius + ball2.radius) * velocityX2) / (ball1.radius + ball2.radius);
    let finalVelocityX2 = ((ball1.radius + ball1.radius) * velocityX1 + (ball2.radius - ball1.radius) * velocityX2) / (ball1.radius + ball2.radius);

    let finalVelocityY1 = velocityY1;
    let finalVelocityY2 = velocityY2;

    ball1.velocityX = Math.cos(collisionAngle) * finalVelocityX1 + Math.cos(collisionAngle + Math.PI / 2) * finalVelocityY1;
    ball1.velocityY = Math.sin(collisionAngle) * finalVelocityX1 + Math.sin(collisionAngle + Math.PI / 2) * finalVelocityY1;
    ball2.velocityX = Math.cos(collisionAngle) * finalVelocityX2 + Math.cos(collisionAngle + Math.PI / 2) * finalVelocityY2;
    ball2.velocityY = Math.sin(collisionAngle) * finalVelocityX2 + Math.sin(collisionAngle + Math.PI / 2) * finalVelocityY2;

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

setup()

draw()



// canvas.addEventListener("mousedown", function (event) {
//     const rect = canvas.getBoundingClientRect()
//     const x = event.clientX - rect.left
//     const y = event.clientY - rect.top
//     console.log("x: " + x + " y: " + y)
// })

// document.addEventListener("mouseup", function (event) {
//     const mouseX = event.clientX - canvas.offsetLeft
//     const mouseY = event.clientY - canvas.offsetTop
//     const bounds = canvas.getBoundingClientRect();
//     strikerBall.x = (mouseX / bounds.width) * canvas.width;
//     strikerBall.y = (mouseY / bounds.height) * canvas.height;
//     console.log(strikerBall)
// })