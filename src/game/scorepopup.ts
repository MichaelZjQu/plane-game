import { Scene } from 'phaser';

export class ScorePopup {
    private scene: Scene;
    private container: Phaser.GameObjects.Container;
    private background: Phaser.GameObjects.Rectangle;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public show(score: number, distance: number, maxAltitude: number, onUpgrade: () => void): void {
        
        //calcs
        const scoreBonus = score; // 10 per default berry
        const distanceBonus = Math.floor(distance / 100) * 2; // 2 per 10m
        const altitudeBonus = Math.floor(maxAltitude / 100) * 5; // 5 per 10m
        const totalMoney = scoreBonus + distanceBonus + altitudeBonus;

        this.background = this.scene.add.rectangle(400, 350, 800, 700, 0x000000, 0.6).setScrollFactor(0).setDepth(2000); // Higher depth
        this.container = this.scene.add.container(400, 300).setScrollFactor(0).setDepth(2001); // Even higher

        const popupBg = this.scene.add.graphics().fillStyle(0xffffff).fillRoundedRect(-250, -220, 500, 440, 20).lineStyle(4, 0x000000).strokeRoundedRect(-250, -220, 500, 440, 20); 

        const headerBg = this.scene.add.graphics().fillStyle(0x3498db).fillRoundedRect(-240, -210, 480, 60, 15); 

        const title = this.scene.add.text(0, -180, 'FLIGHT COMPLETE!', { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5); 

        // stats
        const statsStartY = -110; 
        const stats = [
            { text: `Distance: ${Math.floor(distance / 10)}m`, color: '#e67e22' },
            { text: `Max Altitude: ${Math.floor(maxAltitude / 10)}m`, color: '#9b59b6' },
            { text: `Berry Bonus: ${score}`, color: '#27ae60' }
        ];

        // stat graphics
        const statElements: Phaser.GameObjects.GameObject[] = [];
        stats.forEach((stat, index) => {
            const y = statsStartY + (index * 35);
            const statBg = this.scene.add.graphics().fillStyle(0xf0f0f0).fillRoundedRect(-200, y - 12, 400, 24, 8).lineStyle(2, 0xcccccc).strokeRoundedRect(-200, y - 12, 400, 24, 8);
            const statText = this.scene.add.text(0, y, stat.text, { fontSize: '16px', color: stat.color, fontStyle: 'bold' }).setOrigin(0.5);
            statElements.push(statBg, statText);
        });

        // Money section
        const moneyStartY = 0; 
        const moneyHeaderBg = this.scene.add.graphics().fillGradientStyle(0xf39c12, 0xe67e22, 0xf39c12, 0xe67e22).fillRoundedRect(-150, moneyStartY - 15, 300, 30, 10);
        const moneyTitle = this.scene.add.text(0, moneyStartY, 'MONEY EARNED:', { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        const moneyBreakdown = [
            { text: `Distance: $${distanceBonus}`, color: '#e67e22' },
            { text: `Altitude: $${altitudeBonus}`, color: '#9b59b6' },
            { text: `Berry Bonus: $${scoreBonus}`, color: '#27ae60' }
        ];

        const moneyElements: Phaser.GameObjects.GameObject[] = [];
        moneyBreakdown.forEach((money, index) => {
            const y = moneyStartY + 40 + (index * 25);
            const moneyText = this.scene.add.text(0, y, money.text, { fontSize: '14px', color: money.color, fontStyle: 'bold' }).setOrigin(0.5);
            moneyElements.push(moneyText);
        });

        // moneys
        const totalY = moneyStartY + 130;
        const totalBg = this.scene.add.graphics().fillStyle(0x2ecc71).fillRoundedRect(-120, totalY - 20, 240, 40, 15).lineStyle(3, 0x27ae60).strokeRoundedRect(-120, totalY - 20, 240, 40, 15);
        const totalText = this.scene.add.text(0, totalY, `TOTAL: $${totalMoney}`, { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        const continueText = this.scene.add.text(0, 190, 'CLICK TO CONTINUE', { fontSize: '18px', color: '#666666', fontStyle: 'bold' }).setOrigin(0.5);

        this.container.add([
            popupBg, 
            headerBg, 
            title, 
            ...statElements,
            moneyHeaderBg, 
            moneyTitle, 
            ...moneyElements,
            totalBg, 
            totalText,
            continueText
        ]);

        this.background.setInteractive().on('pointerdown', () => {
            this.hide();
            onUpgrade();
        });

        this.container.setScale(0);
        this.scene.tweens.add({ 
            targets: this.container, 
            scaleX: 1, 
            scaleY: 1, 
            duration: 400, 
            ease: 'Back.easeOut'
        });
    }

    public hide(): void {
        if (this.container) this.container.destroy();
        if (this.background) this.background.destroy();
    }
}