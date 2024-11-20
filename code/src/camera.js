class Camera {
    constructor(target) {

        // The object that the camera will follow
        this.target = target;
        this.position = new Vector2(0, 0);

        // Offset values to adjust the camera's position relative to the target
        this.offsetX = -15;
        this.offsetY = 21.7;

        // Flags to control camera movement and activation
        this.movingLeft = false;
        this.deactivated = false;
    }

    Update(deltaTime) {

        // If the camera is deactivated, do nothing
        if (this.deactivated) return;

        // If the camera is set to move left
        if (this.movingLeft) {
            const speed = 5;
            this.position.x -= speed * deltaTime;

            // Stop the camera when it reaches the left edge of the screen
            if (this.position.x <= 0) {
                this.position.x = 0;
                startCountdown = true;
                this.deactivated = true;
            }
        } 
        else 
        {
            // If the camera has a target, follow the target
            if (this.target) 
            {
                this.position.x = this.target.position.x + this.offsetX;
                this.position.y = this.target.position.y + this.offsetY;
            }
        }
    }

    Draw(ctx) {
        if (this.deactivated) return;

        // Translate the canvas context based on the camera's position
        ctx.translate(-this.position.x, -this.position.y);
    }

    MoveCameraToOrigin()
    {
        this.movingLeft = true;
    }
}
