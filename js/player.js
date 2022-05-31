const JUMP_SPEED = 300;

export class Player {
    position;
    velocity = 0;
    height = 25;
    width = 25;

    constructor(position) {
        this.position = position;
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