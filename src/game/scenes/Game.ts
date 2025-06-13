import { Scene } from 'phaser';
import { Glider } from '../glider';

interface ScoreModifier { 
    value: number;
    operation: '+' | '-' | 'x';
    color: number;
}

export class Game extends Scene
{   

    private readonly ROTATION_SPEED: number = 0.03;
    

    private plane!: Glider;
    private floor!: Phaser.GameObjects.Rectangle;
    private launchButton!: Phaser.GameObjects.Container;
    private isOnGround: boolean = false;

    private altitudeText!: Phaser.GameObjects.Text;
    private distanceText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private startX: number = 100;
    private startY: number = 100;
    private score: number = 0;

    private scoreSquares!: Phaser.GameObjects.Group;

    AKey: Phaser.Input.Keyboard.Key; SKey: Phaser.Input.Keyboard.Key; LeftKey: Phaser.Input.Keyboard.Key; RightKey: Phaser.Input.Keyboard.Key;

    


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
        this.physics.world.gravity.set(0,0);

        this.add.rectangle(0, 0, 3000, 600, 0x028af8).setOrigin(0, 0);

        this.floor = this.add.rectangle(0, 580, 3000, 20, 0x00ff00).setOrigin(0, 0);
        this.physics.add.existing(this.floor, true);

        this.launchButton = this.add.container(400, 500).setScrollFactor(0);
        const buttonBg = this.add.rectangle(0, 0, 160, 40, 0x00ff00).setInteractive();
        this.launchButton.add([buttonBg, this.add.text(0, 0, 'Launch', {fontSize: '20px', color: '#000'}).setOrigin(0.5)])

        buttonBg.on('pointerdown', () => {
            this.plane.sprite.setVisible(true);
            (this.plane.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(1000, -300);
            this.cameras.main.startFollow(this.plane.sprite);
            this.launchButton.destroy();
        });


        this.altitudeText = this.add.text(780, 50, 'Altitude: 0m', {fontSize: '24px', color: '#ffffff'}).setOrigin(1, 0).setScrollFactor(0);
        this.distanceText = this.add.text(780, 20, 'Distance: 0m', {fontSize: '24px', color: '#ffffff'}).setOrigin(1, 0).setScrollFactor(0);
        this.scoreText = this.add.text(20, 20, 'Score: 0', {fontSize: '24px', color: '#ffffff'}).setOrigin(0, 0).setScrollFactor(0);
        


        //plane stuff
        this.plane = new Glider(this, 400, 300, 'plane');
        this.plane.sprite.setVisible(false);
        // this.plane.setAngle(- Math.PI / 6);    

        this.physics.add.collider(this.plane.sprite, this.floor, () => {this.isOnGround = true; this.plane.sprite.setAngle(0);});

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

        this.physics.add.overlap(this.plane.sprite, this.scoreSquares, (_plane, scoreSquare) => {
            const container = scoreSquare as Phaser.GameObjects.Container;
            const modifier: ScoreModifier = container.getData('modifier');
            this.score = this.calculateScore(this.score, modifier);
            container.destroy();
            this.scoreText.setText(`Score: ${this.score}`);
        });

        //input
        this.AKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.SKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.LeftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.RightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);


        

        
    }

    update(_time: number, delta: number) {
        if (this.plane.sprite.visible) {
            
            //world stuff
            const distance = Math.max(0, this.plane.sprite.x - this.startX);
            const altitude = -this.plane.sprite.y + 3*this.startY;
            
            this.altitudeText.setText(`Altitude: ${Math.floor(altitude)}m`);
            this.distanceText.setText(`Distance: ${Math.floor(distance)}m`);
            this.scoreText.setText(`Score: ${this.score}`);
            
            const body = this.plane.sprite.body as Phaser.Physics.Arcade.Body;


            const dt = delta / 1000;
            this.plane.update(dt);
        
           

            
            
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
