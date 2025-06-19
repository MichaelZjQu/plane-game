import { Scene } from "phaser";

export class Menu extends Scene {

    private title: Phaser.GameObjects.Text;
    private playButton: Phaser.GameObjects.Container;


    constructor() {
        super('Menu');
        
    }


    create(){
        //bg
        this.add.rectangle(0, 0, 3000, 600, 0x028af8).setOrigin(0, 0);

        this.title = this.add.text(400, 100, "Plane Game", {fontSize: '64px', color: '#ffffff', fontStyle: 'bold'}).setOrigin(0.5);
    
        this.menuButton(400, 300, 'New Game', () => {this.scene.start('Intro');});
    
    }

    private menuButton(x: number, y: number, text: string, onClick: () => void){
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 200, 50, 0x00ff00).setInteractive().on('pointerover', () => bg.setFillStyle(0x00cc00)).on('pointerout', () => bg.setFillStyle(0x00ff00)).on('pointerdown', onClick);

        const bText = this.add.text(0, 0, text, {fontSize: '24px', color: '#000000'}).setOrigin(0.5);

        button.add([bg, bText]);
        return button;
    }

}
