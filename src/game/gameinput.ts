import { Scene } from 'phaser';

export class GameInput {
    private scene: Scene;
    private spaceKey: Phaser.Input.Keyboard.Key;


    constructor(scene: Scene) {
        this.scene = scene;
        
        //setup input
        this.spaceKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    public isThrusting(): boolean {
        return this.spaceKey.isDown;
    }



}