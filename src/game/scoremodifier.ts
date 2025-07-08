import Phaser from 'phaser';

export class ScoreModifier {

    private value: number;
    private operation: '+' | '-';
    private color: number;

    public container: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene, x: number, y: number, value: number, operation: '+' | '-', color: number){

        this.value = value;
        this.operation = operation;
        this.color = color;

        let displayObject: Phaser.GameObjects.GameObject;

        if (operation === '+') {
            // Random skyberry for positive modifiers
            const skyberryNum = Phaser.Math.Between(1, 3);
            displayObject = scene.add.sprite(0, 0, `skyberry_${skyberryNum}`).setOrigin(0.5).setScale(0.4);
        } else {
            const sourberryNum = Phaser.Math.Between(1, 3);
            displayObject = scene.add.sprite(0, 0, `sourberry_${sourberryNum}`).setOrigin(0.5).setScale(0.4);
        }

        this.container = scene.add.container(x, y, [displayObject]);
        this.container.setData('modifier', this);

        scene.physics.world.enable(this.container);
        const body = this.container.body as Phaser.Physics.Arcade.Body;
        body.setSize(30, 30);
        body.setImmovable(true);
        body.setAllowGravity(false);
    }

    public getValue(): number {
        return this.value;
    }

    calculateScore(currentScore: number): number{
        switch (this.operation) {
            case '+':
                return currentScore + this.value;
            case '-':
                return Math.max(0, currentScore - this.value);
            default:
                return currentScore;
        }
    }

    destroy(){
        this.container.destroy();
    }

    static createRandom(scene: Phaser.Scene, x: number, y: number): ScoreModifier{
        //more good than bad
        const isPositive = Math.random() < 0.7;
        const value = Phaser.Math.Between(5, 15);
        const operation = isPositive ? '+' : '-';
        const color = isPositive ? 0x00ff00 : 0xff0000;

        return new ScoreModifier(scene, x, y, value, operation, color);
    }
}