import Phaser from 'phaser';

export class ScoreModifier {

    private value: number;
    private operation: '+' | '-' | 'x';
    private color: number;

    public container: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene, x: number, y: number, value: number, operation: '+' | '-' | 'x', color: number){

        this.value = value;
        this.operation = operation;
        this.color = color;

        let displayObject: Phaser.GameObjects.GameObject;

        if (operation === '+') {
            // Random skyberry for positive modifiers
            const skyberryNum = Phaser.Math.Between(1, 3);
            displayObject = scene.add.sprite(0, 0, `skyberry_${skyberryNum}`).setOrigin(0.5).setScale(0.4);
        } else if (operation === '-') {
            const sourberryNum = Phaser.Math.Between(1, 3);
            displayObject = scene.add.sprite(0, 0, `sourberry_${sourberryNum}`).setOrigin(0.5).setScale(0.4);
        } else {
            displayObject = scene.add.rectangle(0, 0, 30, 30, this.color).setOrigin(0.5);
        }


        this.container = scene.add.container(x, y, [displayObject]);
        this.container.setData('modifier', this);

        scene.physics.world.enable(this.container);
        const body = this.container.body as Phaser.Physics.Arcade.Body;
        body.setSize(30, 30);
        body.setImmovable(true);
        body.setAllowGravity(false);
    }

    calculateScore(currentScore: number): number{
        switch (this.operation) {
            case '+':
                return currentScore + this.value;
            case '-':
                return Math.max(0, currentScore - this.value);
            case 'x':
                return currentScore * this.value;
            default:
                return currentScore;
        }
    }

    destroy(){
        this.container.destroy();
    }

    static createRandom(scene: Phaser.Scene, x: number, y:number): ScoreModifier{
        const values = [10, 5, 1.2];
        const operations = ['+', '-', 'x'] as const;
        const colors = [0x00ff00, 0xff0000, 0x0000ff];

        const num = Phaser.Math.Between(0,2);

        return new ScoreModifier(scene, x, y, values[num], operations[num], colors[num]);
    }


}