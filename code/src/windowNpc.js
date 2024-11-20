class WindowNPC extends SSAnimationObject
{
    constructor(position, window, world, windowPool)
    {
        super(
            position,
            0,
            new Vector2(2 / PTM, -2 / PTM),
            assets.npcs.img,
            32,
            33,
            [6, 12, 6, 12, 6, 12],
            1 / 12
        );

        // Spawn position
        this.window = window;
        this.windowPool = windowPool;

        // Movement params
        this.direction = 1;
        this.speed = 200;
        this.dropedHeight = 0;

        // Tipes of sprites
        this.numNpcs = 3;
        this.anim = 0;

        // Npc states
        this.droped = false;
        this._goToSave = false;
        this.onTrampoline = false;
        this.picked = false;
        this.canBePicked = true;
        this.active = false;
        this.canCheckDied = false;
        this.runningAnim = false;
        this.saved = false;

        // Box2d
        this.world = world;
        this.bodyDef = null;
        this.body = null;
        this.shape = null;
        this.fixtureDef = null;
        this.fixture = null;

        // create ground sensor
        this.npc_footSensorShape = null;
        this.npc_footSensorFixture = null;
        this.npc_footSensor = null;
    }

    Start()
    {
        super.Start();
        this.PlayAnimationLoop(this.SelectAnim());

        // Set initial position near the window
        this.position.x = this.window.x + 0.5;
        this.position.y = this.window.y + 0.8;
        
        // Box2d Setup
        this.ActiveBox2dParams();

        // Set up volume for saved and died sounds
        sounds.saved.sound.volume = efectsvolume;
        sounds.died.sound.volume = efectsvolume;
    }

    Update(deltaTime)
    {
        if(this.body)
        {
            // If NPC is not dropped, update its position based on Box2D physics
            if (!this.droped) 
            {
                // Set fixture as sensor
                this.body.GetFixtureList().SetSensor(true);
                this.body.SetTransform(new Box2D.b2Vec2(this.position.x, this.position.y), this.body.GetAngle());
            }
            // If NPC is dropped and needs to be saved, move towards save point
            else if(this._goToSave)
            {
                this.body.SetGravityScale(0);
                this.body.GetFixtureList().SetSensor(true);
                // Move NPC towards the save point
                this.GoToSave(deltaTime);

                // Update position based on Box2D body
                var position = this.body.GetPosition();
                this.position.x = position.get_x();
                this.position.y = position.get_y() + 0.3;
            }
            // Falling
            else
            {
                // Update position based on Box2D body
                var position = this.body.GetPosition();
                this.position.x = position.get_x();
                this.position.y = position.get_y() + 0.3;
            }

            // If NPC needs to check if it died (fell too far)
            if(this.canCheckDied)
            {
                this.CheckDied();
            }  

            // If NPC has been saved
            if(this.saved)
            {
                // Reset params
                this.runningAnim = false;
                this.saved = false;
                this.droped = false;
                this.active = false;
                this.canBePicked = true;
                this.canCheckDied = false;

                // Deactivate Box2D parameters
                this.DeactiveBox2dParams();
                // Handle NPC save in the NPC pool
                this.windowPool.HandleNpcSave(this);
                // Increase score for saving NPC
                score += 25;
            }
        } 

        super.Update(deltaTime);
    }
    Draw(ctx)
    {
        super.Draw(ctx);
    }

    // Physics collision handlers for NPC
    _BeginContact(contact)
    {
        if(!this.body) return;

        const contactA = contact.GetFixtureA();
        const contactB = contact.GetFixtureB();

        if(this.droped)
        {
            // Contact with platform
            if(contactA.name === "NPC_FootSensor" && contactB.name === "Platform")
            {
                if(!this.onTrampoline)
                    // NPC is no longer dropped
                    this.droped = false;
            }
            else if(contactA.name === "Platform" && contactB.name === "NPC_FootSensor")
            {
                if(!this.onTrampoline)
                    this.droped = false;
            }
            // Contact with trampoline
            if(contactA.name === "NPC_FootSensor" && contactB.name === "Trampoline")
            {
                // NPC is on the trampoline
                this.onTrampoline = true;
            }
            else if(contactA.name === "Trampoline" && contactB.name === "NPC_FootSensor")
            {
                this.onTrampoline = true;
            }
            // Contact with ground
            else if(contactA.name === "NPC_FootSensor" && contactB.name === "Ground")
            {
                // NPC is dropped
                this.droped = true;
                // NPC can check if it died
                this.canCheckDied = true;
            }
            else if(contactA.name === "Ground" && contactB.name === "NPC_FootSensor")
            {
                this.droped = true;
                this.canCheckDied = true;
            }

            // Contact with window limit (indicating NPC is saved)
            if(contactA.name === "WindowNpc" && contactB.name === "Limit")
            {
                this._goToSave = false; // NPC stops moving towards save point
                this.onTrampoline = false; // NPC is no longer on trampoline
                this.saved = true; // NPC is saved
                sounds.saved.sound.play(); // Play saved sound effect   
            }
            else if(contactA.name === "Limit" && contactB.name === "WindowNpc")
            {
                this._goToSave = false;
                this.onTrampoline = false;
                this.saved = true;
                sounds.saved.sound.play();  
            }
        }     
    }

    ActiveBox2dParams()
    {
        console.log(this.position);
        this.bodyDef = new Box2D.b2BodyDef();
        this.bodyDef.set_type(Module.b2_dynamicBody);
        this.bodyDef.set_fixedRotation(true);
        this.bodyDef.set_position(new Box2D.b2Vec2(this.position.x, this.position.y));

        this.body = this.world.CreateBody(this.bodyDef);

        this.shape = new Box2D.b2PolygonShape();
        this.shape.SetAsBox(0.5, 0.5);

        this.fixtureDef = new Box2D.b2FixtureDef();
        this.fixtureDef.shape = this.shape;
        this.fixtureDef.isSensor = true;
        this.fixtureDef.density = 1.0;
        this.fixtureDef.friction = 0;
        this.fixtureDef.restitution = 0;

        this.fixture = this.body.CreateFixture(this.fixtureDef);
        this.fixture.name = "WindowNpc";
        userDataMap.set(this.fixture, this);

        // Create ground  sensor
        this.npc_footSensorShape = new Box2D.b2PolygonShape();
        this.npc_footSensorShape.SetAsBox(0.4, 0.1, new Box2D.b2Vec2(0, -0.45), 0);
        this.npc_footSensorFixture = new Box2D.b2FixtureDef();
        this.npc_footSensorFixture.shape = this.npc_footSensorShape;
        this.npc_footSensorFixture.isSensor = true; 
        this.npc_footSensor = this.body.CreateFixture(this.npc_footSensorFixture);
        this.npc_footSensor.name = "NPC_FootSensor";
        userDataMap.set(this.npc_footSensor, this);
    }

    DeactiveBox2dParams()
    {
        // Destroy all fixtures and body
        if (this.body) 
        {
            this.world.DestroyBody(this.body);
            this.body = null;
        }

        // Clear references to Box2D parameters
        this.bodyDef = null;
        this.shape = null;
        this.fixtureDef = null;
        this.fixture = null;
        this.npc_footSensorShape = null;
        this.npc_footSensorFixture = null;
        this.npc_footSensor = null;
    }

    GoToSave(deltaTime)
    {
        if(!this.runningAnim)
        {
            // Play anim of the current sprite tipe
            this.PlayAnimationLoop(this.anim * 2 + 1);
            this.runningAnim = true;
        }

        // Cannot be picked by player
        this.canBePicked = false;

        // Set linear velocity
        let velocity = new Box2D.b2Vec2(this.speed * deltaTime, 0);
        this.body.SetLinearVelocity(velocity);
    }

    CheckDied()
    {
        // Check height
        if(this.dropedHeight > 2 && !this.onTrampoline)
        {
            // If is to high npc dies
            this.DeactiveBox2dParams();
            this.windowPool.HandleNpcSave(this);
            sounds.died.sound.play();  
            score -= 25;
        }
        else
        {
            // Go to save position
            this._goToSave = true;
        }

        this.canCheckDied = false;
    }

    SelectAnim()
    {
        this.anim = RandomBetweenInt(0, this.numNpcs - 1);

        return this.anim * 2;
    }
}



