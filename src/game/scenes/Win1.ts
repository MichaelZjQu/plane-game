import { Scene } from 'phaser';

export class Win1 extends Scene {
    private currentDay: number = 1;
    private upgrades: any;
    private money: number = 0;

    constructor() {
        super('Win1');
    }

    create() {
        const data = this.scene.settings.data as any;
        this.currentDay = data.currentDay || 1;
        this.upgrades = data.upgrades || {};
        this.money = data.money || 0;

        this.cameras.main.setBackgroundColor('#000000');
        
        this.add.text(400, 200, `You made it on Day ${this.currentDay}!`, {fontSize: '48px',color: '#ffff00',fontStyle: 'bold'}).setOrigin(0.5);

        const continueButton = this.add.text(400, 350, 'Continue?', {fontSize: '32px',color: '#00ff00',fontStyle: 'bold'}).setOrigin(0.5).setInteractive({ useHandCursor: true });

        continueButton.on('pointerdown', () => {this.scene.start('Upgrade', { money: this.money, upgrades: this.upgrades, currentDay: this.currentDay + 1 });});
    }
}