
class Enemy extends SSAnimationObject
{
    constructor(position, world)
    {
        // Call the superclass constructor with initial parameters
        super(
            position,
            0,
            new Vector2(4 / PTM, -4 / PTM),
            assets.enemy.img,
            32,
            44,
            [8, 4],
            1 / 12
            
        );

        // Attack rate parameters
        this.atackRate = 3;
        this.atackRateAux = 0;

        this.direction = 1;

        // Reference to the Box2D world
        this.world = world;

        // Proyectiles parameters
        this.fireBalls = [];
        this.activeFireBalls = [];
        this.maxFireBalls = 10;
    }

    Start()
    {
        super.Start();
        this.PlayAnimationLoop(0);// Idle animation

        // Initialize the array of fireballs
        for(let i = 0; i < this.maxFireBalls; i++)
        {
            var fireBall = new FireBall(new Vector2(0, 0), this.world);// Create
            this.fireBalls.push(fireBall);// Add
        }
    }
    Update(deltaTime)
    {
        // Only update if the game has started
        if(gameStart)
        {
            // Check if enough time has passed to attack again
            if(this.atackRateAux >= this.atackRate)
            {
                this.atackRateAux = 0;
                this.PlayAnimationLoop(1);// Play the shooting animatio
    
                // Delay before shooting after animation switch
                setTimeout(() => {
                    this.PlayAnimationLoop(0);
                    // Perform the shooting action
                    this.Shoot();
                    if(this.atackRate > 0.3)
                        this.atackRate -= deltaTime;
                }, 200);
            }
            else
            {
                this.atackRateAux += deltaTime;
            }
    
            this.activeFireBalls.forEach(fireBall => {
                fireBall.Update(deltaTime);
            });
    
            this.HandleDeactiveBalls();
        }

        super.Update(deltaTime);
    }
    Draw(ctx)
    {
        this.activeFireBalls.forEach(fireBall => {
            fireBall.Draw(ctx);
        });
        super.Draw(ctx);
    }

    Shoot()
    {
        // Get the first fireball from the array
        var currentFireBall = this.fireBalls[0];

        if(currentFireBall)
        {
            // Remove the fireball from the array
            this.fireBalls.splice(0,1);
            this.activeFireBalls.push(currentFireBall);

            // Initialize the fireball object
            currentFireBall.Start();
    
            // Set initial position for the fireball
            currentFireBall.body.SetTransform(new Box2D.b2Vec2(13.5, -2.5), currentFireBall.body.GetAngle());
    
            // Initial direction
            this.direction = RandomBetweenInt(-1, 1);

            // Calculate and apply an impulse force to the fireball
            const impulse = new Box2D.b2Vec2(this.direction * 10, 0);
            currentFireBall.body.ApplyLinearImpulse(impulse, currentFireBall.body.GetWorldCenter(), true);
        }        
    }

    HandleDeactiveBalls()
    {
        for(let i = 0; i < this.activeFireBalls.length; i++)
        {
            // Check if the fireball is no longer active
            if(this.activeFireBalls[i].deactive)
            {
                // Add the fireball back to the array
                this.fireBalls.push(this.activeFireBalls[i]);

                // Remove the fireball from active fireballs
                this.activeFireBalls.splice(i, 1);
            }
        }
    }
}

class FireBall extends SSAnimationObject
{
    constructor(position, world)
    {
        super(
            position,
            0,
            new Vector2(3 / PTM, -3 / PTM),
            assets.fireBall.img,
            18.06,
            32,
            [8, 8],
            1 / 12
        );

        // Fireball movement parameters
        this.speed = 400;
        this.speedAux = 0;
        this.direction = 1;
        this.deactive = true;
        this.physic = true;
        this.speedY;

        // Reference to the Box2D world
        this.world = world;

        // Box2D physics parameters
        this.shape = null;
        this.bodyDef = null;
        this.body = null;
        this.fixture = null;
    }

    Start()
    {
        // Activate Box2D physics parameters
        this.ActiveBox2dParams();
        super.Start();
        this.PlayAnimationLoop(1);

    }

