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
    private cityLayer3: Phaser.GameObjects.TileSprite;
    private lastCX: number = 0;
    private lastCY: number = 0;

    private clouds: Phaser.GameObjects.Image[] = [];
    private generatedScreens: Set<string> = new Set();

    constructor(scene: Scene) {
        this.scene = scene;
        this.createUI();
    }

    private createUI(): void {
        this.scene.cameras.main.setBackgroundColor('#9bf4fc');

        //bg layers
        this.cityLayer1 = this.scene.add.tileSprite(0, 0, 800, 600, 'city_1').setOrigin(0, 0).setScrollFactor(0).setDepth(-3);
        this.cityLayer2 = this.scene.add.tileSprite(0, 0, 800, 600, 'city_2').setOrigin(0, 0).setScrollFactor(0).setDepth(-2);
        this.cityLayer3 = this.scene.add.tileSprite(0, 0, 800, 600, 'city_3').setOrigin(0, 0).setScrollFactor(0).setDepth(-1);
        //floor
        this.scene.add.rectangle(0, 580, 800, 100, 0xcccccc).setOrigin(0, 0).setScrollFactor(0);
        



        this.altitudeText = this.scene.add.text(780, 50, 'Altitude: 0m', {fontSize: '24px', color: '#000000'}).setOrigin(1, 0).setScrollFactor(0);
        this.distanceText = this.scene.add.text(780, 20, 'Distance: 0m', {fontSize: '24px', color: '#000000'}).setOrigin(1, 0).setScrollFactor(0);
        this.scoreText = this.scene.add.text(20, 20, 'Score: 0', {fontSize: '24px', color: '#000000'}).setOrigin(0, 0).setScrollFactor(0);
        this.velocityText = this.scene.add.text(780, 80, 'Velocity: 0', {fontSize: '24px', color: '#000000'}).setOrigin(1, 0).setScrollFactor(0);
        

        this.fuelBarBg = this.scene.add.rectangle(20, 70, 200, 20, 0x333333).setOrigin(0, 0).setScrollFactor(0);
        this.fuelBarFill = this.scene.add.rectangle(22, 72, 196, 16, 0x00ff00).setOrigin(0, 0).setScrollFactor(0);
        this.fuelText = this.scene.add.text(20, 95, 'Fuel: 100%', {fontSize: '18px', color: '#000000'}).setOrigin(0, 0).setScrollFactor(0);
    }

    private generateClouds(screenX: number, screenY: number): void {
        const key = `${screenX},${screenY}`;

        if (this.generatedScreens.has(key)){
            return;
        }

        this.generatedScreens.add(key);


        let numClouds = 0; 
        
        if(screenY == 0) numClouds = Phaser.Math.Between(1, 2);
        else if(screenY <=0) numClouds = Phaser.Math.Between(3, 4);


        for (let i = 0; i < numClouds; i++) {
            const x = screenX * 800 + Phaser.Math.Between(0, 800);
            let y;
            if (screenY == 0) {
                y = screenY * 600 + Phaser.Math.Between(0, 300);
            } else {
                
                y = screenY * 600 + Phaser.Math.Between(0, 600);
            }
            
            const cloud = this.scene.add.image(x, y, 'cloud_1')
                .setOrigin(0.5)
                .setScale(Phaser.Math.FloatBetween(0.4, 1.0))
                .setAlpha(Phaser.Math.FloatBetween(0.5, 0.7))
                .setDepth(0);

            this.clouds.push(cloud);
        }

    }

    private manageClouds(): void {
        const camera = this.scene.cameras.main;
        const cameraX = camera.scrollX;
        const cameraY = camera.scrollY;

        const currentScreenX = Math.floor(cameraX / 800);
        const currentScreenY = Math.floor(cameraY / 600);

        for (let x = currentScreenX - 1; x <= currentScreenX + 1; x++) {
            for (let y = currentScreenY - 1; y <= currentScreenY + 1; y++) {
                this.generateClouds(x, y);
            }
        }

        this.clouds = this.clouds.filter(cloud => {
            const distanceX = Math.abs(cloud.x - cameraX);
            const distanceY = Math.abs(cloud.y - cameraY);
            
            if (distanceX > 1600 || distanceY > 1200) { // 2 screens away
                cloud.destroy();
                return false;
            }
            return true;
        });

        const screensToRemove: string[] = [];
        this.generatedScreens.forEach(screenKey => {
            const [x, y] = screenKey.split(',').map(Number);
            if (Math.abs(x - currentScreenX) > 2 || Math.abs(y - currentScreenY) > 2) {
                screensToRemove.push(screenKey);
            }
        });
        screensToRemove.forEach(key => this.generatedScreens.delete(key));
    
    }

    public update(dist: number, alt: number, vel: number, score: number, fuel: number): void{
        this.manageClouds();


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
        this.cityLayer3.tilePositionX += dX * 0.8;

        this.cityLayer1.y -= dY; 
        this.cityLayer2.y -= dY; 
        this.cityLayer3.y -= dY;

        this.lastCX = cX;
        this.lastCY = cY;

        
    }
}