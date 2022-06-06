
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const GRAVITY = 1000;

const PLAYER_WIDTH = 25;
const PLAYER_HEIGHT = 25;
const PLAYER_X = 100;
const PLAYER_STARTING_Y = CANVAS_HEIGHT / 2;

const PIPE_GAP_RANGE = [80, 180];
const PIPE_GAP_Y_RANGE = [100, CANVAS_HEIGHT - 100];
const PIPE_WIDTH = 50;
const PIPE_SPACING = CANVAS_WIDTH / 2;
const PIPE_BASE_MOVE_SPEED = 3;

const SCORE_INCREASE_COOLDOWN_MS = 500;

const GENERATE_PIPES_AT_X = CANVAS_WIDTH;


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


        this.player = new Player(PLAYER_X, PLAYER_STARTING_Y, PLAYER_WIDTH, PLAYER_HEIGHT);
        this.pipes = [];

        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case ' ':
                    if (this.state == 'notStarted') {
                        this.start();
                    }
                    break;

                case 'p':
                    this.isPaused = !this.isPaused;
                    break;

                case 'd':
                    this.showDebugVisuals = !this.showDebugVisuals;
                    break;

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

        this.lastScoreIncrease = Date.now();

        this.lastRender = Date.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    loop() {
        let now = Date.now();
        let deltaTime = (now - this.lastRender) / 1000; // ms->s

        if (!this.isPaused) {
            this.update(deltaTime);
            this.draw();

            if (this.showDebugVisuals) {
                this.debugDraw();
            }
        }

        this.lastRender = now;
        requestAnimationFrame(this.loop.bind(this));
    }

    update(deltaTime) {
        if (this.state == 'started') {
            // Player gravity
            this.player.velocity += GRAVITY * deltaTime;
            this.player.y += this.player.velocity * deltaTime;

            // Pipes moving
            for (const pipe of this.pipes) {
                pipe.x -= PIPE_BASE_MOVE_SPEED;
            }

            // Score increase
            if (PLAYER_X + PLAYER_WIDTH / 2 > this.pipes[0].x - PIPE_WIDTH / 2 && PLAYER_X - PLAYER_WIDTH / 2 < this.pipes[0].x + PIPE_WIDTH / 2) {
                console.log('inside pipe area');
                if (Date.now() - this.lastScoreIncrease > SCORE_INCREASE_COOLDOWN_MS) {
                    this.score++;
                    this.lastScoreIncrease = Date.now();
                }
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
                ;
                this.generateAndAddPipePair(GENERATE_PIPES_AT_X + PIPE_SPACING);
            }

            // Check collision
            if (this.playerIsCollidingWithPipe() || this.playerIsOutOfBounds()) {
                this.end();
            }
        }
    }

    draw() {
        // Clear the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Player
        this.context.fillStyle = '#0095DD';

        this.context.beginPath();
        this.context.arc(PLAYER_X + PLAYER_WIDTH / 2, this.player.y + PLAYER_HEIGHT / 2, PLAYER_WIDTH / 2, 0, 2 * Math.PI);
        this.context.fill();

        // Top & Bottom barriers
        this.context.fillStyle = '#202040';
        this.context.fillRect(0, 0, this.canvas.width, 10);
        this.context.fillRect(0, this.canvas.height - 10, this.canvas.width, 10);

        // Pipes
        if (this.state == 'started') {
            this.context.fillStyle = '#000';
            for (const pipe of this.pipes) {
                this.context.fillRect(pipe.x, pipe.isBottomPipe ? this.canvas.height - pipe.height : 0, PIPE_WIDTH, pipe.height);
            }
        }

        // Menu Screen
        if (this.state == 'notStarted') {
            this.context.fillStyle = '#000000cc';
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.context.fillStyle = '#00DD60';
            this.context.font = '24px "Press Start 2P"';
            this.context.textAlign = 'center';
            this.context.fillText('Tap or space to start', this.canvas.width / 2, this.canvas.height / 2, this.canvas.width - 50);
        }

        // Score
        if (this.state == 'started') {
            this.context.fillStyle = '#202040';
            this.context.font = '18px "Press Start 2P"';
            this.context.textAlign = 'center';
            this.context.fillText(this.score, this.canvas.width / 2, 50);
        }
    }

    debugDraw() {
        // Player bounding box
        this.context.lineWidth = 3;
        this.context.strokeStyle = '#ff0000';
        this.context.strokeRect(PLAYER_X, this.player.y, PLAYER_WIDTH, PLAYER_HEIGHT);

        // Pipes bounding boxes
        for (const pipe of this.pipes) {
            let pipeLeft = pipe.x;
            let pipeRight = pipe.x + PIPE_WIDTH;
            let pipeEnd = pipe.isBottomPipe ? this.canvas.height - pipe.height : pipe.height;

            this.context.strokeStyle = '#ff0000';
            this.context.beginPath();
            this.context.moveTo(pipeLeft, pipe.y);
            this.context.lineTo(pipeLeft, pipe.y + pipe.height);
            this.context.stroke();

            this.context.strokeStyle = '#ff00ff';
            this.context.beginPath();
            this.context.moveTo(pipeRight, pipe.y);
            this.context.lineTo(pipeRight, pipe.y + pipe.height);
            this.context.stroke();

            this.context.strokeStyle = '#00ffff';
            this.context.beginPath();
            this.context.moveTo(pipeLeft, pipeEnd);
            this.context.lineTo(pipeRight, pipeEnd);
            this.context.stroke();

            // this.context.strokeStyle = '#ff0000';
            // this.context.strokeRect(pipe.x, pipe.isBottomPipe ? this.canvas.height - pipe.height : 0, PIPE_WIDTH, pipe.height);
        }

        // Player status
        // circle in the centre of the player - yellow = alive, red = colliding with pipe
        this.context.beginPath();
        this.context.arc(PLAYER_X + PLAYER_WIDTH / 2, this.player.y + PLAYER_HEIGHT / 2, PLAYER_WIDTH / 6, 0, 2 * Math.PI);
        this.context.fillStyle = this.playerIsCollidingWithPipe() ? '#ff0000' : '#ffff00';
        this.context.fill();

    }

    generateAndAddPipePair(x) {
        let gap = Math.floor(Math.random() * (PIPE_GAP_RANGE[1] - PIPE_GAP_RANGE[0] + 1) + PIPE_GAP_RANGE[0]);
        let gapPosition = Math.floor(Math.random() * (PIPE_GAP_Y_RANGE[1] - PIPE_GAP_Y_RANGE[0] + 1) + PIPE_GAP_Y_RANGE[0]);

        let topHeight = gapPosition - gap / 2;
        let bottomHeight = this.canvas.height - gapPosition - gap / 2;

        let topPipe = new Pipe(x, 0, false, topHeight);
        let bottomPipe = new Pipe(x, this.canvas.height - bottomHeight, true, bottomHeight);

        this.pipes.push(topPipe, bottomPipe);
    }

    playerIsCollidingWithPipe() {
        for (const pipe of this.pipes) {
            let x = this.player.x;
            let y = this.player.y;
            let w = PLAYER_WIDTH;
            let h = PLAYER_HEIGHT;
            let px = pipe.x;
            let py = pipe.y;
            let pw = PIPE_WIDTH;
            let ph = pipe.height;

            if (x + w > px && x < px + pw && y + h > py && y < py + ph) {
                return true;
            }
        }

        return false;
    }

    playerIsOutOfBounds() {
        return this.player.y + this.player.height > this.canvas.height || this.player.y < 0;
    }

    end() {
        this.state = 'notStarted';

        this.player.velocity = 0;
        this.player.y = this.canvas.height / 2;

        // Delete all pipes
        this.pipes = [];
    }

    start() {
        this.state = 'started';
        this.score = 0;

        this.generateAndAddPipePair(GENERATE_PIPES_AT_X);
        this.generateAndAddPipePair(GENERATE_PIPES_AT_X + CANVAS_WIDTH / 2);
        this.generateAndAddPipePair(GENERATE_PIPES_AT_X + CANVAS_WIDTH);
    }
}