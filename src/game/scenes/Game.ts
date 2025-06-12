import { Scene } from 'phaser';

interface ScoreModifier { 
    value: number;
    operation: '+' | '-' | 'x';
    color: number;
}

export class Game extends Scene
{
    private plane!: Phaser.GameObjects.Rectangle;
    private floor!: Phaser.GameObjects.Rectangle;
    private launchButton!: Phaser.GameObjects.Container;
    private isOnGround: boolean = false;
    private distanceText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private startX: number = 100;
    private score: number = 0;

    private scoreSquares!: Phaser.GameObjects.Group;


    constructor ()
    {
        super('Game');
    }

    createScoreSquare(x: number, y: number, modifier: ScoreModifier){
        const square = this.add.rectangle(0, 0, 30, 30, modifier.color).setOrigin(0.5);

        const text = this.add.text(0, 0, `${modifier.operation}${modifier.value}`, { fontSize: '16px', color: '#000' }).setOrigin(0.5, 0.5);

        const container = this.add.container(x, y, [square, text]);
        container.setData('modifier', modifier);

        this.physics.world.enable(container);
        const body = container.body as Phaser.Physics.Arcade.Body;
        body.setSize(30, 30);
        body.setImmovable(true);
        body.setAllowGravity(false);

        this.scoreSquares.add(container);
        return container;
    }

    calculateScore(currentScore: number, modifier: ScoreModifier) {
        switch (modifier.operation) {
            case '+':
                return currentScore + modifier.value;
            case '-':
                return Math.max(0, currentScore - modifier.value);
            case 'x':
                return currentScore * modifier.value;
            default:
                return currentScore;
        }
    }
    create ()
    {
        //world stuff
        this.physics.world.setBounds(0, 0, 3000, 600);
        this.physics.world.gravity.y = 300;

        this.add.rectangle(0, 0, 3000, 600, 0x028af8).setOrigin(0, 0);

        this.floor = this.add.rectangle(0, 580, 3000, 20, 0x00ff00).setOrigin(0, 0);
        this.physics.add.existing(this.floor, true);

        this.launchButton = this.add.container(400, 500).setScrollFactor(0);
        const buttonBg = this.add.rectangle(0, 0, 160, 40, 0x00ff00).setInteractive();
        this.launchButton.add([buttonBg, this.add.text(0, 0, 'Launch', {fontSize: '20px', color: '#000'}).setOrigin(0.5)])

        buttonBg.on('pointerdown', () => {
            this.plane.setVisible(true);
            (this.plane.body as Phaser.Physics.Arcade.Body).setVelocity(300, -400);
            this.cameras.main.startFollow(this.plane);
            this.launchButton.destroy();
        });

        this.distanceText = this.add.text(780, 20, 'Distance: 0m', {fontSize: '24px', color: '#ffffff'}).setOrigin(1, 0).setScrollFactor(0);
        this.scoreText = this.add.text(20, 20, 'Score: 0', {fontSize: '24px', color: '#ffffff'}).setOrigin(0, 0).setScrollFactor(0);


        //plane stuff
        this.plane = this.add.rectangle(100, 300, 64, 32, 0xffffff);
        this.physics.add.existing(this.plane);
        this.plane.setVisible(false);    

        this.physics.add.collider(this.plane, this.floor, () => {this.isOnGround = true});

        //score calc
        this.scoreSquares = this.add.group();

        const modifers: ScoreModifier[] = [
            { value: 10, operation: '+', color: 0x00ff00 },
            { value: 5, operation: '-', color: 0xff0000 },
            { value: 1.2, operation: 'x', color: 0x0000ff }
        ];

        for(let i = 0; i < 20; i++){
            const x = Phaser.Math.Between(400, 2800);
            const y = Phaser.Math.Between(100, 500);
            const modifier = Phaser.Utils.Array.GetRandom(modifers);
            this.createScoreSquare(x, y, modifier);
        }

        this.physics.add.overlap(this.plane, this.scoreSquares, (_plane, scoreSquare) => {
            const container = scoreSquare as Phaser.GameObjects.Container;
            const modifier: ScoreModifier = container.getData('modifier');
            this.score = this.calculateScore(this.score, modifier);
            container.destroy();
            this.scoreText.setText(`Score: ${this.score}`);
        });

        
    }

    update() {
        if (this.plane.visible) {
            const distance = Math.max(0, this.plane.x - this.startX);
            this.distanceText.setText(`Distance: ${Math.floor(distance)}m`);
            this.scoreText.setText(`Score: ${this.score}`);

            this.plane.rotation = Math.atan2(
                (this.plane.body as Phaser.Physics.Arcade.Body).velocity.y,
                (this.plane.body as Phaser.Physics.Arcade.Body).velocity.x
            );
            const body = this.plane.body as Phaser.Physics.Arcade.Body;
            if(this.isOnGround){
                body.setVelocityX(body.velocity.x * 0.97)
                if(Math.abs(body.velocity.x) < 10){
                    body.setVelocityX(0);
                }
            }

            this.isOnGround = false;
            
        }
    }
}
