import { Scene } from 'phaser';

export class Intro extends Scene{

    constructor() {
        super('Intro');
    }

    create(){
        let currentState = 0;

        const topLeft = this.add.graphics().fillStyle(0xffffff).fillTriangle(0, 0, 675, 0, 0, 700);
        const bottomRight = this.add.graphics().fillStyle(0xffffff).fillTriangle(0, 700, 800, 700, 800, -130);
        
        
        const topLeftImage = this.add.image(400, 300, 'intro').setOrigin(0.5);
        const bottomRightImage = this.add.image(400, 300, 'intro').setOrigin(0.5);
        topLeftImage.setMask(topLeft.createGeometryMask());
        bottomRightImage.setMask(bottomRight.createGeometryMask());

        bottomRightImage.setAlpha(0.1);

        const skipText = this.add.text(400, 550, 'Click to continue', {fontSize: '18px', color: '#ffffff'}).setOrigin(0.5);

        
        this.input.on('pointerdown', () => {
            if (currentState === 0) {
                topLeftImage.setAlpha(0.1);
                bottomRightImage.setAlpha(1);
                skipText.setText('Click to continue');
                currentState = 1;
            } else {
                
                this.scene.start('Game');
            }
        });

        // Handle keyboard
        this.input.keyboard!.on('keydown', () => {
            this.input.emit('pointerdown');
        });

    }


}