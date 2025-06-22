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

        const allElements = [topLeftImage, bottomRightImage, skipText, topLeft, bottomRight];
        allElements.forEach(element => element.setAlpha(0));

        // fade anim
        this.tweens.add({
            targets: [topLeftImage, skipText, topLeft, bottomRight],
            alpha: { from: 0, to: 1 },
            duration: 1000,
            ease: 'Power2.easeOut'
        });

        this.tweens.add({
            targets: bottomRightImage,
            alpha: { from: 0, to: 0.1 },
            duration: 1000,
            ease: 'Power2.easeOut'
        });

        
        this.input.on('pointerdown', () => {
            if (currentState === 0) {
                this.tweens.add({
                    targets: topLeftImage,
                    alpha: 0.1,
                    duration: 800,
                    ease: 'Power2.easeOut'
                });
                
                this.tweens.add({
                    targets: bottomRightImage,
                    alpha: 1,
                    duration: 800,
                    ease: 'Power2.easeOut'
                });

                skipText.setText('Click to continue to game');
                currentState = 1;
            } else {
                this.tweens.add({
                    targets: allElements,
                    alpha: 0,
                    duration: 800,
                    ease: 'Power2.easeIn',
                    onComplete: () => {
                        this.scene.start('Game');
                    }
                });
            }
        });

        // Handle keyboard
        this.input.keyboard!.on('keydown', () => {
            this.input.emit('pointerdown');
        });

    }


}