
class Sprite {
    constructor(img) {
        this.img = img;
        this.img.halfWidth = img.width / 2;
        this.img.halfHeight = img.height / 2;
    }

    Draw(ctx, position, rotation, scale) {
        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate(rotation);
        ctx.scale(scale.x, scale.y);
        ctx.drawImage(this.img, -this.img.halfWidth, -this.img.halfHeight);
        ctx.restore();
    }

    DrawSection(ctx, position, rotation, scale, sx, sy, sw, sh) {
        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate(rotation);
        ctx.scale(scale.x, scale.y);
        //ctx.strokeStyle = "red";
        //ctx.strokeRect(-sw/2, -sh/2, sw, sh);
        ctx.drawImage(this.img, sx, sy, sw, sh, -sw/2, -sh/2, sw, sh);
        ctx.restore();
    }
}