    Update(deltaTime)
    {
        if(!this.deactive)
        {
            if(!this.physic)
            {
                this.speedY = 0.1;
            }
            else
            {
                this.speedY = this.body.GetLinearVelocity().get_y();
            }

            // Update the fireball's linear velocity using Box2D physics
            let velocity = new Box2D.b2Vec2(this.direction * this.speed * deltaTime, this.speedY);
            this.body.SetLinearVelocity(velocity);
    
            // Get the current position of the fireball
            let currentPosition = this.body.GetPosition();   
            // Update the position of the fireball object based on Box2D physics
            this.position.x = currentPosition.get_x() - 0.5;
            this.position.y = currentPosition.get_y() + 0.15;

            super.Update(deltaTime);
        }
        else
        {
            // Deactivate Box2D physics parameters
            this.DeactiveBox2dParams();
        }
    }

    Draw(ctx)
    {
        if(!this.deactive)
            super.Draw(ctx);
    }

    _BeginContact(contact)
    {
        const contactA = contact.GetFixtureA();
        const contactB = contact.GetFixtureB();

        // Handle contact with platforms
        if(contactA.name === "FireBall" && contactB.name === "Platform")
        {
            // Disable physics for the fireball
            this.physic = false;
            // Randomize the horizontal direction
            this.direction = RandomBetweenInt(0, 1);
            // Convert random value to direction
            this.direction = (this.direction === 1) ? -1 : 1;
        }
        else if(contactA.name === "Platform" && contactB.name === "FireBall")
        {
            this.physic = false;
            this.direction = RandomBetweenInt(0, 1);
            this.direction = (this.direction === 1) ? -1 : 1;
        }  
        
        // Handle contact with ground
        if(contactA.name === "FireBall" && contactB.name === "Ground")
        {
            // Disable physics for the fireball
            this.physic = false;
            // Randomize the horizontal direction
            this.direction = RandomBetweenInt(0, 1);
            // Convert random value to direction
            this.direction = (this.direction === 1) ? -1 : 1;
        }
        else if(contactA.name === "Ground" && contactB.name === "FireBall")
        {
            this.physic = false;
            this.direction = RandomBetweenInt(0, 1);
            this.direction = (this.direction === 1) ? -1 : 1;
        } 

        // Handle contact with limits
        if(contactA.name === "FireBall" && contactB.name === "Limit")
        {
            this.physic = true;
            // Deactivate the fireball
            this.deactive = true;
        }
        else if(contactA.name === "Limit" && contactB.name === "FireBall")
        {
            this.physic = true;
            this.deactive = true;
        } 
    }

    _EndContact(contact)
    {
        const endContactA = contact.GetFixtureA();
        const endContactB = contact.GetFixtureB();
        
        // Handle end of contact with platforms
        if(endContactA.name === "FireBall" && endContactB.name === "Platform")
        {
            // Enable physics for the fireball
            this.physic = true;
        }
        else if(endContactA.name === "Platform" && endContactB.name === "FireBall")
        {
            this.physic = true;
        }
    }

    ActiveBox2dParams()
    {
        // Set the fireball as active
        this.deactive = false;

        // Shape
        this.shape = new Box2D.b2PolygonShape();
        this.shape.SetAsBox(0.4, 0.4);
        
        // Body
        this.bodyDef = new Box2D.b2BodyDef();

        this.bodyDef.set_type(Module.b2_dynamicBody);
        this.bodyDef.position.Set(this.position.x, this.position.y);
        this.bodyDef.set_fixedRotation(true);

        this.body = this.world.CreateBody(this.bodyDef);
        this.body.SetGravityScale(0.5);

        // Fixture
        this.fixture = this.body.CreateFixture(this.shape, 1);
        this.fixture.SetFriction(0);
        this.fixture.SetSensor(true);
        this.fixture.name = "FireBall";
        this.body.GetFixtureList().SetRestitution(0);  

        // Map the fixture to its corresponding FireBall object
        userDataMap.set(this.fixture, this);
    }

    DeactiveBox2dParams()
    {
        // Destroy all fixtures and body
        if (this.body) 
        {
            this.body.SetTransform(new Vector2(0, 0), this.body.GetAngle());
            this.world.DestroyBody(this.body);
            this.body = null;
        }

        // Clear references to Box2D parameters
        this.bodyDef = null;
        this.shape = null;
        this.fixture = null;
        this.position = new Vector2(0,0);
    }
}