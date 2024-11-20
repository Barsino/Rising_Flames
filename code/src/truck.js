
class Truck extends SSAnimationObject
{
    constructor(position, targetPosition)
    {
        super(
            position,
            0,
            new Vector2(6 / PTM, -6 / PTM),
            assets.fireTruck.img,
            64,
            45,
            [4, 1],
            1 / 5
        );

        this.position = position;
        // Target position the truck moves towards
        this.targetPosition = targetPosition;

        this.speed = 3;

        // Flag to track if target distance is reached
        this.distanceReached = false;
        // Flag to control movement activation
        this.flag = true;

        // Time params
        this.timer = 5;
        this.timerAux = 0;
    }

    Start()
    {
        super.Start();
        this.PlayAnimationLoop(0);
    }

    Update(deltaTime)
    {
        if(!this.distanceReached && this.flag)
        {
            if(this.timerAux >= this.timer)
            {
                // Calculate direction and distance to target position
                let directionX = this.targetPosition.x - this.position.x;
                let directionY = this.targetPosition.y - this.position.y;
                let distance = Math.sqrt(directionX * directionX + directionY * directionY);
    
                // If distance to target is greater than threshold
                if (distance > 0.1)
                {
                    // Move towards the target position based on normalized direction
                    let moveDistance = this.speed * deltaTime;
                    this.position.x += (directionX / distance) * moveDistance;
                    this.position.y += (directionY / distance) * moveDistance;
                }
                else
                {
                    // Set flag to indicate target reached
                    this.distanceReached = true;

                    // Switch animation
                    this.PlayAnimationLoop(1);
                }
            }
            else
            {
                this.timerAux += deltaTime;
            }
        }

        super.Update(deltaTime);
    }

    Draw(ctx)
    {
        super.Draw(ctx);
    }
}