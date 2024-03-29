
var charmColors = {
    normal: '#F26868',
    selected: 'red',
    hanging: 'yellow'
};

var anchorColors = {
    normal: 'black',
    locked: 'green',
    overlap: 'yellow'
};

function WrappedCanvas(canvasID = 'canvas') {
    var cnv = document.getElementById(canvasID);
    if (!cnv) {
        cnv = document.createElement('canvas');
        cnv.id = 'canvas';
        document.body.appendChild(cnv);
    }

    this.canvas = cnv;
    this.context = cnv.getContext('2d');
    
    this.boundingRectangle = this.canvas.getBoundingClientRect();
}

WrappedCanvas.prototype.clean = function() {
    var x = -this.origin.x;
    var y = -this.origin.y;
    var width = this.canvas.width;
    var height = this.canvas.height;

    this.context.clearRect( x, y, width, height );
}

WrappedCanvas.prototype.setup = function(opts) {
    var dx = this.canvas.width / 2;
    var dy = this.canvas.height / 2;
    this.scaleFactor = opts.pixelsToMeter || 1;
    this.context.scale(1, -1);
    this.context.translate(dx, dy - this.canvas.height);
    this.context.scale(this.scaleFactor, this.scaleFactor);
 
    this.origin = { x: dx, y: dx };
};

WrappedCanvas.prototype.getTransformedCoords = function(clientX, clientY) {
    return {
        x: (clientX - this.origin.x - this.boundingRectangle.left) / this.scaleFactor,
        y: (this.boundingRectangle.bottom - clientY - this.origin.y) / this.scaleFactor
    };
}

WrappedCanvas.prototype.drawLine = function(x1, y1, x2, y2) {
    this.context.beginPath();
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
}

WrappedCanvas.prototype.drawGrid = function(xDelta, yDelta, stepSize) {
    this.context.save();
    this.context.lineWidth = 1 / this.scaleFactor;
    for (var x = 0; x < yDelta; x += stepSize) {
        this.drawLine( x, 0, x, yDelta );
    }
    for (var y = 0; y < yDelta; y += stepSize) {
        this.drawLine( 0, y, xDelta, y );
    }
    this.context.restore();
}

WrappedCanvas.prototype.drawCircle = function(x, y, radius, style) {
    this.context.save();
    
    this.context.fillStyle = style;
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, 2 * Math.PI, true);
    this.context.fill();
    this.context.restore();
}

WrappedCanvas.prototype.drawImage = function(x, y, angleInRadians, width, height, img) {
    this.context.save();
    this.context.translate(x, y);
    this.context.rotate(angleInRadians);
    this.context.scale(1, -1);

    var hx = width / 2;
    var hy = height / 2;
    this.context.drawImage(img, -hx, -hy, width, height);
    this.context.restore();
}

WrappedCanvas.prototype.strokeRectangle = function(x, y, angleInRadians, width, height, style) {
    this.context.save();
    this.context.lineWidth = 1 / this.scaleFactor;
    this.context.fillStyle = style;
    this.context.translate(x, y);
    this.context.rotate(angleInRadians);

    var hx = width / 2;
    var hy = height / 2;

    this.drawLine( -hx, -hy, -hx,  hy);
    this.drawLine(  hx, -hy,  hx,  hy);
    this.drawLine( -hx, -hy,  hx, -hy);
    this.drawLine( -hx,  hy,  hx,  hy);

    this.context.restore();
}

WrappedCanvas.prototype.drawRectangle = function(x, y, angleInRadians, width, height, style) {
    this.context.save();
    this.context.fillStyle = style;
    this.context.translate(x, y);
    this.context.rotate(angleInRadians);

    var hx = width / 2;
    var hy = height / 2;
    this.context.fillRect( -hx, -hy, width, height);

    this.context.restore();
}

module.exports = WrappedCanvas;

