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
    private launchPowerMultiplier: number = 1; 
    private easierLaunchMultiplier: number = 1; 
    
    constructor(scene: Scene, onLaunch: (power: number, angle: number) => void, launchPowerLevel: number = 0, easierLaunchLevel: number = 0) {
        this.scene = scene;
        this.onLaunch = onLaunch;
        this.launchPowerMultiplier = 1 + (launchPowerLevel*0.5); 
        this.easierLaunchMultiplier = Math.max(0.2, 1 - (easierLaunchLevel * 0.15)); 
        this.speed = 2 * this.easierLaunchMultiplier; 
        
        // start at random pos
        this.angle = Phaser.Math.Between(-90, 90);
        this.direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; 
        
        this.create();
    }

    private create(): void {
        this.arc = this.scene.add.graphics().setScrollFactor(0).setDepth(100);
        
        // red
        this.arc.fillStyle(0xff0000, 0.8);
        this.arc.beginPath();
        this.arc.arc(400, 600, 120, Math.PI, 2 * Math.PI, false);  
        this.arc.fillPath();

        // green
        this.arc.fillStyle(0x00ff00, 0.9);
        this.arc.beginPath();
        this.arc.arc(400, 600, 120, Math.PI * 1.45, Math.PI * 1.55, false); 
        this.arc.lineTo(400, 600);
        this.arc.fillPath();

        // yellow
        this.arc.fillStyle(0xffff00, 0.9);
        
        this.arc.beginPath();
        this.arc.arc(400, 600, 120, Math.PI * 1.55, Math.PI * 1.7, false);
        this.arc.lineTo(400, 600);
        this.arc.fillPath();
        
        this.arc.beginPath();
        this.arc.arc(400, 600, 120, Math.PI * 1.3, Math.PI * 1.45, false);
        this.arc.lineTo(400, 600);
        this.arc.fillPath();

        // outline
        this.arc.lineStyle(4, 0x000000, 1);
        this.arc.beginPath();
        this.arc.arc(400, 600, 120, Math.PI, 2 * Math.PI, false);  
        this.arc.strokePath();

        this.arc.lineStyle(2, 0x000000, 1);
        
        const angles = [1.3, 1.45, 1.55, 1.7];  
        angles.forEach(multiplier => {
            const angle = Math.PI * multiplier;
            const x = 400 + Math.cos(angle) * 120;
            const y = 600 + Math.sin(angle) * 120;
            this.arc.beginPath();
            this.arc.moveTo(400, 600);
            this.arc.lineTo(x, y);
            this.arc.strokePath();
        });

        this.indicator = this.scene.add.graphics().setScrollFactor(0).setDepth(101);
        this.updateNeedle();

        const instructionText = this.scene.add.text(400, 300, 'Click anywhere to launch!', {fontSize: '32px',color: '#ffffff',fontStyle: 'bold'}).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.scene.tweens.add({targets: instructionText, alpha: 0, duration: 500, yoyo: true, repeat: -1});

        const clickArea = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0).setInteractive().setScrollFactor(0).setDepth(102);
        
        clickArea.on('pointerdown', () => {
            instructionText.destroy();
            this.attemptLaunch();
        });
    }

    private updateNeedle(): void {
        this.indicator.clear();
        
        const normalizedAngle = (this.angle + 90) / 180; 
        const radians = Math.PI + (normalizedAngle * Math.PI);  
        
        const x = 400 + Math.cos(radians) * 110;
        const y = 600 + Math.sin(radians) * 110;
        
        //needle
        this.indicator.lineStyle(6, 0x000000, 1);
        this.indicator.beginPath();
        this.indicator.moveTo(400, 600);
        this.indicator.lineTo(x, y);
        this.indicator.strokePath();
        
        const triangleSize = 12;
        const triangleX1 = x + Math.cos(radians) * triangleSize;
        const triangleY1 = y + Math.sin(radians) * triangleSize;
        const triangleX2 = x + Math.cos(radians + Math.PI * 0.8) * triangleSize * 0.6;
        const triangleY2 = y + Math.sin(radians + Math.PI * 0.8) * triangleSize * 0.6;
        const triangleX3 = x + Math.cos(radians - Math.PI * 0.8) * triangleSize * 0.6;
        const triangleY3 = y + Math.sin(radians - Math.PI * 0.8) * triangleSize * 0.6;
        
        this.indicator.fillStyle(0x000000, 1);
        this.indicator.beginPath();
        this.indicator.moveTo(triangleX1, triangleY1);
        this.indicator.lineTo(triangleX2, triangleY2);
        this.indicator.lineTo(triangleX3, triangleY3);
        this.indicator.closePath();
        this.indicator.fillPath();
    }

    private flashNeedle(color: number): void {
        // make needle indicate landing

        this.indicator.clear();
        
        const normalizedAngle = (this.angle + 90) / 180;
        const radians = Math.PI + (normalizedAngle * Math.PI);  
        
        const x = 400 + Math.cos(radians) * 110;
        const y = 600 + Math.sin(radians) * 110;
        
        this.indicator.lineStyle(6, 0x000000, 1);
        this.indicator.beginPath();
        this.indicator.moveTo(400, 600);
        this.indicator.lineTo(x, y);
        this.indicator.strokePath();
        
        const triangleSize = 12;
        const triangleX1 = x + Math.cos(radians) * triangleSize;
        const triangleY1 = y + Math.sin(radians) * triangleSize;
        const triangleX2 = x + Math.cos(radians + Math.PI * 0.8) * triangleSize * 0.6;
        const triangleY2 = y + Math.sin(radians + Math.PI * 0.8) * triangleSize * 0.6;
        const triangleX3 = x + Math.cos(radians - Math.PI * 0.8) * triangleSize * 0.6;
        const triangleY3 = y + Math.sin(radians - Math.PI * 0.8) * triangleSize * 0.6;
        
        this.indicator.fillStyle(0x000000, 1);
        this.indicator.beginPath();
        this.indicator.moveTo(triangleX1, triangleY1);
        this.indicator.lineTo(triangleX2, triangleY2);
        this.indicator.lineTo(triangleX3, triangleY3);
        this.indicator.closePath();
        this.indicator.fillPath();
    }

    private attemptLaunch(): void {
        if (!this.isActive) return;

        this.isActive = false;

        let basePower: number;
        let launchAngle: number;
        let text: string;

        if (this.angle >= -10 && this.angle <= 10) {
            // good
            basePower = 600;
            launchAngle = -45;
            text = "Good Launch";
        } else if ((this.angle >= -35 && this.angle < -10) || (this.angle > 10 && this.angle <= 35)) {
            // ok
            basePower = 500;
            launchAngle = -40;
            text = "Okay Launch";
        } else {
            // bad
            basePower = 400;
            launchAngle = -30;
            text = "Bad Launch";
        }

        const finalPower = basePower * this.launchPowerMultiplier;

        this.flashNeedle(0x000000);

        const launchText = this.scene.add.text(400, 300, text, {fontSize: '48px',color: '#ffffff',fontStyle: 'bold'}).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.scene.time.delayedCall(200, () => {
            launchText.destroy();
            this.onLaunch(finalPower, launchAngle);
            this.destroy();
        });
    }

    public update(): void {
        if (!this.isActive) return;

        this.angle += this.direction * this.speed;
        
        if (this.angle >= 90) {
            this.angle = 90;
            this.direction = -1;
        } else if (this.angle <= -90) {
            this.angle = -90;
            this.direction = 1;
        }

        this.updateNeedle();
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