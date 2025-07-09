import { Scene } from 'phaser';

export class Upgrade extends Scene {
    private playerMoney: number = 0;
    private moneyText: Phaser.GameObjects.Text;
    private currentDay: number = 1; 
    
    private upgrades = {
        reducedDrag: 0,
        berryScore: 0,
        berryMagnet: 0,
        reducedWeight: 0,
        launchPower: 0,
        thrustPower: 0,
        easierLaunch: 0,
        moreFuel: 0,
        berryBoost: 0
    };

    constructor() {
        super('Upgrade');
    }

    create() {
        this.loadGameData();

        

        //load moneys earned
        const data = this.scene.settings.data as any;

        if (data.currentDay) {
            this.currentDay = data.currentDay;
        }

        if (data.money) {
            this.playerMoney += data.money; 
            this.saveGameData(); 

            //reset money so it dont keep adding
            this.scene.settings.data = {...data, money: 0};
        }
        
        

        this.add.image(400, 300, 'upgrade_menu').setDisplaySize(800, 600);
        this.add.graphics().fillStyle(0x3498db, 0.9).fillRoundedRect(50, 10, 700, 580, 20).lineStyle(4, 0x2980b9).strokeRoundedRect(50, 10, 700, 580, 20);
        this.add.graphics().fillStyle(0xffffff, 0.95).fillRoundedRect(70, 30, 660, 60, 15).lineStyle(2, 0x2980b9).strokeRoundedRect(70, 30, 660, 60, 15);
        this.add.text(400, 60, `DAY ${this.currentDay}`, {fontSize: '28px',color: '#2980b9',fontStyle: 'bold'}).setOrigin(0.5);

        this.add.graphics().fillStyle(0xffffff, 0.95).fillRoundedRect(300, 100, 200, 40, 10).lineStyle(2, 0x2980b9).strokeRoundedRect(300, 100, 200, 40, 10);

        this.moneyText = this.add.text(400, 120, `Money: $${this.playerMoney}`, {fontSize: '18px',color: '#2980b9',fontStyle: 'bold'}).setOrigin(0.5);


        

        const upgradeConfigs = [
            { key: 'reducedDrag', name: 'Sparrowdynamics', costs: [40, 80, 150, 250, 400], description: 'Reduces air resistance' },
            { key: 'berryScore', name: 'Berry Score+', costs: [200, 500, 1000, 2000, 5000], description: 'More money per berry' },
            { key: 'berryMagnet', name: 'Berry Magnet', costs: [100, 300, 600, 1000, 1500], description: 'Attracts nearby berries' },
            { key: 'reducedWeight', name: 'Reduced Weight', costs: [50, 120, 200, 300, 500], description: 'Lighter plane flies better' },
            { key: 'launchPower', name: 'Launch Power+', costs: [120, 250, 400, 600, 850], description: 'Stronger launch force' },
            { key: 'thrustPower', name: 'Engine Power', costs: [180, 320, 480, 750, 1200], description: 'Stronger engine thrust' },
            { key: 'easierLaunch', name: 'Easier Launch', costs: [250, 500, 750, 1000, 1250], description: 'Slower Launch Meter' },
            { key: 'moreFuel', name: 'More Fuel', costs: [60, 150, 300, 500, 800, 1200, 1800, 2500, 3500, 4800], description: 'Increased fuel capacity' },
            { key: 'berryBoost', name: 'Berry Boost', costs: [400, 800, 1400, 2400, 4000], description: 'Berries give speed boost' }
        ];

        let hoverText: Phaser.GameObjects.Text | null = null;
        let hoverBg: Phaser.GameObjects.Graphics | null = null;

        upgradeConfigs.forEach((upgrade, index) => {
            const col = index % 4;
            const row = Math.floor(index / 4);
            
            const x = 150 + (col * 125);
            const y = 200 + (row * 125);
            
            const currentLevel = this.upgrades[upgrade.key as keyof typeof this.upgrades];
            const maxLevel = upgrade.costs.length;
            const currentCost = upgrade.costs[currentLevel] || 999999;
            const canAfford = this.playerMoney >= currentCost && currentLevel < maxLevel;
            const isMaxLevel = currentLevel >= maxLevel;
            
            const fillPercentage = currentLevel / maxLevel;
            
            const bgSquare = this.add.rectangle(x, y, 100, 100, 0x333333, 1).setStrokeStyle(3, 0x000000).setInteractive({ useHandCursor: true });
            
            const fillHeight = 100 * fillPercentage;
            const fillY = y + (100 - fillHeight) / 2; 
            
            const fillSquare = this.add.rectangle(x, fillY, 100, fillHeight, 0x00ff00, 1);
            
            this.add.text(x, y, currentLevel.toString(), {fontSize: '36px', color: fillPercentage > 0.5 ? '#000000' : '#ffffff', fontStyle: 'bold'}).setOrigin(0.5);

            const alpha = (canAfford || isMaxLevel) ? 1 : 0.5;
            bgSquare.setAlpha(alpha);
            fillSquare.setAlpha(alpha);

            bgSquare.on('pointerover', () => {
                if (hoverText) hoverText.destroy();
                if (hoverBg) hoverBg.destroy();
                
                hoverBg = this.add.graphics().fillStyle(0x000000, 0.8).fillRoundedRect(x - 100, y - 90, 200, 80, 10);
                
                hoverText = this.add.text(x, y - 70, upgrade.name, {fontSize: '16px',color: '#ffffff',fontStyle: 'bold'}).setOrigin(0.5);
                
                const descText = this.add.text(x, y - 50, upgrade.description, {fontSize: '12px',color: '#ffffff'}).setOrigin(0.5);
                
                const costText = this.add.text(x, y - 30, isMaxLevel ? 'MAX LEVEL' : `Cost: $${currentCost}`, {fontSize: '14px',color: isMaxLevel ? '#ffff00' : (canAfford ? '#00ff00' : '#ff0000'),fontStyle: 'bold'}).setOrigin(0.5);
                
                hoverText.setData('extraTexts', [descText, costText]);
            });

            bgSquare.on('pointerout', () => {
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

            bgSquare.on('pointerdown', () => {
                if (canAfford && !isMaxLevel) {
                    this.purchaseUpgrade(upgrade.key as keyof typeof this.upgrades, currentCost);
                }
            });
        });

        this.add.graphics().fillStyle(0xffffff, 0.95).fillRoundedRect(300, 530, 200, 40, 15).lineStyle(2, 0x2980b9).strokeRoundedRect(300, 530, 200, 40, 15);

        const backButton = this.add.rectangle(400, 550, 200, 40, 0x000000, 0).setInteractive({ useHandCursor: true });

        this.add.text(400, 550, 'FLY AGAIN', {fontSize: '16px',color: '#2980b9',fontStyle: 'bold'}).setOrigin(0.5);

        backButton.on('pointerdown', () => {this.saveGameData(); this.scene.start('Game', { upgrades: this.upgrades, currentDay: this.currentDay });});
    }

    private loadGameData(): void {
        try {
            const savedData = localStorage.getItem('gameData1');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.playerMoney = data.money || 0;
                this.upgrades = { ...this.upgrades, ...data.upgrades };
                this.currentDay = data.currentDay || 1; 
            }
        } catch (error) {
            console.warn('Could not load game data:', error);
        }
    }

    private saveGameData(): void {
        try {
            const dataToSave = {money: this.playerMoney, upgrades: this.upgrades, currentDay: this.currentDay}; 
            localStorage.setItem('gameData1', JSON.stringify(dataToSave));
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