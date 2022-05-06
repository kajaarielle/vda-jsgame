class UI extends Phaser.Scene {
    constructor() {
        super({
            key: "ui",
        });
    }
    create() {
        var info = this.add.text(10, 10, 'Score: 0', { font: '48px Arial', fill: '#000000' });
    }
}