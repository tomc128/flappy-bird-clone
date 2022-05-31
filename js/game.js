
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const GRAVITY = 1000;

const PLAYER_POSITION = 100;
const PLAYER_STARTING_POSITION = CANVAS_HEIGHT / 2;

const PIPE_GAP_RANGE = [80, 180];
const PIPE_POSITION_RANGE = [100, CANVAS_HEIGHT - 100];
const PIPE_WIDTH = 50;
const PIPE_SPACING_OFFSET_RANGE = [100, CANVAS_WIDTH / 2]

const GENERATE_PIPES_AT = CANVAS_WIDTH;

let moveSpeed = 3;


import { Player } from './player.js';
import { Pipe } from './pipe.js';

export class Game {
    init() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.canvas.id = 'gameCanvas';
        this.canvas.width = 600;
        this.canvas.height = 400;
        document.body.appendChild(this.canvas);

        this.state = 'notStarted';


        this.player = new Player(PLAYER_STARTING_POSITION);
        this.pipes = [];

        document.addEventListener('keydown', (e) => {
            if (e.key == ' ') {
                if (this.state == 'notStarted') {
                    this.start();
                }
            }
        });
        document.addEventListener('touchstart', (e) => {
            if (this.state == 'notStarted') {
                this.start();
            }
        });
        document.addEventListener('mousedown', (e) => {
            if (this.state == 'notStarted') {
                this.start();
            }
        });

        this.lastRender = Date.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    loop() {
        let now = Date.now();
        let deltaTime = (now - this.lastRender) / 1000; // ms->s

        this.update(deltaTime);
        this.draw();

        this.lastRender = now;
        requestAnimationFrame(this.loop.bind(this));
    }

    update(deltaTime) {
        if (this.state == 'started') {
            // Player gravity
            this.player.velocity += GRAVITY * deltaTime;
            this.player.position += this.player.velocity * deltaTime;

            // Pipes moving
            for (const pipe of this.pipes) {
                pipe.x -= moveSpeed;
            }

            // Delete any pipes off the left of the screen, if any are deleted, generate new pipes
            let pipesToDelete = [];
            for (const pipe of this.pipes) {
                if (pipe.x + PIPE_WIDTH < 0) {
                    pipesToDelete.push(pipe);
                }
            }
            for (const pipe of pipesToDelete) {
                this.pipes.splice(this.pipes.indexOf(pipe), 1);
            }
            if (pipesToDelete.length > 0) {
                let spacingOffset = Math.floor(Math.random() * (PIPE_SPACING_OFFSET_RANGE[1] - PIPE_SPACING_OFFSET_RANGE[0] + 1) + PIPE_SPACING_OFFSET_RANGE[0]);
                this.generateAndAddPipePair(GENERATE_PIPES_AT + spacingOffset);
            }

            // Check collision
            if (this.player.position + this.player.height > this.canvas.height) {
                this.end();
            }
            if (this.player.position < 0) {
                this.end();
            }
        }
    }

    draw() {
        // Clear the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Player
        this.context.fillStyle = '#0095DD';
        this.context.fillRect(PLAYER_POSITION, this.player.position, this.player.width, this.player.height);

        // Top & Bottom barriers
        this.context.fillStyle = '#202040';
        this.context.fillRect(0, 0, this.canvas.width, 10);
        this.context.fillRect(0, this.canvas.height - 10, this.canvas.width, 10);

        // Pipes
        this.context.fillStyle = '#00DD60';
        for (const pipe of this.pipes) {
            this.context.fillRect(pipe.x, pipe.isBottomPipe ? this.canvas.height - pipe.height : 0, PIPE_WIDTH, pipe.height);
        }

    }

    generateAndAddPipePair(x) {
        let gap = Math.floor(Math.random() * (PIPE_GAP_RANGE[1] - PIPE_GAP_RANGE[0] + 1) + PIPE_GAP_RANGE[0]);
        let gapPosition = Math.floor(Math.random() * (PIPE_POSITION_RANGE[1] - PIPE_POSITION_RANGE[0] + 1) + PIPE_POSITION_RANGE[0]);

        // gap = 10;
        // gapPosition = 200;

        let topHeight = gapPosition - gap / 2;
        let bottomHeight = this.canvas.height - gapPosition - gap / 2;

        let topPipe = new Pipe(x, false, topHeight);
        let bottomPipe = new Pipe(x, true, bottomHeight);

        this.pipes.push(topPipe, bottomPipe);
    }

    end() {
        this.state = 'notStarted';

        this.player.velocity = 0;
        this.player.position = this.canvas.height / 2;

        // Delete all pipes
        this.pipes = [];
    }

    start() {
        this.state = 'started';

        this.generateAndAddPipePair(GENERATE_PIPES_AT);
        this.generateAndAddPipePair(GENERATE_PIPES_AT + CANVAS_WIDTH / 2);
        this.generateAndAddPipePair(GENERATE_PIPES_AT + CANVAS_WIDTH);
    }
}