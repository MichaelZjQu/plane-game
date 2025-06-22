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
        const newGameButton = this.imageButton(0, -50, 'new_game_button', () => this.scene.start('Intro'));
        const loadGameButton = this.imageButton(0, 45, 'load_game_button', () => {});
        const backButton = this.imageButton(0, 140, 'back_button', () => this.toMenuTrans());
        this.gameSelectContainer.add([newGameButton, loadGameButton, backButton]);
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
        
        // Slide game select menu out to the right
        this.tweens.add({
            targets: this.gameSelectContainer,
            x: 1200,
            duration: 500,
            ease: 'Power2.easeInOut'
        });

        // Slide main menu in from the left
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
