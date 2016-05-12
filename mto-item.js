
function MTOItem() {
    this.baseChain = null;
    this.ground = null;
    this.selectedCharm = null;

    this.wrappedCanvas = null;

    // potential ways to store non-linked charms
    //this.looseRoots
    //this.chainList
}

MTOItem.prototype.load = function(canvasID, baseSpec, charmSpecList) {
}

MTOItem.prototype.iterateCharms = function(callback) {
}


MTOItem.prototype.drawCharms = function() {
    this.iterateCharms(function(charm) {
        //drawCenteredRectangle(charm.pos.x, charm.pos.y, charm.width+2, charm.height+2, 'black');
        //drawCenteredRectangle(charm.pos.x, charm.pos.y, charm.width, charm.height, charm.style);
        this.wrappedCanvas.drawCenteredImage(charm.pos.x, charm.pos.y, charm.width, charm.height, charm.img);
    });
}

MTOItem.prototype.drawAnchors = function() {
    var anchorRenderRadius = 3;
    var posX = this.position.x;
    var posY = this.position.y;

    var that = this;
    Object.keys(this.anchors).map(function(anchorKey) {
        ctx.save();

        var anchor = that.anchors[anchorKey];
        var x = posX + anchor.offset.x;
        var y = posY + anchor.offset.y;

        var style = anchor.hovered ? anchorColors['overlap'] : anchor.debugStyle;
        anchor.hovered = false;
        
        // var anchorStyle = anchor.attachedComponent === null ? 'black' : 'green';
        drawCircle(ctx, x, y, anchorRenderRadius, style);

        ctx.restore();
    });
}

MTOItem.prototype.iterateAnchors = function(callback) {
}

MTOItem.prototype.handleMousedown = function(callback) {
}

MTOItem.prototype.handleMousemouve = function(callback) {
}

module.exports = MTOItem;
