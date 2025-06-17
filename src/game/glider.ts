import Phaser from 'phaser';

export class Glider {
    public sprite: Phaser.Physics.Arcade.Sprite;
    private angle = 0;
    private body!: Phaser.Physics.Arcade.Body;
    
    private readonly MAX_DRAG = 0.97;
    private readonly BASE_DRAG = 0.995;
    private readonly ROTATION_SMOOTHING = 0.1;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        this.sprite = scene.physics.add.sprite(x, y, texture);


        this.body = this.sprite.body as Phaser.Physics.Arcade.Body;

        this.body.allowGravity = false;

        this.angle = this.sprite.rotation;
    }

    update(dt: number) {
        const vx = this.body.velocity.x;
        const vy = this.body.velocity.y;
        const speed = Math.hypot(vx, vy);

        const gravity = 300;


        //drag
        const drag = Math.max(this.MAX_DRAG, this.BASE_DRAG - speed/100000);

        //rotation
        const targetRotation = Math.atan2(vy, vx);
        this.angle = this.angle + (targetRotation - this.angle)* this.ROTATION_SMOOTHING;

        const optimalAngle = -Math.PI / 6;
        const angleDiff = Math.abs(this.angle - optimalAngle);
        const liftFactor = Math.max(0, 1-(angleDiff/(Math.PI/2)));
        const lift = -0.5 * speed * liftFactor;

        this.body.setVelocity(vx * drag, vy * drag + gravity*dt + lift*dt);

        this.sprite.rotation = this.angle;
    }

}