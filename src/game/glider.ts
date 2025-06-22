import Phaser from 'phaser';

export class Glider {
    public sprite: Phaser.Physics.Arcade.Sprite;
    private angle = 0;
    private body: Phaser.Physics.Arcade.Body;

    private thrustForce = 200;
    private isThrusting = false;
    private isLaunched = false;

    private maxFuel = 100;
    private currentFuel = 100;
    private fuelConsumptionRate = 30;

    private dragDenominator = 100000;

    
    private readonly MAX_DRAG = 0.97;
    private readonly BASE_DRAG = 0.995;
    private readonly ROTATION_SMOOTHING = 6.0;
    private readonly THRUST_ROTATION_FORCE = 2.0;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        this.sprite = scene.physics.add.sprite(x, y, texture).setScale(0.15);


        this.body = this.sprite.body as Phaser.Physics.Arcade.Body;

        this.body.allowGravity = false;

        this.angle = this.sprite.rotation;
    }

    public launch(power: number, angle: number): void {
        this.sprite.setVisible(true);
        this.isLaunched = true; 
        
        //componenets
        const radians = Phaser.Math.DegToRad(angle);
        const vx = Math.cos(radians) * power;
        const vy = Math.sin(radians) * power;
        
        this.body.setVelocity(vx, vy);
        
        this.angle = radians;
        this.sprite.rotation = this.angle;
    }

    handleInput(thrustPressed: boolean) {
        this.isThrusting = thrustPressed && this.currentFuel > 0 && this.isLaunched;
    }

    boost(angle : number, velocity: number) {
        const vx = this.body.velocity.x;
        const vy = this.body.velocity.y;
        const speed = Math.hypot(vx, vy);

        const velAngle = Math.atan2(vy, vx);

        const newAngle = velAngle - angle;
        const newSpeed = speed + velocity;

        const newVx = Math.cos(newAngle) * newSpeed;
        const newVy = Math.sin(newAngle) * newSpeed;
        
        this.body.setVelocity(newVx, newVy);
        this.angle = newAngle;

    }

    update(dt: number) {
        let vx = this.body.velocity.x;
        let vy = this.body.velocity.y;
        const speed = Math.hypot(vx, vy);

        const gravity = 300;


        //drag
        const drag = Math.max(this.MAX_DRAG, this.BASE_DRAG - speed/this.dragDenominator);

        //lift
        const optimalAngle = -Math.PI / 6;
        const angleDiff = Math.abs(this.angle - optimalAngle);
        const liftFactor = Math.max(0, 1-(angleDiff/(Math.PI/2)));
        const lift = -0.5 * speed * liftFactor/2;

        //rotation
        const velAngle = Math.atan2(vy, vx);
        this.angle += (velAngle - this.angle)* this.ROTATION_SMOOTHING *dt;
        if (this.isThrusting) {
            //fuel
            this.currentFuel = Math.max(0, this.currentFuel - this.fuelConsumptionRate * dt);

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

        let newVx = (vx + thrustX*dt) * drag
        let newVy = (vy + thrustY * dt + gravity*dt + lift*dt) * drag

        if(this.body.y >= 520){
                this.body.y = 520;
                newVx *= 0.97;
                if(Math.abs(newVx) < 10){
                    newVx = 0; 
                }

                if (newVy > 0) {
                    newVy = 0; // no up when on ground
                }
            }

        //final set
        this.body.setVelocity(newVx, newVy);
    }

    getCurrentFuel(): number {
        return this.currentFuel;
    }

    getMaxFuel(): number {
        return this.maxFuel;
    }

}