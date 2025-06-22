import { Scene } from 'phaser';
import { ScoreModifier } from './scoremodifier';

export class BerryManager {
    private scene: Scene;
    private berries: Phaser.GameObjects.Group;
    private generatedScreens: Set<string> = new Set();

    constructor(scene: Scene, berries: Phaser.GameObjects.Group) {
        this.scene = scene;
        this.berries = berries;
    }

    public update(planeX: number, planeY: number, cameraX: number, cameraY: number): void {
        //same as clouds
        
        const currentScreenX = Math.floor(cameraX / 800);
        const currentScreenY = Math.floor(cameraY / 600);

        for (let x = currentScreenX - 1; x <= currentScreenX + 2; x++) {
            for (let y = currentScreenY - 1; y <= currentScreenY + 2; y++) {
                if (x === currentScreenX && y === currentScreenY) continue;
                
                this.generateBerriesForScreen(x, y);
            }
        }

        this.cleanupOldBerries(currentScreenX, currentScreenY);
    }

    private generateBerriesForScreen(screenX: number, screenY: number): void {
        const key = `${screenX},${screenY}`;

        if (this.generatedScreens.has(key)) {
            return;
        }

        // no berries initial or behind
        if (screenX <= 0 && screenY === 0) {
            this.generatedScreens.add(key); 
            return;
        }

        this.generatedScreens.add(key);

        const berryCount = Phaser.Math.Between(8, 15);
        const groundLevel = 500;

        for (let i = 0; i < berryCount; i++) {
            const x = screenX * 800 + Phaser.Math.Between(0, 800);
            let y = screenY * 600 + Phaser.Math.Between(0, 600);

            if (y >= groundLevel - 100) {
                continue; 
            }

            const altitude = groundLevel - y;
            const isHighAltitude = altitude > 300;
            
            let berry: ScoreModifier;
            if (isHighAltitude) {
                berry = Math.random() < 0.8 ? 
                    this.createPositiveBerry(x, y, altitude) : 
                    ScoreModifier.createRandom(this.scene, x, y);
            } else {
                berry = ScoreModifier.createRandom(this.scene, x, y);
            }
            
            this.berries.add(berry.container);
        }
    }

    private createPositiveBerry(x: number, y: number, altitude: number): ScoreModifier {
        const baseValue = 5;
        const altitudeBonus = Math.floor(altitude / 100) * 2; 
        const value = Math.min(baseValue + altitudeBonus, 25); 
        
        return new ScoreModifier(this.scene, x, y, value, '+', 0x00ff00);
    }

    private cleanupOldBerries(currentScreenX: number, currentScreenY: number): void {
        this.berries.children.entries.forEach(berry => {
            const container = berry as Phaser.GameObjects.Container;
            const berryScreenX = Math.floor(container.x / 800);
            const berryScreenY = Math.floor(container.y / 600);
            
            const distanceX = Math.abs(berryScreenX - currentScreenX);
            const distanceY = Math.abs(berryScreenY - currentScreenY);
            
            if (distanceX > 2 || distanceY > 2) {
                const modifier: ScoreModifier = container.getData('modifier');
                modifier.destroy();
            }
        });

        // cleanup
        const screensToRemove: string[] = [];
        this.generatedScreens.forEach(screenKey => {
            const [x, y] = screenKey.split(',').map(Number);
            if (Math.abs(x - currentScreenX) > 3 || Math.abs(y - currentScreenY) > 3) {
                screensToRemove.push(screenKey);
            }
        });

        screensToRemove.forEach(key => {
            this.generatedScreens.delete(key);
        });
    }
}