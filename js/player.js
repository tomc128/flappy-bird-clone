const JUMP_SPEED = 300;

export class Player {

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocity = 0;
        
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.key == ' ') {
                this.jump();
            }
        });
        document.addEventListener('touchstart', (e) => {
            this.jump();
        });
        document.addEventListener('mousedown', (e) => {
            this.jump();
        });
    }

    jump() {
        this.velocity = -JUMP_SPEED;
    }
}