class WindowNPC_Pool
{
    constructor(world)
    {
        this.world = world;

        // Window
        this.spots = [];
        this.fires = [];

        // NPC
        this.NpcArray = [];
        this.activeNpcs = [];
        this.maxNpcs = 9;   
        this.currentNpcs = 4;    
    }

    Start()
    {
        this.SetUp();

        // Active the first 3 Npcs on random windows
        for (let i = 0; i < this.currentNpcs; i++) 
        {
            this.ActivateNpc();
        }

        this.fires.forEach(fire => {
            fire.Start();
        });
    }

    Update(deltaTime)
    {
        // Update actives Npcs
        this.activeNpcs.forEach(npc => npc.Update(deltaTime));

        this.fires.forEach(fire => {
            fire.Update(deltaTime);
        });
    }

    Draw(ctx)
    {
        this.fires.forEach(fire => {
            fire.Draw(ctx);
        });

        // Update actives Npcs
        this.activeNpcs.forEach(npc => npc.Draw(ctx));

    }

    SetUp()
    {
        // Create windows
        let columns = 3;
        let rows = 3;
        let x = 5.7;
        let y = -19.45;

        for(let col = 0; col < columns; col++)
        {
            for(let row = 0; row < rows; row++)
            {
                var platform = new PhysicPlatform(new Vector2(x, y), this.world, true, new Vector2(3.8, 0.3));
                this.spots.push(platform);

                // Set fire sprite on window
                let rdn = RandomBetweenInt(0, 1);
                if(rdn === 0)
                {
                    var fire = new Fire(new Vector2(x - 1, y + 1.4));
                    this.fires.push(fire);
                }

                x += 6.6;
            }

            x = 5.7;
            y += 4.6;
        }


        // Create all Npcs
        for(let i = 0; i < this.maxNpcs; i++)
        {
            let windowNpc = new WindowNPC(new Vector2(0,0), new Vector2(this.spots[i].position.x, this.spots[i].position.y + 0.3), this.world, this);
            windowNpc.secondName = i;
            this.NpcArray.push(windowNpc);
        }
    }

    ActivateNpc() 
    {
        if (this.activeNpcs.length < this.maxNpcs) 
        {
            // Choose a random window without an Npc
            let randomIndex;
            do {
                randomIndex = RandomBetweenInt(0, this.spots.length - 1);               
            } while (this.NpcArray[randomIndex].active); // Check if window is ocupy

            // Active Npc on the window
            this.activeNpcs.push(this.NpcArray[randomIndex]);
            this.NpcArray[randomIndex].active = true;
            this.NpcArray[randomIndex].Start();
        }
    }

    DeactivateNpc(npc) 
    {
        const index = this.activeNpcs.indexOf(npc);
        if (index !== -1) 
        {
            this.activeNpcs.splice(index, 1);
            npc.active = false;
            npc = null;
        }
    }

    
    HandleNpcSave(npc) 
    {
        // Deactive Npc if is died or saved
        this.DeactivateNpc(npc);

        // Active new Npc if there are any 
        if (this.activeNpcs.length < this.currentNpcs) 
        {
            this.ActivateNpc();
        }
    }
}