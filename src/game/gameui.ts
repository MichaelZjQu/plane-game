import { Scene } from "phaser";

export class GameUI {
    private scene: Scene;


    private altitudeContainer: Phaser.GameObjects.Container;
    private distanceContainer: Phaser.GameObjects.Container;
    private velocityContainer: Phaser.GameObjects.Container;
    private fuelText: Phaser.GameObjects.Text;



    private fuelBarFill: Phaser.GameObjects.Rectangle;

    private cityLayer1: Phaser.GameObjects.TileSprite;
    private cityLayer2: Phaser.GameObjects.TileSprite;
    private cityLayer3: Phaser.GameObjects.TileSprite;
    private lastCX: number = 0;
    private lastCY: number = 0;

    private road: Phaser.GameObjects.TileSprite;

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
        this.road = this.scene.add.tileSprite(0, 522, 800, 78, 'road').setOrigin(0, 0).setScrollFactor(0);
        
        this.scene.add.image(140, 80, 'feather_container').setOrigin(0.5, 0.5).setScrollFactor(0).setScale(0.4).setDepth(1);
        this.scene.add.image(400, 80, 'feather_container').setOrigin(0.5, 0.5).setScrollFactor(0).setScale(0.4).setDepth(1);
        this.scene.add.image(660, 80, 'feather_container').setOrigin(0.5, 0.5).setScrollFactor(0).setScale(0.4).setDepth(1);

        this.distanceContainer = this.createTextSprites(150, 75, 'Distance\n0m', 0.5, 0.5, 0.1).setDepth(1);
        this.velocityContainer = this.createTextSprites(410, 75, 'Velocity\n0', 0.5, 0.5, 0.1).setDepth(1);
        this.altitudeContainer = this.createTextSprites(670, 75, 'Altitude\n0m', 0.5, 0.5, 0.1).setDepth(1);

        const roundedRect = this.scene.add.graphics().setScrollFactor(0).setDepth(2);
        roundedRect.fillStyle(0x000000, 0.7); 
        roundedRect.fillRoundedRect(10, 510, 200, 80, 15); 

        this.scene.add.rectangle(20, 520, 160, 16, 0x333333).setOrigin(0, 0).setScrollFactor(0).setDepth(3);
        this.fuelBarFill = this.scene.add.rectangle(22, 522, 156, 12, 0x00ff00).setOrigin(0, 0).setScrollFactor(0).setDepth(3);
        this.fuelText = this.scene.add.text(20, 545, 'Fuel: 100%', {fontSize: '16px', color: '#ffffff'}).setOrigin(0, 0).setScrollFactor(0).setDepth(3);
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

        this.updateTextSprites(this.distanceContainer, `Distance\n${Math.floor(dist / 10)}m`, 0.1);
        this.updateTextSprites(this.altitudeContainer, `Altitude\n${Math.floor(alt / 10)}m`, 0.1);            
        this.updateTextSprites(this.velocityContainer, `Velocity\n${Math.floor(vel / 10)}`, 0.1);

        //fuel
        this.fuelText.setText(`Fuel: ${Math.floor(fuel * 100)}%`);

        const fuelWidth = 156*fuel;
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
        this.road.tilePositionX += dX;

        this.cityLayer1.y -= dY; 
        this.cityLayer2.y -= dY; 
        this.cityLayer3.y -= dY;
        this.road.y -= dY;

        this.lastCX = cX;
        this.lastCY = cY;

        
    }


    public createTextSprites(x: number, y: number, text: string, originX: number, originY: number, labelScale: number = 0.15, valueScale: number = 0.18, extraSpacing: number = 0): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y).setScrollFactor(0);
        
        const lines = text.split('\n');
        let currentY = 0;
        const labelLineHeight = 210 * labelScale;
        const valueLineHeight = 210 * valueScale;

        let totalHeight = 0;
        if (lines.length > 1) {
            totalHeight = labelLineHeight + valueLineHeight;
        }
        currentY = -totalHeight / 2;
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const isLabel = lineIndex === 0; 
            const scale = isLabel ? labelScale : valueScale;
            let currentX = 0;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i].toLowerCase();
                let spriteKey: string | null = null;
                
                if (char >= 'a' && char <= 'z') {
                    spriteKey = `char_${char}`;
                } else if (char >= '0' && char <= '9') {
                    spriteKey = `char_${char}`;
                } else if (char === ' ') {
                    currentX += 20 * scale + extraSpacing;
                    continue;
                } else if (char === ':') {
                    spriteKey = 'char_colon';
                } else if (char === '%') {
                    spriteKey = 'char_percent';
                }
                
                if (spriteKey && this.scene.textures.exists(spriteKey)) {
                    const sprite = this.scene.add.image(currentX, currentY, spriteKey).setOrigin(0, 0).setScale(scale);

                    container.add(sprite);
                    currentX += sprite.displayWidth + extraSpacing;
                } else {
                    currentX += 10 * scale + extraSpacing;
                }
            }
            
            // center
            const lineWidth = currentX - extraSpacing;
            const lineSprites = container.list.slice(-line.length);
            lineSprites.forEach(sprite => {
                if (sprite instanceof Phaser.GameObjects.Image) {
                    sprite.x -= lineWidth / 2;
                }
            });
            
            currentY += isLabel ? labelLineHeight : valueLineHeight;
        }
        
        return container;
    }

    public updateTextSprites(container: Phaser.GameObjects.Container, newText: string, labelScale: number = 0.1, valueScale: number = 0.18, extraSpacing: number = 0): void {
        container.removeAll(true);
        
        const lines = newText.split('\n');
        let currentY = 0;
        const labelLineHeight = 210 * labelScale;
        const valueLineHeight = 210 * valueScale;

        let totalHeight = 0;
        if (lines.length > 1) {
            totalHeight = labelLineHeight + valueLineHeight;
        }
        currentY = -totalHeight / 2;
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const isLabel = lineIndex === 0; 
            const scale = isLabel ? labelScale : valueScale;
            let currentX = 0;
            const lineSprites: Phaser.GameObjects.Image[] = [];
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i].toLowerCase();
                let spriteKey: string | null = null;
                
                if (char >= 'a' && char <= 'z') {
                    spriteKey = `char_${char}`;
                } else if (char >= '0' && char <= '9') {
                    spriteKey = `char_${char}`;
                } else if (char === ' ') {
                    currentX += 20 * scale + extraSpacing;
                    continue;
                } else if (char === ':') {
                    spriteKey = 'char_colon';
                } else if (char === '%') {
                    spriteKey = 'char_percent';
                }
                
                if (spriteKey && this.scene.textures.exists(spriteKey)) {
                    const sprite = this.scene.add.image(currentX, currentY, spriteKey).setOrigin(0, 0).setScale(scale);
                    
                    container.add(sprite);
                    lineSprites.push(sprite);
                    currentX += sprite.displayWidth + extraSpacing;
                } else {
                    currentX += 10 * scale + extraSpacing;
                }
            }
            
            const lineWidth = currentX - extraSpacing;
            lineSprites.forEach(sprite => {
                sprite.x -= lineWidth / 2;
            });
            
            currentY += isLabel ? labelLineHeight : valueLineHeight;
        }
    }
}