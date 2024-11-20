
var flag = false;

// Debug mode flag
var debug = true;

// Bit flags for debug drawing
var e_shapeBit = 0;
var e_jointBit = 0;
var e_aabbBit = 0;

if(debug)
{
    e_shapeBit = 0x0001;
    e_jointBit = 0x0002;
    e_aabbBit = 0x0004;
}

// Pixels to meters ratio
var PTM = 32;

// Placeholder for the contact listener
var listener;

// Map to store user data especiali fixture and their parents
var userDataMap = new Map();

// Variables for game state
var score = 0;
var elapsedTime = 0;
var gameStart = false;
var startCountdown = false;
var countLenght = 3.5;


class GameScene{
    constructor()
    {
        userDataMap.clear();
        elapsedTime = 0;
        score = 0;
        elapsedTime = 0;
        gameStart = false;
        startCountdown = false;
        countLenght = 3.5;
        flag = false;

        this.gameObjects = [];
        this.player;
        
        // Create a new Box2D world with gravity and set up debug drawing
        this.world = new Box2D.b2World(new Box2D.b2Vec2(0, -10));
        this.debugDraw = getCanvasDebugDraw();
        this.debugDraw.SetFlags(e_shapeBit);
        this.world.SetDebugDraw(this.debugDraw);

        // Create and add background object
        this.background = new Background();
        this.gameObjects.push(this.background);

        // Create and add building sprite object
        this.building = new SpriteObject(new Vector2(12, -13.8), 0, new Vector2(0.7 / PTM, -0.7 / PTM), assets.building.img);
        this.gameObjects.push(this.building);

        // Create and add truck object
        this.truck = new Truck(new Vector2(40, -21.7), new Vector2(27, -21.7));
        this.gameObjects.push(this.truck);

        // Create and add enemy object
        this.enemy = new Enemy(new Vector2(11, -2.5), this.world);
        this.gameObjects.push(this.enemy);
        
        // Create and add trampoline object
        this.trampoline = new Trampoline(new Vector2(12, -23.8), this.world);
        this.gameObjects.push(this.trampoline);
        
        // Create and add window NPC pool
        this.windowsPool = new WindowNPC_Pool(this.world);
        this.gameObjects.push(this.windowsPool);
        
        // Create and set up camera
        this.camera = new Camera(this.truck);

        // Create and add player object
        this.player = new Player(new Vector2(30, -20), this.world);
        this.gameObjects.push(this.player);
    }

    Start()
    {
        console.log(gameStart);

        // Create ground and limits
        this.CreateGround();
        this.CreateLimits();

        this.gameObjects.forEach(go => {
            go.Start();
        });

        // Set contact listener for the world
        this.SetContactListener();
        this.world.SetContactListener(listener);
        
        // Play background music
        sounds.backgroundMusic.sound.loop = true;
        sounds.backgroundMusic.sound.volume = musicVolume;
        sounds.backgroundMusic.sound.play();
    }

    Update(deltaTime)
    {
        // Step the Box2D world simulation
        this.world.Step(1/60, 3, 2);

        // Clear forces in the world
        this.world.ClearForces();

        this.gameObjects.forEach(go => {
            go.Update(deltaTime);
        });

        this.camera.Update(deltaTime);

        // Check if the truck has reached its destination
        if(this.truck.distanceReached && !flag)
        {      
            // Stop moving the background buildings
            this.background.movingBuildings = false;
            
            // Set the player's position to the truck's position
            this.player.body.SetTransform(new Box2D.b2Vec2(this.truck.position.x, -23.3), this.player.body.GetAngle());

            // Move sprite to body position
            let currentPosition = this.player.body.GetPosition();
            this.player.position.x = currentPosition.x;
            this.player.position.y = currentPosition.y + 0.3;

            this.player.visible = true;                
            this.camera.MoveCameraToOrigin();
            flag = true;
        }

        // Handle the countdown before the game starts
        if(startCountdown && !gameStart)
        {
            if(countLenght <= 0)
            {
                gameStart = true;
            }
            else
            {
                countLenght -= deltaTime;
            }
        }

        // Update the elapsed time if the game has started
        if(gameStart)
        {
            elapsedTime += deltaTime;
        }
    }

