export class Player {
    position = 200;
    velocity = 0;
    height = 50;
    width = 50;

    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.key == ' ') {
                this.jump();
            }
        });
    }

    jump() {
        this.position -= 10;
    }
}