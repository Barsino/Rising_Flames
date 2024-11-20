
class GameObject {
    _rotation = 0;
    _scale = new Vector2(1, 1);

    constructor(position) {
        this._position = Vector2.Copy(position);

    }

    get position() {
        return this._position;
    }
    get rotation() {
        return this._rotation;
    }
    get scale() {
        return this._scale;
    }

    set position(value) {
        this._position = Vector2.Copy(value);
    }
    set rotation(value) {
        this._rotation = value;
    }
    set scale(value) {
        this._scale = Vector2.Copy(value);
    }

    Start() {}
    Update(deltaTime){}
    Draw(ctx){}
}

class SpriteObject extends GameObject {
    constructor(position, rotation, scale, img) {
        super(position);
        this._rotation = rotation;
        this._scale = scale;
        this.sprite = new Sprite(img);
    }

    set img(newImg) {
        this.sprite.img = newImg;
    }

    Start() {}
    Update(deltaTime){}

    Draw(ctx) {
        this.sprite.Draw(ctx, this.position, this.rotation, this.scale);
    }
}

class SSAnimationObject extends SpriteObject {
    constructor(position, rotation, scale, img, frameWidth, frameHeight, frameCount, framesDuration) {
        super(position, rotation, scale, img);

        this.framesDuration = framesDuration;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameCount = frameCount;
        this.actualAnimation = 0;
        this.actualFrame = 0;
        this.actualFrameCountTime = 0;
    }
    
    Start() {}

    Update(deltaTime) {
        this.actualFrameCountTime += deltaTime;
        if (this.actualFrameCountTime >= this.framesDuration) {
            // update the animation with the new frame
            this.actualFrame = (this.actualFrame + 1) % this.frameCount[this.actualAnimation];

            this.actualFrameCountTime = 0;
        }
    }

    Draw(ctx) {
        this.sprite.DrawSection(ctx, this.position, this.rotation, this.scale, this.actualFrame * this.frameWidth, this.actualAnimation * this.frameHeight, this.frameWidth, this.frameHeight, 0, 0, this.frameWidth, this.frameHeight);
    }

    PlayAnimationLoop(animationId) {
        this.actualAnimation = animationId;

        // reset the frame count
        this.actualFrame = 0;
        this.actualFrameCountTime = 0;
    }
}


// Special objects

class Building extends SpriteObject
{
    constructor(position, rotation, scale, img)
    {
        super(position, rotation, scale, img);


    }

    Start() {}

    Update(deltaTime) {}

    Draw(ctx)
    {

    }
}


class PhysicPlatform extends GameObject {
    constructor(position, world, isStatic, size) {
        super(position);

        this.with = size.x;
        this.height = size.y;
        this.static = isStatic;

        this.shape = new Box2D.b2PolygonShape();
        this.shape.SetAsBox(this.with / 2, this.height / 2);
        
        this.bodyDef = new Box2D.b2BodyDef();

        if(this.static)
            this.bodyDef.set_type(Module.b2_staticBody);
        else
            this.bodyDef.set_type(Module.b2_dynamicBody);

        this.bodyDef.position.Set(position.x, position.y);
        this.bodyDef.set_fixedRotation(true);

        this.world = world;
        this.body = this.world.CreateBody(this.bodyDef);
        var fixture = this.body.CreateFixture(this.shape, 1.0);
        fixture.SetFriction(1);
        fixture.name = "Platform";
        this.body.GetFixtureList().SetRestitution(0);    
    }

    Start() {}

    Update(deltaTime) {
        super.Update(deltaTime);

        if(!this.static)
        {
            let currentPosition = this.body.GetPosition();

            this._position.x = currentPosition.get_x();
            this._position.y = currentPosition.get_y();
        }
    }

    Draw(ctx) {}
}


class Fire extends SSAnimationObject
{
    constructor(position)
    {
        super(
            position,
            0,
            new Vector2(8 / PTM, -4 / PTM),
            assets.fireBall.img,
            18.06,
            32,
            [8, 8],
            1 / 10
        );

        this.opacity = 0.8;
    }

    Start()
    {
        super.Start();
        this.PlayAnimationLoop(0);
    }

    Update(deltaTime)
    {
        super.Update(deltaTime);
    }
    
    Draw(ctx)
    {
        ctx.save()
        ctx.globalAlpha = this.opacity;
        super.Draw(ctx);
        ctx.restore();
    }
}