    Draw(ctx)
    {
        ctx.save();
            // Transform the canvas context for drawing so gravity can be negative
            ctx.scale(1, -1);
            ctx.scale(PTM, PTM);
            ctx.lineWidth /= PTM;

            this.camera.Draw(ctx);

            // Draw coordinate axes
            drawAxes(ctx);

            this.gameObjects.forEach(go => go.Draw(ctx));

            // Draw ground
            ctx.fillStyle = "grey";
            ctx.fillRect(0, -27, 60, 3);
            this.world.DrawDebugData();

        ctx.restore();

        // Draw the timer and score
        ctx.save();
            ctx.scale(1, 1);
            ctx.font = '15px "Press Start 2P", sans-serif';
            ctx.fillStyle = "black";
            ctx.fillText("Time: " + elapsedTime.toFixed(0), 10, 20);
            ctx.fillText("Score: " + score.toFixed(0), 800, 20)

            // Draw the countdown if it hasn't started
            if(startCountdown && !gameStart)
            {
                ctx.font = '300px "Press Start 2P", sans-serif';
                ctx.fillText(countLenght.toFixed(0), canvas.width / 2 - 150, canvas.height / 2 + 50);
                sounds.countSound.sound.volume = efectsvolume;
                sounds.countSound.sound.play();
            }

            // Draw the player's lives
            ctx.drawImage(assets.ui_Utils.img, 20, 800, 200, 200);
            ctx.font = '25px "Press Start 2P", sans-serif';
            ctx.fillText("X" + this.player.lives.toFixed(0), 80, 840);

            ctx.scale(1, -1);
        ctx.restore();
    }

    CreateGround()
    {
        // Create a ground body in the Box2D world
        var ground = this.world.CreateBody(new Box2D.b2BodyDef());

        // Create an edge shape for the ground
        var shape = new Box2D.b2EdgeShape();
        shape.Set(new Box2D.b2Vec2(-5, -24), new Box2D.b2Vec2(50, -24));

        // Create a fixture definition for the ground
        var fixtureDef = new Box2D.b2FixtureDef();
        fixtureDef.set_shape(shape);
        fixtureDef.set_density(1.0);

        // Attach the fixture to the ground body
        var fixture = ground.CreateFixture(fixtureDef);
        fixture.name = "Ground";
    }

    CreateLimits()
    {
        // Body
        var limitA = this.world.CreateBody(new Box2D.b2BodyDef());
        var limitB = this.world.CreateBody(new Box2D.b2BodyDef());

        // Shape
        var shapeA = new Box2D.b2EdgeShape();
        shapeA.Set(new Box2D.b2Vec2(-5, -24), new Box2D.b2Vec2(-5, 0));
        var shapeB = new Box2D.b2EdgeShape();
        shapeB.Set(new Box2D.b2Vec2(35, -24), new Box2D.b2Vec2(35, 0));

        // Fixture
        var fixtureDefA = new Box2D.b2FixtureDef();
        fixtureDefA.set_shape(shapeA);
        fixtureDefA.set_density(1.0);
        var fixtureA = limitA.CreateFixture(fixtureDefA);
        fixtureA.name = "Limit";

        var fixtureDefB = new Box2D.b2FixtureDef();
        fixtureDefB.set_shape(shapeB);
        fixtureDefB.set_density(1.0);
        var fixtureB = limitB.CreateFixture(fixtureDefB);
        fixtureB.name = "Limit";
    }

    SetContactListener()
    {
        // Create a new contact listener
        listener = new Box2D.JSContactListener();

        // Define the BeginContact callback function
        listener.BeginContact = function(contactPtr){
            var contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact);
            const fixtureA = contact.GetFixtureA();
            const fixtureB = contact.GetFixtureB();

            // Call the BeginContact method on the user data if it exists
            if(userDataMap.get(fixtureA) !== undefined){
                if(typeof userDataMap.get(fixtureA)._BeginContact === 'function'){
                    userDataMap.get(fixtureA)._BeginContact(contact);
                }
            }
            else if(userDataMap.get(fixtureB) !== undefined){
                if(typeof userDataMap.get(fixtureB)._BeginContact === 'function'){
                    userDataMap.get(fixtureB)._BeginContact(contact);
                }
            }
        }

        // Define the EndContact callback function
        listener.EndContact = function(contactPtr){
            var contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact);
            const fixtureA = contact.GetFixtureA();
            const fixtureB = contact.GetFixtureB();

            // Call the EndContact method on the user data if it exists
            if(userDataMap.get(fixtureA) !== undefined){
                if(typeof userDataMap.get(fixtureA)._EndContact === 'function'){
                    userDataMap.get(fixtureA)._EndContact(contact);
                }
            }
            else if(userDataMap.get(fixtureB) !== undefined){
                if(typeof userDataMap.get(fixtureB)._EndContact === 'function'){
                    userDataMap.get(fixtureB)._EndContact(contact);
                }
            }
        }
        listener.PreSolve = function(contactPtr, olManifold){}
        listener.PostSolve = function(contactPtr, impulse){}
    }
}