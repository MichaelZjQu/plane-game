import { Scene } from 'phaser';

export class TutorialPopup {
    private scene: Scene;
    private container: Phaser.GameObjects.Container;
    private background: Phaser.GameObjects.Rectangle;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public showFirstTutorial(onContinue: () => void): void {
        this.background = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.7).setScrollFactor(0).setDepth(3000);
        this.container = this.scene.add.container(400, 300).setScrollFactor(0).setDepth(3001);

        const popupBg = this.scene.add.graphics().fillStyle(0xffffff).fillRoundedRect(-250, -180, 500, 360, 15).lineStyle(3, 0x000000).strokeRoundedRect(-250, -180, 500, 360, 15);
        
        const titleText = this.scene.add.text(0, -140, 'Instructions', {fontSize: '28px',color: '#000000',fontStyle: 'bold',align: 'center'}).setOrigin(0.5);
        
        const instructions = [
            'Hold SPACE to use fuel for thrust',
            '',
            'Collect berries for bonus money:',
            '• Blue berries = good',
            '• Red berries = bad',
            '• Higher berries = more money',
            '',
            'Upgrade your plane with the money you earn!',
        ];

        const instructionTexts: Phaser.GameObjects.Text[] = [];
        let yPos = -80;
        instructions.forEach(line => {
            if (line !== '') {
                const text = this.scene.add.text(0, yPos, line, {fontSize: '18px',color: '#000000',align: 'center'}).setOrigin(0.5);
                instructionTexts.push(text);
            }
            yPos += line === '' ? 10 : 25;
        });

        const continueText = this.scene.add.text(0, 140, 'Click anywhere to continue', {fontSize: '16px',color: '#666666',align: 'center'}).setOrigin(0.5);

        this.container.add([popupBg, titleText, ...instructionTexts, continueText]);

        this.background.setInteractive().on('pointerdown', () => {this.hide(); onContinue();});
    }

    public hide(): void {
        if (this.background) {this.background.destroy();}
        if (this.container) {this.container.destroy();}
    }
}