// import Player from './player.js';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const GRAVITY = 1000;

let moveSpeed = 3;

// let canvas = document.createElement('canvas');
// let context = canvas.getContext('2d');
// canvas.id = 'gameCanvas';
// canvas.width = CANVAS_WIDTH;
// canvas.height = CANVAS_HEIGHT;
// document.body.appendChild(canvas);

// let player = new Player();
// let playerPos = 200;



// document.addEventListener('keydown', (e) => {
//     if (e.key == 'Space') {
//         player.jump();
//     }
// });

import { Player } from './player.js';

export class Game {
    init() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.canvas.id = 'gameCanvas';
        this.canvas.width = 600;
        this.canvas.height = 400;
        document.body.appendChild(this.canvas);


        this.player = new Player();


        this.lastRender = Date.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    loop() {
        let now = Date.now();
        let deltaTime = (now - this.lastRender) / 1000; // ms->s

        console.log(now);
        console.log(deltaTime);

        this.update(deltaTime);
        this.draw();

        this.lastRender = now;
        requestAnimationFrame(this.loop.bind(this));
    }

    update(deltaTime) {
        // Player gravity
        this.player.velocity += GRAVITY * deltaTime;
        this.player.position += this.player.velocity * deltaTime;
    }

    draw() {
        // Clear the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Player
        this.context.fillStyle = '#0095DD';
        this.context.fillRect(100, this.player.position, this.player.width, this.player.height);

        // Top & Bottom barriers
        this.context.fillStyle = '#202040';
        this.context.fillRect(0, 0, this.canvas.width, 10);
        this.context.fillRect(0, this.canvas.height - 10, this.canvas.width, 10);
    }
}