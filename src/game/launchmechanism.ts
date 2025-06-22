import { Scene } from 'phaser';

export class LaunchMechanism {
    private scene: Scene;
    private arc: Phaser.GameObjects.Graphics;
    private indicator: Phaser.GameObjects.Graphics;
    private angle: number = 0;
    private direction: number = 1;
    private speed: number = 2;
    private isActive: boolean = true;
    private onLaunch: (power: number, angle: number) => void;
    
    constructor(scene: Scene, onLaunch: (power: number, angle: number) => void) {
        this.scene = scene;
        this.onLaunch = onLaunch;
        this.create();
    }

    private create(): void {
        this.arc = this.scene.add.graphics().setScrollFactor(0);
        
        this.arc.lineStyle(4, 0x00ff00, 1);
        this.arc.beginPath();
        this.arc.arc(400, 500, 120, Math.PI, 0, false); 
        this.arc.strokePath();

        this.arc.lineStyle(6, 0xff0000, 1);
        this.arc.beginPath();
        this.arc.moveTo(400, 500); 
        this.arc.lineTo(400, 380);  
        this.arc.strokePath();

        
        this.indicator = this.scene.add.graphics().setScrollFactor(0);
        this.indicator.fillStyle(0xffff00, 1);
        this.indicator.fillCircle(400, 380, 8);

        
        const clickArea = this.scene.add.rectangle(400, 450, 300, 200, 0x000000, 0)
            .setInteractive()
            .setScrollFactor(0);
        
        clickArea.on('pointerdown', () => {
            this.attemptLaunch();
        });
    }

    private attemptLaunch(): void {
        if (!this.isActive) return;

        this.isActive = false;

        //launch accuracy
        const accuracy = Math.abs(this.angle);
        let power: number;
        let launchAngle: number;

        if (accuracy <= 5) {
            // perfect launch
            power = 600;
            launchAngle = -45;
            this.flashIndicator(0x00ff00); // Green
        } else if (accuracy <= 15) {
            // okay launch
            power = 500;
            launchAngle = -40;
            this.flashIndicator(0xffff00); // Yellow
        } else {
            // bad launch
            power = 400;
            launchAngle = -30;
            this.flashIndicator(0xff0000); // Red
        }

        
        this.scene.time.delayedCall(200, () => {
            this.onLaunch(power, launchAngle);
            this.destroy();
        });
    }

    private flashIndicator(color: number): void {
        this.indicator.clear();
        this.indicator.fillStyle(color, 1);
        const radians = Phaser.Math.DegToRad(this.angle - 90);
        const x = 400 + Math.cos(radians) * 120;
        const y = 500 + Math.sin(radians) * 120;
        this.indicator.fillCircle(x, y, 12); 
    }

    public update(): void {
        if (!this.isActive) return;

        // oscillate angle
        this.angle += this.direction * this.speed;
        
        if (this.angle >= 90) {
            this.angle = 90;
            this.direction = -1;
        } else if (this.angle <= -90) {
            this.angle = -90;
            this.direction = 1;
        }

        // thingy pos
        const radians = Phaser.Math.DegToRad(this.angle - 90);
        const x = 400 + Math.cos(radians) * 120;
        const y = 500 + Math.sin(radians) * 120;
        
        this.indicator.clear();
        this.indicator.fillStyle(0xffff00, 1);
        this.indicator.fillCircle(x, y, 8);
    }

    public destroy(): void {
        if (this.arc) {
            this.arc.destroy();
        }
        if (this.indicator) {
            this.indicator.destroy();
        }
    }
}