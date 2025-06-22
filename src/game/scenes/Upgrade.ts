import { Scene } from 'phaser';

export class Upgrade extends Scene {
    private playerMoney: number = 0;
    private moneyText: Phaser.GameObjects.Text;
    
    // Upgrade states
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

        this.add.graphics()
            .fillStyle(0x3498db, 0.9)
            .fillRoundedRect(50, 10, 700, 580, 20)
            .lineStyle(4, 0x2980b9)
            .strokeRoundedRect(50, 10, 700, 580, 20);

        this.add.graphics()
            .fillStyle(0xffffff, 0.95)
            .fillRoundedRect(70, 30, 660, 60, 15)
            .lineStyle(2, 0x2980b9)
            .strokeRoundedRect(70, 30, 660, 60, 15);

        this.add.text(400, 60, 'UPGRADE YOUR PLANE', {
            fontSize: '28px',
            color: '#2980b9',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.graphics()
            .fillStyle(0xffffff, 0.95)
            .fillRoundedRect(300, 100, 200, 40, 10)
            .lineStyle(2, 0x2980b9)
            .strokeRoundedRect(300, 100, 200, 40, 10);

        this.moneyText = this.add.text(400, 120, `Money: $${this.playerMoney}`, {
            fontSize: '18px',
            color: '#2980b9',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const upgradeConfigs = [
            { key: 'reducedDrag', name: 'Reduced Drag', cost: 50, description: 'Better aerodynamics' },
            { key: 'berryScore', name: 'Berry Score+', cost: 75, description: 'More points per berry' },
            { key: 'berryMagnet', name: 'Berry Magnet', cost: 100, description: 'Attracts nearby berries' },
            { key: 'reducedWeight', name: 'Reduced Weight', cost: 80, description: 'Lighter plane flies better' },
            { key: 'launchPower', name: 'Launch Power+', cost: 120, description: 'Stronger launch force' },
            { key: 'easierLaunch', name: 'Easier Launch', cost: 90, description: 'Launch timing assistance' },
            { key: 'moreFuel', name: 'More Fuel', cost: 110, description: 'Increased fuel capacity' },
            { key: 'berryBoost', name: 'Berry Boost', cost: 130, description: 'Berries give speed boost' }
        ];

        
        upgradeConfigs.forEach((upgrade, index) => {
            const col = index % 2; 
            const row = Math.floor(index / 2);
            
            const x = col === 0 ? 200 : 600; 
            const y = 180 + (row * 70); 
            
            this.add.graphics()
                .fillStyle(0xffffff, 0.95)
                .fillRoundedRect(x - 140, y - 30, 280, 60, 10)
                .lineStyle(2, 0x2980b9)
                .strokeRoundedRect(x - 140, y - 30, 280, 60, 10);

            const currentLevel = this.upgrades[upgrade.key as keyof typeof this.upgrades];
            const displayName = currentLevel > 0 ? `${upgrade.name} (${currentLevel})` : upgrade.name;

            this.add.text(x - 120, y - 12, displayName, {
                fontSize: '16px',
                color: '#2980b9',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            this.add.text(x - 120, y + 8, upgrade.description, {
                fontSize: '12px',
                color: '#34495e'
            }).setOrigin(0, 0.5);

            this.add.text(x + 80, y - 8, `$${upgrade.cost}`, {
                fontSize: '14px',
                color: '#e74c3c',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            const buyButton = this.add.rectangle(x + 80, y + 15, 60, 20, 0x27ae60)
                .setStrokeStyle(1, 0x229954)
                .setInteractive({ useHandCursor: true });

            this.add.text(x + 80, y + 15, 'BUY', {
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            buyButton.on('pointerdown', () => {
                this.purchaseUpgrade(upgrade.key as keyof typeof this.upgrades, upgrade.cost);
            });
        });

        this.add.graphics()
            .fillStyle(0xffffff, 0.95)
            .fillRoundedRect(300, 530, 200, 40, 15)
            .lineStyle(2, 0x2980b9)
            .strokeRoundedRect(300, 530, 200, 40, 15);

        const backButton = this.add.rectangle(400, 550, 200, 40, 0x000000, 0)
            .setInteractive({ useHandCursor: true });

        this.add.text(400, 550, 'FLY AGAIN', {
            fontSize: '16px',
            color: '#2980b9',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        backButton.on('pointerdown', () => {
            this.saveGameData();
            this.scene.start('Game', { upgrades: this.upgrades });
        });

        // Add reset button
        this.add.graphics()
            .fillStyle(0xe74c3c, 0.95)
            .fillRoundedRect(520, 530, 120, 40, 15)
            .lineStyle(2, 0xc0392b)
            .strokeRoundedRect(520, 530, 120, 40, 15);

        const resetButton = this.add.rectangle(580, 550, 120, 40, 0x000000, 0)
            .setInteractive({ useHandCursor: true });

        this.add.text(580, 550, 'RESET UPGRADES', {
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        resetButton.on('pointerdown', () => {
            this.resetAllUpgrades();
        });

        const data = this.scene.settings.data as any;
        if (data?.money) {
            this.playerMoney += data.money; 
            this.updateMoneyDisplay();
            this.saveGameData(); 
        }
    }

    private loadGameData(): void {
        try {
            const savedData = localStorage.getItem('planeGameData');
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
            const dataToSave = {
                money: this.playerMoney,
                upgrades: this.upgrades
            };
            localStorage.setItem('planeGameData', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Could not save game data:', error);
        }
    }

    private purchaseUpgrade(upgradeKey: keyof typeof this.upgrades, cost: number): void {
        if (this.playerMoney >= cost) {
            this.playerMoney -= cost;
            this.upgrades[upgradeKey]++;
            this.updateMoneyDisplay();
            this.saveGameData(); 
            console.log(`Purchased ${upgradeKey} level ${this.upgrades[upgradeKey]}`);
            
            this.scene.restart();
        } else {
            console.log('Not enough money!');
        }
    }

    private updateMoneyDisplay(): void {
        this.moneyText.setText(`Money: $${this.playerMoney}`);
    }

    private resetAllUpgrades(): void {
        this.upgrades = {
            reducedDrag: 0,
            berryScore: 0,
            berryMagnet: 0,
            reducedWeight: 0,
            launchPower: 0,
            easierLaunch: 0,
            moreFuel: 0,
            berryBoost: 0
        };
        this.playerMoney = 0;
        this.saveGameData();
        this.scene.restart();
        console.log('All upgrades and money reset!');
    }
}