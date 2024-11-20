
class Player extends SSAnimationObject
{
    constructor(position, world, trampoline)
    {
        super(
            position,
            0,
            new Vector2(2 / PTM, -2 / PTM),
            assets.player.img,
            32.025,
            32.025,
            [6, 5, 12],
            1/16
        );

        // Player-specific properties
        this.playerDirection = Vector2.Zero();
        this.speed = 700;
        this.jumpForce = 3.5;
        this.isOnGround = false;
        this.throwDirection = 0;
        this.visible = false;
        this.lives = 3;

        this.canPick = false;
        this.picked = false;
        this.npcFixture = null;

        this.hit = false;
        this.hitTime = 1.5;
        this.blinkInterval = 0.1;
        this.hitTimeAux = 0;
        this.fireBallFixture = null;

        this.trampoline = trampoline;

        // Box2D parameters
        this.shape = new Box2D.b2PolygonShape();
        this.shape.SetAsBox(0.4, 0.6);

        this.bodyDef = new Box2D.b2BodyDef();
        this.bodyDef.set_type(Module.b2_dynamicBody);
        this.bodyDef.set_fixedRotation(true);
        this.bodyDef.position.Set(position.x, position.y);

        this.world = world;
        this.body = this.world.CreateBody(this.bodyDef);
        this.body.SetGravityScale(1);
        
        this.fixture = this.body.CreateFixture(this.shape, 1); 
        this.fixture.name = "Player";
        this.fixture.SetFriction(0);
        this.fixture.SetSensor(false);
        this.fixture.SetDensity(1.0);
        this.body.GetFixtureList().SetRestitution(0.001);
        userDataMap.set(this.fixture, this);

        // Create foot sensor fixture for ground detection
        let footSensorShape = new Box2D.b2PolygonShape();
        footSensorShape.SetAsBox(0.3, 0.1, new Box2D.b2Vec2(0, -0.6), 0); // Positioned just below the player
        let footSensorFixture = new Box2D.b2FixtureDef();
        footSensorFixture.shape = footSensorShape;
        footSensorFixture.isSensor = true; // Set as sensor
        this.footSensor = this.body.CreateFixture(footSensorFixture);
        this.footSensor.name = "FootSensor";
        userDataMap.set(this.footSensor, this);
    }

    Start()
    {
        super.Start();
        this.PlayAnimationLoop(0); // idle animation

        // Set volume for various sound effects
        sounds.jump.sound.volume = efectsvolume;
        sounds.trampoline.sound.volume = efectsvolume;
        sounds.damage.sound.volume = efectsvolume;
    }

    Update(deltaTime)
    {
        if(gameStart)
        {
            // Update player movement and actions
            this.Movement(deltaTime);
            this.PickNPC();   
            this.ReleaseNPC();
    
            // Handle player being hit
            if(this.hit)
            {
                this.Hit(deltaTime);
                this.SetSensor();
            }
            
            // Check if player has died
            this.CheckDied();
        }

        super.Update(deltaTime);
    }

    Draw(ctx)
    {
        if(this.visible)
        {
            if (this.playerDirection.x < 0)
                this.scale.x = -2 / PTM;
            if (this.playerDirection.x > 0)
                this.scale.x = 2 / PTM;
    
            super.Draw(ctx);
        }
    }

    // Physics collision handlers for player
    _BeginContact(contact)
    {
        const contactA = contact.GetFixtureA();
        const contactB = contact.GetFixtureB();

        // Ground and platform contact detection
        if(contactA.name === "FootSensor" && contactB.name === "Ground")
        {
            this.isOnGround = true;
        }
        else if(contactA.name === "Ground" && contactB.name === "FootSensor")
        {
            this.isOnGround = true;
        }
        else if(contactA.name === "FootSensor" && contactB.name === "Platform")
        {
            this.isOnGround = true;
        }
        else if(contactA.name === "Platform" && contactB.name === "FootSensor")
        {
            this.isOnGround = true;
        }

        // Npc contact detection
        if(contactA.name === "Player" && contactB.name === "WindowNpc")
        {
            console.log("Contact");
            this.canPick = true;
            if(this.npcFixture === null)
                this.npcFixture = contactB;
        }
        else if(contactA.name === "WindowNpc" && contactB.name === "Player")
        {
            console.log("Contact");
            this.canPick = true;
            if(this.npcFixture === null)
                this.npcFixture = contactA;
        }    
        
        // Fireball contact detection
        if(contactA.name === "Player" && contactB.name === "FireBall")
        {
            if(!this.hit)
            {
                this.hit = true;  
                sounds.damage.sound.play();               
            }             
        }
        else if(contactA.name === "FireBall" && contactB.name === "Player")
        {
            if(!this.hit)
            {
                this.hit = true;  
                sounds.damage.sound.play();          
            }                     
        } 

        // Trampoline contact detection
        if(contactA.name === "FootSensor" && contactB.name === "Trampoline")
        {
            sounds.trampoline.sound.play();
        }
        else if(contactA.name === "Trampoline" && contactB.name === "FootSensor")
        {
            sounds.trampoline.sound.play();
        }
    }

    SetSensor()
    {
        // Set fireball fixture as sensor
        if(this.fireBallFixture)
        {
            this.fireBallFixture.SetSensor(true);
        }
    }

