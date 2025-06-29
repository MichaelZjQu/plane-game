import { Scene } from 'phaser';
import { Glider } from '../glider';
import { ScoreModifier } from '../scoremodifier';
import { GameInput } from '../gameinput';
import { GameUI } from '../gameui';
import { LaunchMechanism } from '../launchmechanism';
import { BerryManager } from '../berrymanager';
import { ScorePopup } from '../scorepopup';

export class Game extends Scene
{   
    private gameInput: GameInput;
    private plane: Glider;
    private ui: GameUI;
    private berryManager: BerryManager;
    private launchMechanism: LaunchMechanism;
    private scorePopup: ScorePopup;

    private startX: number = 100;
    private startY: number = 572;
    private score: number = 0;
    private scoreSquares!: Phaser.GameObjects.Group;

    //run end stuff
    private lastPosition: { x: number, y: number } = { x: 0, y: 0 };
    private timeSinceMovement: number = 0;
    private maxAltitude: number = 0;
    private gameEnded: boolean = false;

    private upgrades = {
        reducedDrag: 0,
        berryScore: 0,
        berryMagnet: 0,
        reducedWeight: 0,
        launchPower: 0,
        easierLaunch: 0,
        moreFuel: 0,
        berryBoost: 0
    };

    constructor ()
    {
        super('Game');
    }

    create ()
    {   
        //reset every run
        this.resetGameVariables();

        this.gameInput = new GameInput(this);
        this.ui = new GameUI(this);
        this.scorePopup = new ScorePopup(this);

        //world stuff
        this.physics.world.setBounds(0, 0, 3000, 600);
        this.physics.world.gravity.set(0,0);

        //score calc
        this.scoreSquares = this.add.group();
        this.berryManager = new BerryManager(this, this.scoreSquares);

        //launch
        this.launchMechanism = new LaunchMechanism(this, (power, angle) => {
            this.plane.launch(power, angle);
            // Reset movement tracking when launched
            this.lastPosition = { x: this.plane.sprite.x, y: this.plane.sprite.y };
            this.timeSinceMovement = 0;
            this.gameEnded = false;
        });

        //plane stuff
        this.plane = new Glider(this, 0, 560, 'plane');

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

        // Load persistent upgrades from localStorage
        this.loadUpgrades();
        
        this.applyUpgrades();
    }

    private resetGameVariables(): void {
        this.score = 0;
        this.maxAltitude = 0;
        this.timeSinceMovement = 0;
        this.gameEnded = false;
        this.lastPosition = { x: 0, y: 0 };

        this.cameras.main.setScroll(0, 0);
        this.cameras.main.setLerp(1, 1);
    }

    update(_time: number, delta: number) {
        if (this.launchMechanism) {
           this.launchMechanism.update();
        }
        
        if (this.plane.sprite.visible && !this.gameEnded) {
            //world stuff
            const body = this.plane.sprite.body as Phaser.Physics.Arcade.Body;

            const distance = Math.max(0, this.plane.sprite.x - this.startX);
            const altitude = -this.plane.sprite.y + this.startY;
            const velocity = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y);

            //endscreen calcs
            this.maxAltitude = Math.max(this.maxAltitude, altitude);

            const currentPos = { x: this.plane.sprite.x, y: this.plane.sprite.y };
            const distanceMoved = Math.sqrt(Math.pow(currentPos.x - this.lastPosition.x, 2) + Math.pow(currentPos.y - this.lastPosition.y, 2));

            if (distanceMoved > 5) { 
                this.lastPosition = currentPos;
                this.timeSinceMovement = 0;
            } else {
                this.timeSinceMovement += delta;
            }

           //game over after 2 secs - only if plane has been launched
            if (this.timeSinceMovement >= 2000 && this.plane.launched()) {
                this.endGame(distance, this.maxAltitude);
                return;
            }

            if (altitude < 272) {
                this.cameras.main.setLerp(1, 0);
            } else {
                this.cameras.main.setLerp(1, 1);
            }
            
            this.berryManager.update(this.plane.sprite.x, this.plane.sprite.y, this.cameras.main.scrollX, this.cameras.main.scrollY);
            this.ui.update(distance, altitude, velocity, this.score, this.plane.getCurrentFuel() / this.plane.getMaxFuel());
            
            this.plane.handleInput(this.gameInput.isThrusting());

            const dt = delta / 1000;
            this.plane.update(dt);            
        }
    }

    private applyUpgrades(): void {
        if (this.upgrades.reducedDrag > 0) {
            this.plane.setDragMultiplier(1 + (this.upgrades.reducedDrag * 0.1));
        }

        if (this.upgrades.reducedWeight > 0) {
            this.plane.setWeightMultiplier(1 - (this.upgrades.reducedWeight * 0.1));
        }

        if (this.upgrades.moreFuel > 0) {
            this.plane.setFuelMultiplier(1 + (this.upgrades.moreFuel * 0.2));
        }
    }

    private loadUpgrades(): void {
        try {
            const savedData = localStorage.getItem('planeGameData');
            if (savedData) {
                const data = JSON.parse(savedData);
                if (data.upgrades) {
                    this.upgrades = { ...this.upgrades, ...data.upgrades };
                }
            }
        } catch (error) {
            console.warn('Could not load upgrades:', error);
        }

        // get upgrades from data
        const sceneData = this.scene.settings.data as any;
        if (sceneData?.upgrades) {
            this.upgrades = { ...this.upgrades, ...sceneData.upgrades };
        }
    }

    private endGame(distance: number, maxAltitude: number) {
        this.gameEnded = true;
        
        // calc upgrades
        const baseScoreBonus = this.score * (1 + (this.upgrades.berryScore * 0.5));
        const distanceBonus = Math.floor(distance / 100) * 2;
        const altitudeBonus = Math.floor(maxAltitude / 100) * 5;
        const totalMoney = Math.floor(baseScoreBonus + distanceBonus + altitudeBonus);
        
        this.scorePopup.show(this.score, distance, maxAltitude, () => {
            this.scene.start('Upgrade', { money: totalMoney, upgrades: this.upgrades });
        });
    }
}
