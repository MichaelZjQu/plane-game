import { Scene } from 'phaser';
import { Glider } from '../glider';
import { ScoreModifier } from '../scoremodifier';
import { GameInput } from '../gameinput';
import { GameUI } from '../gameui';
import { LaunchMechanism } from '../launchmechanism';
import { BerryManager } from '../berrymanager';


export class Game extends Scene
{   
    private gameInput: GameInput;
    private plane: Glider;
    private ui: GameUI;
    private berryManager: BerryManager;
    private launchMechanism: LaunchMechanism;

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

        

        //score calc
        this.scoreSquares = this.add.group();
        this.berryManager = new BerryManager(this, this.scoreSquares);

        //launch
        this.launchMechanism = new LaunchMechanism(this, (power, angle) => {
            this.plane.launch(power, angle);      
        });

        //plane stuff
        this.plane = new Glider(this, 0, 500, 'plane');

        this.cameras.main.startFollow(this.plane.sprite);
        this.cameras.main.setScroll(0, 0);


        this.physics.add.overlap(this.plane.sprite, this.scoreSquares, (_plane, scoreSquare) => {
            const container = scoreSquare as Phaser.GameObjects.Container;
            const modifier: ScoreModifier = container.getData('modifier');
            this.score = modifier.calculateScore(this.score);
            modifier.destroy();

            //maybe no boost for berries
            // this.plane.boost(0.4, 200);
        });
    }

    update(_time: number, delta: number) {
        if (this.launchMechanism) {
           this.launchMechanism.update();
        }
        
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
            
            this.berryManager.update(this.plane.sprite.x, this.plane.sprite.y, this.cameras.main.scrollX, this.cameras.main.scrollY);
            this.ui.update(distance, altitude, velocity, this.score, this.plane.getCurrentFuel() / this.plane.getMaxFuel());
            
            this.plane.handleInput(this.gameInput.isThrusting());

            const dt = delta / 1000;
            this.plane.update(dt);            
        }
    }
}
