import Phaser from 'phaser';

export class Glider {
    public sprite: Phaser.Physics.Arcade.Sprite;
    private angle = 0;
    private body: Phaser.Physics.Arcade.Body;

    private thrustForce = 200;
    private isThrusting = false;
    
    private readonly MAX_DRAG = 0.97;
    private readonly BASE_DRAG = 0.995;
    private readonly ROTATION_SMOOTHING = 6.0;
    private readonly THRUST_ROTATION_FORCE = 1.2;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        this.sprite = scene.physics.add.sprite(x, y, texture);


        this.body = this.sprite.body as Phaser.Physics.Arcade.Body;

        this.body.allowGravity = false;

        this.angle = this.sprite.rotation;
    }

    handleInput(thrustPressed: boolean) {
        this.isThrusting = thrustPressed;
    }

    update(dt: number) {
        let vx = this.body.velocity.x;
        let vy = this.body.velocity.y;
        const speed = Math.hypot(vx, vy);

        const gravity = 300;


        //drag
        const drag = Math.max(this.MAX_DRAG, this.BASE_DRAG - speed/100000);

        //lift
        const optimalAngle = -Math.PI / 6;
        const angleDiff = Math.abs(this.angle - optimalAngle);
        const liftFactor = Math.max(0, 1-(angleDiff/(Math.PI/2)));
        const lift = -0.5 * speed * liftFactor/2;

        //rotation
        const velAngle = Math.atan2(vy, vx);
        this.angle += (velAngle - this.angle)* this.ROTATION_SMOOTHING *dt;
        if (this.isThrusting) {

            const newAngle = velAngle - this.THRUST_ROTATION_FORCE * dt;
            vx = Math.cos(newAngle) * speed;
            vy = Math.sin(newAngle) * speed;
            this.angle = newAngle;
        

            this.angle -= this.THRUST_ROTATION_FORCE * dt;
        }

        this.sprite.rotation = this.angle;

        
        

        

        


        //thrust!
        
        let thrustX = 0;
        let thrustY = 0;
        if (this.isThrusting) {
            thrustX = Math.cos(this.angle) * this.thrustForce;
            thrustY = Math.sin(this.angle) * this.thrustForce;
        }

        //final set
        this.body.setVelocity((vx + thrustX*dt) * drag, (vy + thrustY * dt + gravity*dt + lift*dt) * drag);
    }

}