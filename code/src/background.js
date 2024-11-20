
class Background
{
    constructor()
    {
        // Define layers for the background
        this.layers = {

            // Create new objects for buildings
            buildings: {

                spriteA: {
                    sprite: new SpriteObject(new Vector2(20, -5), 0, new Vector2(3 / PTM, -3 / PTM), assets.buildingsBKG.img),
                    isBottom: false,
                    speed: 6
                },

                spriteB: {
                    sprite: new SpriteObject(new Vector2(-57, -5), 0, new Vector2(3 / PTM, -3 / PTM), assets.buildingsBKG.img),
                    isBottom: true,
                    speed: 6
                }
            },

            // Create new objects for clouds
            clouds: {
                spriteA: {
                    sprite: new SpriteObject(new Vector2(30, -10), 0, new Vector2(2 / PTM, -2 / PTM), assets.cloudsBKG.img),
                    isBottom: false,
                    speed: 0.5
                },

                spriteB: {
                    sprite: new SpriteObject(new Vector2(-27, -10), 0, new Vector2(2 / PTM, -2 / PTM), assets.cloudsBKG.img),
                    isBottom: true,
                    speed: 0.5
                }
            }
        }

        // Create a single clouds sprite object
        this.clouds = new SpriteObject(new Vector2(0, 0), 0, new Vector2(2 / PTM, -2 / PTM), assets.cloudsBKG.img);

        // Flag to control moving buildings
        this.movingBuildings = true;    
    }

    Start()
    {
        // Start building layer sprites
        Object.values(this.layers.buildings).forEach(layer => {
            layer.sprite.Start();
        });

        // Start clouds layer sprites
        Object.values(this.layers.clouds).forEach(layer => {
            layer.sprite.Start();
        });
    }

    Update(deltaTime)
    {
        // Update buildings layer if movingBuildings is true
        if(this.movingBuildings)
            this.Parallax(deltaTime, this.layers.buildings.spriteA, this.layers.buildings.spriteB);

        // Update clouds layer
        this.Parallax(deltaTime, this.layers.clouds.spriteA, this.layers.clouds.spriteB);
    }

    Draw(ctx)
    {
        // Draw clouds layer sprites
        Object.values(this.layers.clouds).forEach(layer => {
            layer.sprite.Draw(ctx);
        });

        // Draw buildings layer sprites
        Object.values(this.layers.buildings).forEach(layer => {
            layer.sprite.Draw(ctx);
        });

    }

    Parallax(deltaTime, spriteA, spriteB)
    {
        // Move thhe sprites 
        spriteA.sprite.position.x += spriteA.speed * deltaTime;
        spriteB.sprite.position.x += spriteB.speed * deltaTime;

        // Handle wrapping of spriteA when it goes off-screen
        if(spriteA.sprite.position.x > canvas.width / PTM && spriteA.isBottom)
        {
            spriteB.sprite.position.x = spriteA.sprite.position.x - spriteA.sprite.sprite.img.width * spriteA.sprite.scale.x;
            spriteA.isBottom = false;
            spriteB.isBottom = true;
        }

        // Handle wrapping of spriteB when it goes off-screen
        else if(spriteB.sprite.position.x > canvas.width / PTM && spriteB.isBottom)
        {
            spriteA.sprite.position.x = spriteB.sprite.position.x - spriteB.sprite.sprite.img.width * spriteB.sprite.scale.x;
            spriteA.isBottom = true;
            spriteB.isBottom = false;
        }

        // Update the sprites
        spriteA.sprite.Update(deltaTime);
        spriteB.sprite.Update(deltaTime);
    }
}