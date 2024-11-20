
class Trampoline extends SSAnimationObject
{
    constructor(position, world)
    {
        super(
            position,
            0,
            new Vector2(2 / PTM, -2 / PTM),
            assets.player.img,
            78,
            34,
            [0, 0, 0, 1],
            1 /16
        );

        this.direction = -1;
        this.speed = 100;

        // Reference to Box2D world
        this.world = world;

        // Box2d params
        this.shape = new Box2D.b2PolygonShape();
        this.shape.SetAsBox(1.3, 0.25);
        
        this.bodyDef = new Box2D.b2BodyDef();
        this.bodyDef.set_type(Module.b2_dynamicBody);

        this.bodyDef.position.Set(position.x, position.y);
        this.bodyDef.set_fixedRotation(true);

        this.body = this.world.CreateBody(this.bodyDef);

        this.fixture = this.body.CreateFixture(this.shape, 1.0);
        this.fixture.name = "Trampoline"
        this.fixture.SetFriction(0);
        // Set high restitution (bounciness)
        this.body.GetFixtureList().SetRestitution(1);    
    }

    Start()
    {
        super.Start();
        this.PlayAnimationLoop(3);
    }

    Update(deltaTime)
    {
        // Update trampoline movement
        this.Movement(deltaTime);
        // Update sprite position to match the physical body
        let currentPosition = this.body.GetPosition();

        this.position.x = currentPosition.x - 0.1;
        this.position.y = currentPosition.y + 0.7;

        super.Update(deltaTime);
    }

    Draw(ctx)
    {
        super.Draw(ctx);
    }

    

    Movement(deltaTime)
    {
        // Adjust direction based on trampoline's X position
        if(this.position.x <= 2)
        {
            this.direction = 1;
        }
        else if(this.position.x >= 22)
        {
            this.direction = -1;
        }

        // Set trampoline's linear velocity
        let velocity = new Box2D.b2Vec2(this.speed * this.direction * deltaTime, 0);
        this.body.SetLinearVelocity(velocity);
    }
}