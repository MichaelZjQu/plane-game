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

        const square = scene.add.rectangle(0, 0, 30, 30, this.color).setOrigin(0.5);
        const text = scene.add.text(0, 0, `${this.operation}${this.value}`, { fontSize: '16px', color: '#000' }).setOrigin(0.5, 0.5);

        this.container = scene.add.container(x, y, [square, text]);
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