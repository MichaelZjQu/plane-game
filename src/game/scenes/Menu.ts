import { Scene } from "phaser";

export class Menu extends Scene {

    private menu_logo: Phaser.GameObjects.Image;

    private state: 'menu' | 'gameSelect' = 'menu';

    private menuContainer: Phaser.GameObjects.Container;
    private gameSelectContainer: Phaser.GameObjects.Container;

    constructor() {
        super('Menu');
    }

    create(){
        //bg
        this.add.rectangle(0, 0, 3000, 600, 0x028af8).setOrigin(0, 0);

        this.menu_logo = this.add.image(400, 150, 'menu_logo').setOrigin(0.5).setScale(1.2);

        this.menuContainer = this.add.container(400, 400);
    
        this.menuContainer.add(this.imageButton(0, 0, 'play_button', () => this.toGameTrans()));
        
        this.gameSelectContainer = this.add.container(1200, 400);
        const newGameButton = this.imageButton(0, -50, 'new_game_button', () => this.handleNewGame());
        const loadGameButton = this.imageButton(0, 45, 'load_game_button', () => this.handleLoadGame());
        const backButton = this.imageButton(0, 140, 'back_button', () => this.toMenuTrans());
        this.gameSelectContainer.add([newGameButton, loadGameButton, backButton]);
    }

    private handleNewGame(): void {
        const existingData = localStorage.getItem('gameData1');
        
        if (existingData) {
            this.showConfirmationPopup(
                'Overwrite Save?',
                'Starting a new game will delete your current save data. Are you sure?',
                () => {
                    localStorage.removeItem('gameData1');
                    this.scene.start('Intro');
                },
                () => {
                    // do nothing
                }
            );
        } else {
            // no save
            this.scene.start('Intro');
        }
    }

    private handleLoadGame(): void {
        const existingData = localStorage.getItem('gameData1');
        
        if (existingData) {
            try {
                const data = JSON.parse(existingData);
                this.scene.start('Upgrade', {
                    money: 0, 
                    upgrades: data.upgrades || {},
                    currentDay: data.currentDay || 1
                });
            } catch (error) {
                // broken catch
                this.showMessagePopup('Error', 'Save data is corrupted. Please start a new game.');
            }
        } else {
            // no save
            this.showMessagePopup('No Save Data', 'No save data found. Please start a new game first.');
        }
    }

    private showConfirmationPopup(title: string, message: string, onConfirm: () => void, onCancel: () => void): void {
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7).setScrollFactor(0).setDepth(4000);
        const popup = this.add.container(400, 300).setScrollFactor(0).setDepth(4001);

        const bg = this.add.graphics().fillStyle(0xffffff).fillRoundedRect(-200, -100, 400, 200, 15).lineStyle(3, 0x000000).strokeRoundedRect(-200, -100, 400, 200, 15);

        const titleText = this.add.text(0, -60, title, {fontSize: '24px',color: '#000000', fontStyle: 'bold'}).setOrigin(0.5);
        const messageText = this.add.text(0, -20, message, { fontSize: '16px', color: '#000000', align: 'center', wordWrap: { width: 350 }}).setOrigin(0.5);
        const yesButton = this.add.text(-80, 50, 'YES', { fontSize: '18px', color: '#ffffff', fontStyle: 'bold', backgroundColor: '#ff0000', padding: { x: 20, y: 10 }}).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const noButton = this.add.text(80, 50, 'NO', { fontSize: '18px', color: '#ffffff', fontStyle: 'bold', backgroundColor: '#007acc', padding: { x: 20, y: 10 }}).setOrigin(0.5).setInteractive({ useHandCursor: true });

        yesButton.on('pointerdown', () => { overlay.destroy(); popup.destroy();onConfirm();});
        noButton.on('pointerdown', () => { overlay.destroy(); popup.destroy(); onCancel();});

        popup.add([bg, titleText, messageText, yesButton, noButton]);

        overlay.setInteractive().on('pointerdown', () => {overlay.destroy();popup.destroy(); onCancel();});
    }

    private showMessagePopup(title: string, message: string): void {
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7).setScrollFactor(0).setDepth(4000);
        const popup = this.add.container(400, 300).setScrollFactor(0).setDepth(4001);

        const bg = this.add.graphics()
            .fillStyle(0xffffff)
            .fillRoundedRect(-200, -80, 400, 160, 15)
            .lineStyle(3, 0x000000)
            .strokeRoundedRect(-200, -80, 400, 160, 15);

        const titleText = this.add.text(0, -40, title, {
            fontSize: '24px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const messageText = this.add.text(0, 0, message, {
            fontSize: '16px',
            color: '#000000',
            align: 'center',
            wordWrap: { width: 350 }
        }).setOrigin(0.5);

        const okButton = this.add.text(0, 40, 'OK', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: '#007acc',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        okButton.on('pointerdown', () => {
            overlay.destroy();
            popup.destroy();
        });

        popup.add([bg, titleText, messageText, okButton]);

        overlay.setInteractive().on('pointerdown', () => {
            overlay.destroy();
            popup.destroy();
        });
    }

    private toGameTrans() {
        if (this.state !== 'menu') return;

        this.state = 'gameSelect';

        this.tweens.add({ targets: this.menuContainer, x: -400, duration: 500, ease: 'Power2.easeInOut'});

        this.tweens.add({targets: this.gameSelectContainer,x: 400,duration: 500,ease: 'Power2.easeInOut'});
    }

    private toMenuTrans() {
        if (this.state !== 'gameSelect') return;
        
        this.state = 'menu';
        
        this.tweens.add({
            targets: this.gameSelectContainer,
            x: 1200,
            duration: 500,
            ease: 'Power2.easeInOut'
        });

        this.tweens.add({
            targets: this.menuContainer,
            x: 400,
            duration: 500,
            ease: 'Power2.easeInOut'
        });
    }

    private imageButton(x: number, y: number, imageKey: string, onClick: () => void): Phaser.GameObjects.Image {
        const button = this.add.image(x, y, imageKey)
            .setScale(0.5)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerover', () => button.setTint(0xcccccc)) 
            .on('pointerout', () => button.clearTint()) 
            .on('pointerdown', () => {
                button.setTint(0x888888); 
                this.time.delayedCall(100, () => {
                    button.clearTint();
                    onClick();
                });
            });

        return button;
    }
}
