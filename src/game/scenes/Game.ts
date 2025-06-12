import { Scene } from 'phaser';

export class Game extends Scene
{
    private plane!: Phaser.GameObjects.Rectangle;
    private floor!: Phaser.GameObjects.Rectangle;
    private launchButton!: Phaser.GameObjects.Container;


    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.physics.world.setBounds(0, 0, 3000, 600);
        this.physics.world.gravity.y = 300;

        this.add.rectangle(0, 0, 3000, 600, 0x028af8).setOrigin(0, 0);

        this.floor = this.add.rectangle(0, 580, 3000, 20, 0x00ff00).setOrigin(0, 0);
        this.physics.add.existing(this.floor, true);

        this.plane = this.add.rectangle(100, 300, 64, 32, 0xffffff);
        this.physics.add.existing(this.plane);
        this.plane.setVisible(false);

        this.launchButton = this.add.container(400, 500).setScrollFactor(0);
        const buttonBg = this.add.rectangle(0, 0, 160, 40, 0x00ff00).setInteractive();
        this.launchButton.add([buttonBg, this.add.text(0, 0, 'Launch', {fontSize: '20px', color: '#000'}).setOrigin(0.5)])


        this.physics.add.collider(this.plane, this.floor);

        buttonBg.on('pointerdown', () => {
            this.plane.setVisible(true);
            (this.plane.body as Phaser.Physics.Arcade.Body).setVelocity(200, -300);
            this.cameras.main.startFollow(this.plane);
            this.launchButton.destroy();
        });
    }

    update() {
        if (this.plane.visible) {
            this.plane.rotation = Math.atan2(
                (this.plane.body as Phaser.Physics.Arcade.Body).velocity.y,
                (this.plane.body as Phaser.Physics.Arcade.Body).velocity.x
            );
        }
    }
}
