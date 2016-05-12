
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


function WrappedCanvas(canvasID) {
    this.canvas = null;
    this.context = null;
}

WrappedCanvas.prototype.drawCircle = function(x, y, radius, style) {
    this.context.fillStyle = style;
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, 2 * Math.PI, true);
    this.context.fill();
}

WrappedCanvas.prototype.drawCenteredImage = function(x, y, width, height, img) {
    var hx = width / 2;
    var hy = height / 2;
    this.context.drawImage(img, x - hx, y - hy, width, height);
}

WrappedCanvas.prototype.drawCenteredRectangle = function(x, y, width, height, style) {
    this.context.save();
    this.context.fillStyle = style;

    var hx = width / 2;
    var hy = height / 2;
    this.context.fillRect(x - hx, y - hy, width, height);

    this.context.restore();
}

module.exports = WrappedCanvas;
