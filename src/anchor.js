
function Anchor(spec, owner) {
    this.key = spec.key;
    this.ownerCharm = owner;
    this.offset = spec.offset; // the offset of this anchor from the charm's origin at rotation 0
    this.joint = null;
    this.attachedAnchor = null;
}

Anchor.prototype.toString = function() {
    var off = this.getTransformedOffset();
    return "Anchor offset: [ "+ off.x +", "+ off.y +" ]";
}

Anchor.prototype.getTransformedOffset = function() {
    var o = {};
    var radians = this.ownerCharm.angleInRadians;
    o.x = this.offset.x * Math.cos(radians) - this.offset.y * Math.sin(radians);
    o.y = this.offset.x * Math.sin(radians) + this.offset.y * Math.cos(radians);
    o.x += this.ownerCharm.pos.x;
    o.y += this.ownerCharm.pos.y;
    return o;
}

// calculate distance between anchors in global space, if lower than a cutoff
Anchor.prototype.checkCollision = function(otherAnchor, overlapDiameter = 10) {
    var offsetA = this.getTransformedOffset();
    var offsetB = otherAnchor.getTransformedOffset();

    var dx = offsetB.x - offsetA.x;
    var dy = offsetB.y - offsetA.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    return {
        hit: dist < overlapDiameter,
        separation: dist,
        dx: dx,
        dy: dy
    }
};

module.exports = Anchor;
