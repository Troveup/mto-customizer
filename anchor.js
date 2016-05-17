
function Anchor(spec, owner) {
    this.key = spec.key;
    this.ownerCharm = owner;
    this.offset = spec.offset; // the offset of this anchor from the charm's origin at rotation 0

    this.attachedAnchor = null;
}

/*FlatModel.prototype.checkAnchors = function() {
    var len = this.componentList.length;
    var overlap = null;
    for (var i = 0; i < len; i++) {
        for (var j = i; j < len; j++) {
            if (i == j) continue;

            var objA = this.componentList[i];
            var objB = this.componentList[j];
            
            var results = objA.compareAnchors(objB);
            if (results.hit) {
                if (!overlap || results.dist < overlap.dist) {
                    overlap = {
                        dist: results.dist,
                        first: objA,
                        second: objB,
                        firstIndex: results.indexA,
                        secondIndex: results.indexB
                    };
                }
            }
        }
    }
    return overlap;
}*/

// calculate distance between anchors in global space, if lower than a cutoff
Anchor.prototype.checkCollision = function(otherAnchor, overlapDiameter = 10) {
    var dx = (this.offset.get_x() + this.ownerCharm.pos.get_x()) -
        (that.offset.get_x() + that.ownerCharm.pos.get_x());
    var dy = (this.offset.get_y() + this.ownerCharm.pos.get_y()) -
        (that.offset.get_y() + that.ownerCharm.pos.get_y());

    var dist = Math.sqrt(dx * dx + dy * dy);
    return {
        hit: dist < overlapDiameter,
        separation: dist
    }
};

module.exports = Anchor;
