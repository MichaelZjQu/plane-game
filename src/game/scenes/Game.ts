import { Scene } from 'phaser';
import { Glider } from '../glider';
import { ScoreModifier } from '../scoremodifier';
import { GameInput } from '../gameinput';
import { GameUI } from '../gameui';


export class Game extends Scene
{   
    private gameInput: GameInput;

    private plane: Glider;
    private floor: Phaser.GameObjects.Rectangle;
    private launchButton: Phaser.GameObjects.Container;
    private isOnGround: boolean = false;

    private ui: GameUI;

    private startX: number = 100;
    private startY: number = 572;
    private score: number = 0;

    private scoreSquares!: Phaser.GameObjects.Group;


    


    constructor ()
    {
        super('Game');
    }

    create ()
    {   
        this.gameInput = new GameInput(this);
        this.ui = new GameUI(this);

        //world stuff
        this.physics.world.setBounds(0, 0, 3000, 600);
        this.physics.world.gravity.set(0,0);

        // this.add.rectangle(0, 0, 3000, 600, 0x028af8).setOrigin(0, 0);

        this.launchButton = this.add.container(400, 500).setScrollFactor(0);
        const buttonBg = this.add.rectangle(0, 0, 160, 40, 0x00ff00).setInteractive();
        this.launchButton.add([buttonBg, this.add.text(0, 0, 'Launch', {fontSize: '20px', color: '#000'}).setOrigin(0.5)])

        buttonBg.on('pointerdown', () => {
            this.plane.sprite.setVisible(true);
            (this.plane.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(500, -400);
            this.cameras.main.startFollow(this.plane.sprite);
            this.cameras.main.setScroll(0, 0);
            this.launchButton.destroy();
        });


        //game ui


        //plane stuff
        this.plane = new Glider(this, 0, 500, 'plane');
        this.plane.sprite.setVisible(false);
        

        //score calc
        this.scoreSquares = this.add.group();

        for(let i = 0; i < 20; i++){
            const x = Phaser.Math.Between(400, 2800);
            const y = Phaser.Math.Between(100, 500);
            const modifier = ScoreModifier.createRandom(this, x, y);
            this.scoreSquares.add(modifier.container);
        }

        this.physics.add.overlap(this.plane.sprite, this.scoreSquares, (_plane, scoreSquare) => {
            const container = scoreSquare as Phaser.GameObjects.Container;
            const modifier: ScoreModifier = container.getData('modifier');
            this.score = modifier.calculateScore(this.score);
            modifier.destroy();

            this.plane.boost(0.4, 200);
        });


        

        
    }

    update(_time: number, delta: number) {
        if (this.plane.sprite.visible) {
            
            //world stuff
            const body = this.plane.sprite.body as Phaser.Physics.Arcade.Body;

            const distance = Math.max(0, this.plane.sprite.x - this.startX);
            const altitude = -this.plane.sprite.y + this.startY;
            const velocity = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y);

            if(altitude < 272 ){
                this.cameras.main.setLerp(1, 0);
            }
            else{
                this.cameras.main.setLerp(1, 1);
            }
            
            
            this.ui.update(distance, altitude, velocity, this.score, this.plane.getCurrentFuel() / this.plane.getMaxFuel());
            
            
            
            this.plane.handleInput(this.gameInput.isThrusting());

            const dt = delta / 1000;
            this.plane.update(dt);
        
           

            
            
            

            this.isOnGround = false;
            
        }
    }
}