    _EndContact(contact)
    {
        const endContactA = contact.GetFixtureA();
        const endContactB = contact.GetFixtureB();
        
        // Ground and platform end contact
        if(endContactA.name === "FootSensor" && endContactB.name === "Ground")
        {
            this.isOnGround = false;
        }
        else if(endContactA.name === "Ground" && endContactB.name === "FootSensor")
        {
            this.isOnGround = false;
        }
        else if(endContactA.name === "FootSensor" && endContactB.name === "Platform")
        {
            this.isOnGround = false;
        }
        else if(endContactA.name === "Platform" && endContactB.name === "FootSensor")
        {
            this.isOnGround = false;
        }

        // Npc end contact
        if(endContactA.name === "Player" && endContactB.name === "WindowNpc")
        {
            this.canPick = false;
            
            // Ensure picked npc doesn't become null when colliding with another npc
            if(this.npcFixture != null)
            {
                if(!userDataMap.get(this.npcFixture).picked)
                {
                    this.npcFixture = null;
                }
            }
        }
        else if(endContactA.name === "WindowNpc" && endContactB.name === "Player")
        {
            this.canPick = false;

            if(this.npcFixture != null)
            {
                if(!userDataMap.get(this.npcFixture).picked)
                {
                    this.npcFixture = null;
                }
            }
        }  
    }

    Movement(deltaTime)
    {
        // Reset player direction
        this.playerDirection.Set(0, 0);

        // Handle player movement based on input
        if (Input.IsKeyPressed(KEY_RIGHT))
        {
            this.playerDirection.x = 1; 
            this.throwDirection = 1; 
            
            // Set npc direction if holding one
            if(this.npcFixture != null)
            {
                userDataMap.get(this.npcFixture).direction = this.playerDirection.x;
            }
        }
        if (Input.IsKeyPressed(KEY_LEFT))
        {
            this.playerDirection.x = -1;  
            this.throwDirection = -1;  
            
            // Set npc direction if holding one
            if(this.npcFixture != null)
            {
                userDataMap.get(this.npcFixture).direction = this.playerDirection.x;
            }
        }
                
        // Update Box2D body velocity
        let velocity = new Box2D.b2Vec2(this.playerDirection.x * this.speed * deltaTime, this.body.GetLinearVelocity().get_y());
        this.body.SetLinearVelocity(velocity);

        // Update sprite position
        let currentPosition = this.body.GetPosition();
        this.position.x = currentPosition.x;
        this.position.y = currentPosition.y + 0.4;

        // Handle player jumping
        if(Input.IsKeyPressed(KEY_SPACE) && this.isOnGround)
        {
            // Apply vertical force for jump
            let jumpImpulse = new Box2D.b2Vec2(0, this.jumpForce);
            this.body.ApplyLinearImpulse(jumpImpulse, this.body.GetLocalCenter(), true);

            // Play jump sound
            sounds.jump.sound.play();
        }

        // Change animation based on player direction
        if (this.playerDirection.SqrLength() > 0) {
            if (this.actualAnimation != 2)
                this.PlayAnimationLoop(2); // run animation
        }
        else if (this.actualAnimation != 0)
            this.PlayAnimationLoop(0); // idle animation
    }

    PickNPC()
    {
        if(this.npcFixture != null)
        {
            const npc = userDataMap.get(this.npcFixture);

            if(Input.IsKeyPressed(KEY_E) && this.canPick && !npc.picked && npc.canBePicked)
            {
                npc.picked = true;
            }
            else if(npc.picked && this.npcFixture != null && npc.canBePicked)
            {
                // Set NPC position when picked up
                npc.position.x = this.position.x;
                npc.position.y = this.position.y + 0.6;
                npc.body.SetTransform(new Box2D.b2Vec2(this.position.x, this.position.y), 0);
                npc.droped = false; // Ensure NPC is not dropped
            }
        }
    }

    ReleaseNPC()
    {
        if(this.npcFixture != null)
        {
            const npc = userDataMap.get(this.npcFixture);

            // Release NPC if 'Q' key is pressed and NPC is picked
            if (Input.IsKeyPressed(KEY_Q) && npc.picked)
            {
                npc.picked = false;
    
                // Record the height from which the NPC was dropped
                npc.dropedHeight = this.position.y - (-21);
    
                npc.droped = true;
                npc.body.GetFixtureList().SetSensor(false); // Disable sensor
    
                // Ensure NPC has no residual velocity
                npc.body.SetLinearVelocity(new Box2D.b2Vec2(0, 0));
                npc.body.SetAngularVelocity(0);
    
                // Move body out of Player body before apply impulse
                const offset = 0.6;
                const newPosition = new Box2D.b2Vec2(this.position.x + this.throwDirection * offset, this.position.y);
                npc.body.SetTransform(newPosition, npc.body.GetAngle());
    
                // Apply an instantaneous impulse in the direction the player is facing
                const impulse = new Box2D.b2Vec2(this.throwDirection * 2, 0);
                npc.body.ApplyLinearImpulse(impulse, npc.body.GetWorldCenter(), true);
    
                this.npcFixture = null; // Reset NPC fixture
                this.canPick = false; // Reset pick state
            }
        }
    }

    Hit(deltaTime)
    {       
        this.hitTimeAux += deltaTime;

        // Handle player hit animation and effects
        if (this.hitTimeAux >= this.hitTime) 
        {
            // End of hit state
            this.hit = false;
            this.visible = true; // Ensure player is visible at the end
            this.hitTimeAux = 0;
            this.lives--;
        } 
        else 
        {
            // Toggle visibility to simulate blinking effect
            if (Math.floor(this.hitTimeAux / this.blinkInterval) % 2 == 0) 
            {
                this.visible = false;
            }             
            else 
            {
                this.visible = true;
            }
        }
    }

    CheckDied()
    {
        // Check if player has no lives left
        if(this.lives < 0)
        {
            sounds.backgroundMusic.sound.pause();

            // Change scene to game over
            ChangeScene(gameState.gameOver);
        }
    }
}