import { Scene } from 'phaser';

export class Upgrade extends Scene {
    private playerMoney: number = 0;
    private moneyText: Phaser.GameObjects.Text;
    
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

    constructor() {
        super('Upgrade');
    }

    create() {
        this.loadGameData();

        this.add.image(400, 300, 'upgrade_menu').setDisplaySize(800, 600);
        this.add.graphics().fillStyle(0x3498db, 0.9).fillRoundedRect(50, 10, 700, 580, 20).lineStyle(4, 0x2980b9).strokeRoundedRect(50, 10, 700, 580, 20);
        this.add.graphics().fillStyle(0xffffff, 0.95).fillRoundedRect(70, 30, 660, 60, 15).lineStyle(2, 0x2980b9).strokeRoundedRect(70, 30, 660, 60, 15);
        this.add.text(400, 60, 'UPGRADE YOUR PLANE', {fontSize: '28px',color: '#2980b9',fontStyle: 'bold'}).setOrigin(0.5);

        this.add.graphics().fillStyle(0xffffff, 0.95).fillRoundedRect(300, 100, 200, 40, 10).lineStyle(2, 0x2980b9).strokeRoundedRect(300, 100, 200, 40, 10);

        this.moneyText = this.add.text(400, 120, `Money: $${this.playerMoney}`, {fontSize: '18px',color: '#2980b9',fontStyle: 'bold'}).setOrigin(0.5);

        const upgradeConfigs = [
            { key: 'reducedDrag', name: 'Sparrowdynamics', cost: 50, description: 'Reduces air resistance' },
            { key: 'berryScore', name: 'Berry Score+', cost: 75, description: 'More money per berry' },
            { key: 'berryMagnet', name: 'Berry Magnet', cost: 100, description: 'Attracts nearby berries' },
            { key: 'reducedWeight', name: 'Reduced Weight', cost: 80, description: 'Lighter plane flies better' },
            { key: 'launchPower', name: 'Launch Power+', cost: 120, description: 'Stronger launch force' },
            { key: 'easierLaunch', name: 'Easier Launch', cost: 90, description: 'Slower Launch Meter' },
            { key: 'moreFuel', name: 'More Fuel', cost: 110, description: 'Increased fuel capacity' },
            { key: 'berryBoost', name: 'Berry Boost', cost: 130, description: 'Berries give speed boost' }
        ];

        let hoverText: Phaser.GameObjects.Text | null = null;
        let hoverBg: Phaser.GameObjects.Graphics | null = null;

        upgradeConfigs.forEach((upgrade, index) => {
            const col = index % 4;
            const row = Math.floor(index / 4);
            
            const x = 150 + (col * 125);
            const y = 200 + (row * 125);
            
            const currentLevel = this.upgrades[upgrade.key as keyof typeof this.upgrades];
            const canAfford = this.playerMoney >= upgrade.cost;
            
            let color: number;
            if (currentLevel === 0) color = 0xff0000;
            else if (currentLevel === 1) color = 0xffff00;
            else color = 0x00ff00;
            
            const alpha = canAfford ? 1 : 0.3;
            
            const square = this.add.rectangle(x, y, 100, 100, color, alpha).setStrokeStyle(3, 0x000000).setInteractive({ useHandCursor: true });

            this.add.text(x, y, currentLevel.toString(), {fontSize: '36px',color: '#000000',fontStyle: 'bold'}).setOrigin(0.5);

            square.on('pointerover', () => {
                if (hoverText) hoverText.destroy();
                if (hoverBg) hoverBg.destroy();
                
                hoverBg = this.add.graphics().fillStyle(0x000000, 0.8).fillRoundedRect(x - 75, y - 75, 150, 60, 10);
                
                hoverText = this.add.text(x, y - 60, upgrade.name, {fontSize: '16px',color: '#ffffff',fontStyle: 'bold'}).setOrigin(0.5);
                
                const descText = this.add.text(x, y - 40, upgrade.description, {fontSize: '12px',color: '#ffffff'}).setOrigin(0.5);
                
                const costText = this.add.text(x, y - 20, `Cost: $${upgrade.cost}`, {fontSize: '14px',color: canAfford ? '#00ff00' : '#ff0000',fontStyle: 'bold'}).setOrigin(0.5);
                
                hoverText.setData('extraTexts', [descText, costText]);
            });

            square.on('pointerout', () => {
                if (hoverText) {
                    const extraTexts = hoverText.getData('extraTexts');
                    if (extraTexts) extraTexts.forEach((text: Phaser.GameObjects.Text) => text.destroy());
                    
                    hoverText.destroy();
                    hoverText = null;
                }
                if (hoverBg) {
                    hoverBg.destroy();
                    hoverBg = null;
                }
            });

            square.on('pointerdown', () => {
                if (canAfford) {
                    this.purchaseUpgrade(upgrade.key as keyof typeof this.upgrades, upgrade.cost);
                }
            });
        });

        this.add.graphics().fillStyle(0xffffff, 0.95).fillRoundedRect(300, 530, 200, 40, 15).lineStyle(2, 0x2980b9).strokeRoundedRect(300, 530, 200, 40, 15);

        const backButton = this.add.rectangle(400, 550, 200, 40, 0x000000, 0).setInteractive({ useHandCursor: true });

        this.add.text(400, 550, 'FLY AGAIN', {fontSize: '16px',color: '#2980b9',fontStyle: 'bold'}).setOrigin(0.5);

        backButton.on('pointerdown', () => {this.saveGameData();this.scene.start('Game', { upgrades: this.upgrades });});

        const data = this.scene.settings.data as any;
        if (data?.money) {
            this.playerMoney += data.money; 
            this.moneyText.setText(`Money: $${this.playerMoney}`);
            this.saveGameData(); 
        }
    }

    private loadGameData(): void {
        try {
            const savedData = localStorage.getItem('gameData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.playerMoney = data.money || 0;
                this.upgrades = { ...this.upgrades, ...data.upgrades };
            }
        } catch (error) {
            console.warn('Could not load game data:', error);
        }
    }

    private saveGameData(): void {
        try {
            const dataToSave = {money: this.playerMoney, upgrades: this.upgrades};
            localStorage.setItem('gameData', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Could not save game data:', error);
        }
    }

    private purchaseUpgrade(upgradeKey: keyof typeof this.upgrades, cost: number): void {
        if (this.playerMoney >= cost) {
            //afford
            this.playerMoney -= cost;
            this.upgrades[upgradeKey]++;

            this.moneyText.setText(`Money: $${this.playerMoney}`);
            
            this.saveGameData();             
            this.scene.restart();
        } 
    }


}