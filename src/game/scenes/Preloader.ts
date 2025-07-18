import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {

        // //  A simple progress bar. This is the outline of the bar.
        // this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        // //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        // const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        // //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        // this.load.on('progress', (progress: number) => {

        //     //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
        //     bar.width = 4 + (460 * progress);

        // });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        this.load.image('menu_logo', 'menu_logo.png');
        this.load.image('play_button', 'play_button.png');
        this.load.image('new_game_button', 'new_game_button.png');  
        this.load.image('load_game_button', 'load_game_button.png');
        this.load.image('back_button', 'back_button.png');
        
        this.load.image('plane', 'plane.png');
        
        this.load.image('intro', 'intro_comic.png')

        this.load.image('upgrade_menu', 'workshop.png');

        this.load.image('feather_container', 'feather_container.png');

        this.load.image('city_1', 'city_bg_1.png');
        this.load.image('city_2', 'city_bg_2.png');
        this.load.image('city_3', 'city_bg_3.png');
        this.load.image('cloud_1', 'city_cloud.png');
        //berries
        this.load.image('skyberry_1', 'skyberry_1.png');
        this.load.image('skyberry_2', 'skyberry_2.png');
        this.load.image('skyberry_3', 'skyberry_3.png');
        this.load.image('sourberry_1', 'sourberry_1.png');
        this.load.image('sourberry_2', 'sourberry_2.png');
        this.load.image('sourberry_3', 'sourberry_3.png');

        this.load.image('road', 'road.png');

        // Characters a-z
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(97 + i); 
            this.load.image(`char_${letter}`, `characters/char_${letter}.png`);
        }

        // Characters 0-9
        for (let i = 0; i < 10; i++) {
            this.load.image(`char_${i}`, `characters/char_${i}.png`);
        }
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('Menu');
    }
}
