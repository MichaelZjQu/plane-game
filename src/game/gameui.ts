import { Scene } from "phaser";

export class GameUI {
    private scene: Scene;

    private altitudeText: Phaser.GameObjects.Text;
    private distanceText: Phaser.GameObjects.Text;
    private scoreText: Phaser.GameObjects.Text;
    private velocityText: Phaser.GameObjects.Text;
    private fuelText: Phaser.GameObjects.Text;

    private fuelBarBg: Phaser.GameObjects.Rectangle;
    private fuelBarFill: Phaser.GameObjects.Rectangle;

    private cityLayer1: Phaser.GameObjects.TileSprite;
    private cityLayer2: Phaser.GameObjects.TileSprite;
    private lastCX: number = 0;
    private lastCY: number = 0;

    constructor(scene: Scene) {
        this.scene = scene;
        this.createUI();
    }

    private createUI(): void {
        this.scene.cameras.main.setBackgroundColor('#9bf4fc');

        //bg layers
        this.cityLayer1 = this.scene.add.tileSprite(0, 0, 800, 600, 'city_1').setOrigin(0, 0).setScrollFactor(0).setDepth(-3);
        this.cityLayer2 = this.scene.add.tileSprite(0, 0, 800, 600, 'city_2').setOrigin(0, 0).setScrollFactor(0).setDepth(-2);
        
        



        this.altitudeText = this.scene.add.text(780, 50, 'Altitude: 0m', {fontSize: '24px', color: '#000000'}).setOrigin(1, 0).setScrollFactor(0);
        this.distanceText = this.scene.add.text(780, 20, 'Distance: 0m', {fontSize: '24px', color: '#000000'}).setOrigin(1, 0).setScrollFactor(0);
        this.scoreText = this.scene.add.text(20, 20, 'Score: 0', {fontSize: '24px', color: '#000000'}).setOrigin(0, 0).setScrollFactor(0);
        this.velocityText = this.scene.add.text(780, 80, 'Velocity: 0', {fontSize: '24px', color: '#000000'}).setOrigin(1, 0).setScrollFactor(0);
        

        this.fuelBarBg = this.scene.add.rectangle(20, 70, 200, 20, 0x333333).setOrigin(0, 0).setScrollFactor(0);
        this.fuelBarFill = this.scene.add.rectangle(22, 72, 196, 16, 0x00ff00).setOrigin(0, 0).setScrollFactor(0);
        this.fuelText = this.scene.add.text(20, 95, 'Fuel: 100%', {fontSize: '18px', color: '#000000'}).setOrigin(0, 0).setScrollFactor(0);
    }

    public update(dist: number, alt: number, vel: number, score: number, fuel: number): void{
        this.distanceText.setText(`Distance: ${Math.floor(dist)}m`);
        this.altitudeText.setText(`Altitude: ${Math.floor(alt)}m`);            
        this.velocityText.setText(`Velocity: ${Math.floor(vel)}`);
        this.scoreText.setText(`Score: ${score}`);
        
        //fuel
        this.fuelText.setText(`Fuel: ${Math.floor(fuel * 100)}%`);

        const fuelWidth = 196*fuel;
        this.fuelBarFill.setSize(fuelWidth, 16);

        if (fuel > 0.5) {
            this.fuelBarFill.setFillStyle(0x00ff00); // green
        } else if (fuel > 0.25) {
            this.fuelBarFill.setFillStyle(0xffff00); // yellow
        } else {
            this.fuelBarFill.setFillStyle(0xff0000); // red
        }


        //scrolling bg
        const camera = this.scene.cameras.main;
        const cX = camera.scrollX;
        const cY = camera.scrollY;
        const dX = cX - this.lastCX;
        const dY = cY - this.lastCY;

        this.cityLayer1.tilePositionX += dX * 0.2; 
        this.cityLayer2.tilePositionX += dX * 0.5; 

        this.cityLayer1.y -= dY; 
        this.cityLayer2.y -= dY; 

        this.lastCX = cX;
        this.lastCY = cY;
    }
}