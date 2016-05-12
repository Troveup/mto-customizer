
var charmColors = {
    normal: '#F26868',
    selected: 'red',
    hanging: 'yellow'
}

var anchorColors = {
    normal: 'black',
    locked: 'green',
    overlap: 'yellow'
};


export default class WrappedCanvas {
    constructor(canvasID) {
        this.canvas = null;
        this.context = null;
    }

    drawCircle(x, y, radius, style) {
        this.context.fillStyle = style;
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, 2 * Math.PI, true);
        this.context.fill();
    }

    drawCenteredImage(x, y, width, height, img) {
        var hx = width / 2;
        var hy = height / 2;
        this.context.drawImage(img, x - hx, y - hy, width, height);
    }

    drawCenteredRectangle(x, y, width, height, style) {
        this.context.save();
        this.context.fillStyle = style;

        var hx = width / 2;
        var hy = height / 2;
        this.context.fillRect(x - hx, y - hy, width, height);

        this.context.restore();
    }
}
