import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { Menu } from './scenes/Menu';
import { Intro } from './scenes/Intro';
import { Upgrade } from './scenes/Upgrade';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { Win1 } from './scenes/Win1';


const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 800,
    height: 600,
    title: "A Sparrow's Quest",
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 300 },
            debug: false
        }
    },
    scene: [
        Boot,
        Preloader,
        Intro,
        Menu,
        MainGame,
        Upgrade,
        Win1
        
    ]
    
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
