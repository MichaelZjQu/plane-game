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
    private readonly BASE_DRAG = 0.997;
    private readonly ROTATION_SMOOTHING = 6.0;
    private readonly THRUST_ROTATION_FORCE = 2.0;

    private weightMultiplier = 1;
    private fuelMultiplier = 1;

    private magnetRange = 0;

    private bBoostMulti = 0;
    private boostCooldownEnd = 0;

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

    public handleInput(thrustPressed: boolean) {
        this.isThrusting = thrustPressed && this.currentFuel > 0 && this.isLaunched;
    }

    public reduceDrag(amount: number): void {
        this.dragDenominator += amount;
    }

    public setWeightMultiplier(multiplier: number): void {
        this.weightMultiplier = multiplier;
    }

    public setFuelMultiplier(multiplier: number): void {
        this.fuelMultiplier = multiplier;
        this.maxFuel = 100 * this.fuelMultiplier;
        this.currentFuel = this.maxFuel;
    }

    public setThrustMultiplier(multiplier: number): void {
        this.thrustForce = 200 * multiplier;
    }

    public setMagnetRange(range: number): void {
        this.magnetRange = range;
    }

    public setBBoostMulti(multiplier: number): void {
        this.bBoostMulti = multiplier;
    }

    public berryBoost(): void {
        if (this.bBoostMulti > 0) {
            const currentTime = Date.now();
            
            if (currentTime >= this.boostCooldownEnd) {
                const boostMultiplier = 1 + (this.bBoostMulti * 0.2); 
                
                const currentVx = this.body.velocity.x;
                const currentVy = this.body.velocity.y;
                
                this.body.setVelocity(
                    currentVx * boostMultiplier,
                    currentVy
                );
                
                //3 sec cd
                this.boostCooldownEnd = currentTime + 3000;
            }
        }
    }

    update(dt: number) {
        let vx = this.body.velocity.x;
        let vy = this.body.velocity.y;
        const totalSpeed = Math.hypot(vx, vy);

        // Calculate base physics
        const drag = Math.max(this.MAX_DRAG, this.BASE_DRAG - totalSpeed/this.dragDenominator);
        const gravity = 300 * this.weightMultiplier;


        //lift
        const optimalAngle = -Math.PI / 6;
        const angleDiff = Math.abs(this.angle - optimalAngle);
        const liftFactor = Math.max(0, 1-(angleDiff/(Math.PI/2)));
        const lift = -0.5 * totalSpeed * liftFactor/2;

        //rotation
        const velAngle = Math.atan2(vy, vx);
        this.angle += (velAngle - this.angle)* this.ROTATION_SMOOTHING *dt;
        if (this.isThrusting) {
            //fuel
            this.currentFuel = Math.max(0, this.currentFuel - this.fuelConsumptionRate * dt);

            const currentAngleDegrees = Phaser.Math.RadToDeg(this.angle);
            const maxUpwardAngle = -20;
            
            if (currentAngleDegrees > maxUpwardAngle) {
                const newAngle = velAngle - this.THRUST_ROTATION_FORCE * dt;
                vx = Math.cos(newAngle) * totalSpeed;
                vy = Math.sin(newAngle) * totalSpeed;
                this.angle = newAngle;
                
                this.angle -= this.THRUST_ROTATION_FORCE * dt;
            }
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

    public getCurrentFuel(): number {
        return this.currentFuel;
    }

   public  getMaxFuel(): number {
        return this.maxFuel;
    }

    public getMagnetRange(): number {
        return this.magnetRange;
    }

    public launched(): boolean {
        return this.isLaunched;
    }
}