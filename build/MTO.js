var MTO =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	//var Box2D = require("box2d");
	var WrappedCanvas = __webpack_require__(1);
	var MTOItem = __webpack_require__(2);

	var roofX = 0;
	var roofY = 29.5;
	var oblongWidth = 60;
	var oblongHeight = 1;

	var necklaceSpec = {
	    imgURL: "/resources/img/demo-chain.png",
	    position: new THREE.Vector2(roofX, roofY), // in untransformed grid, need to figure out less hacky way for this
	    width: oblongWidth,
	    height: oblongHeight,
	    anchors: [
	        { offset: new THREE.Vector2(-5, -1) },
	        { offset: new THREE.Vector2(5, -1) }
	    ]
	};

	    //imgURL: "/resources/img/demo-chain.png",
	    //position: new THREE.Vector2(30, 5), // in untransformed grid, need to figure out less hacky way for this
	    //width: 60,
	    //height: 80,
	    //anchors: [
	        //{ offset: new THREE.Vector2(-5, 0) },
	        //{ offset: new THREE.Vector2(5, 0) }
	    //]

	var linkWidth = 112 / 30;
	var linkHeight = 350 / 30;

	var anchorOffsetDist = 4.6;

	var DEG_TO_RAD = Math.PI / 180;
	var componentSpecs = [
	    {
	        imgURL: "/resources/img/directed-charm-link.png",
	        position: new THREE.Vector2(-5, 0),
	        width: linkWidth,
	        height: linkHeight,
	        anchors: [
	            { offset: new THREE.Vector2(0, anchorOffsetDist) },
	            { offset: new THREE.Vector2(0, -anchorOffsetDist) }
	        ]
	    },
	    {
	        imgURL: "/resources/img/directed-charm-link.png",
	        position: new THREE.Vector2(0, 0),
	        rotation: 45 * DEG_TO_RAD,
	        width: linkWidth,
	        height: linkHeight,
	        anchors: [
	            { offset: new THREE.Vector2(0, anchorOffsetDist) },
	            { offset: new THREE.Vector2(0, -anchorOffsetDist) }
	        ]
	    },
	    {
	        imgURL: "/resources/img/directed-charm-link.png",
	        position: new THREE.Vector2(5, 0),
	        width: linkWidth,
	        height: linkHeight,
	        anchors: [
	            { offset: new THREE.Vector2(0, anchorOffsetDist) },
	            { offset: new THREE.Vector2(0, -anchorOffsetDist) }
	        ]
	    }
	];

	var item;
	var dt, currTime, lastTime = Date.now();
	function loop() {
	    requestAnimationFrame(loop);

	    currTime = Date.now();
	    dt = currTime - lastTime;
	    lastTime = currTime;

	    item.stepPhysics(dt);
	    item.render();
	}

	var testCanvas;
	function main() {
	    item = new MTOItem('canvas', necklaceSpec, componentSpecs);
	    item.loadAssets().then(function() {
	        canvas.addEventListener('mousedown', item.handleMousedown.bind(item));
	        canvas.addEventListener('mouseup', item.handleMouseup.bind(item));
	        canvas.addEventListener('mousemove', item.handleMousemove.bind(item), false);
	        item.addCharmsToSim();
	        loop();
	    });
	}

	function writeDebugInfo(root) {
	    var debugNode = document.createElement('div');
	    debugNode.className = 'debugNode';
	    root.appendChild(debugNode);
	}

	console.log("index initialized");

	module.exports = { main, writeDebugInfo };



/***/ },
/* 1 */
/***/ function(module, exports) {

	
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
	        console.warn("No usable canvas found with id: ", canvasID);
	        // TODO: create a canvas and attach to body
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
	    for (var x = 0; x < yDelta; x += stepSize) {
	        this.drawLine( x, 0, x, yDelta );
	    }
	    for (var y = 0; y < yDelta; y += stepSize) {
	        this.drawLine( 0, y, xDelta, y );
	    }
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



/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	var WrappedCanvas = __webpack_require__(1);
	var Charm = __webpack_require__(3);
	var Box2DHelper = __webpack_require__(6);
	var Box2D = __webpack_require__(5);

	function MTOItem(canvasID, baseSpec, charmSpecList) {
	    this.baseChain = new Charm(baseSpec);
	    this.charmList = charmSpecList.map(function(spec) {
	        return new Charm(spec);
	    });

	    this.wrappedCanvas = new WrappedCanvas(canvasID);
	    this.wrappedCanvas.setup({
	        pixelsToMeter: 10
	    });

	    this.selectedCharm = null;
	    this.groundBody = null;
	    //this.roofBody = null;

	    this.physics = new Box2DHelper();
	    this.physics.init();

	    // potential ways to store non-linked charms
	    //this.looseRoots
	    //this.chainList
	}

	MTOItem.prototype.spawnCharm = function(x, y, anchorOffsetDist) {
	    var linkWidth = 112 / 3;
	    var linkHeight = 350 / 3;
	    var proceduralSpec = {
	        imgURL: "/resources/img/directed-charm-link.png",
	        position: new THREE.Vector2(x, y),
	        rotation: 0,
	        width: linkWidth,
	        height: linkHeight,
	        upperAnchor: new THREE.Vector2(0, anchorOffsetDist),
	        lowerAnchor: new THREE.Vector2(0, -anchorOffsetDist)
	    };

	    var c = new Charm(proceduralSpec);
	    c.body = this.physics.createBox(c.pos.x, c.pos.y, c.angleInRadians, c.width, c.height, 'dynamic');
	    return c;
	}


	var groundX = 0;
	var groundY = -20;
	//var roofX = 0;
	//var roofY = 29.5;
	var oblongWidth = 60;
	var oblongHeight = 1;

	MTOItem.prototype.loadAssets = function() {
	    var loadingPromises = this.charmList.map(function(charm){
	        return charm.loadAssets();
	    }.bind(this));
	    loadingPromises.push( this.baseChain.loadAssets() );

	    return Promise.all(loadingPromises);
	};

	MTOItem.prototype.addCharmsToSim = function() {
	    // this is a debug line, should eventually remove
	    this.groundBody = this.physics.createBox(groundX, groundY, 0, oblongWidth, oblongHeight, 'static');
	    //this.baseChain.body = this.physics.createBox(roofX, roofY, 0, oblongWidth, oblongHeight, 'static');
	    var b = this.baseChain;
	    b.body = this.physics.createBox( b.pos.x, b.pos.y, b.angleInRadians, b.width, b.height, 'static' );

	    this.charmList.map(function(c){
	        c.body = this.physics.createBox(c.pos.x, c.pos.y, c.angleInRadians, c.width, c.height, 'dynamic');
	    }.bind(this));

	};

	MTOItem.prototype.iterateCharms = function(callback) {
	    return this.charmList.map(callback);
	};

	var anchorRadius = 2;
	MTOItem.prototype.render = function() {
	    this.wrappedCanvas.clean();

	    this.iterateCharms(function(charm) {
	        this.wrappedCanvas.drawImage(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width, charm.height, charm.img);
	        if (charm == this.selectedCharm) {
	            this.wrappedCanvas.strokeRectangle(charm.pos.x, charm.pos.y, charm.angleInRadians, charm.width, charm.height, 'black');
	        }
	        charm.eachAnchor(function(anchor, isParent) {
	            var o = anchor.getTransformedOffset();
	            this.wrappedCanvas.drawCircle(o.x, o.y, anchorRadius, 'black');
	        }.bind(this));
	    }.bind(this));

	    var r = this.physics.summarize(this.baseChain.body);
	    this.wrappedCanvas.drawRectangle(r.x, r.y, r.angle, oblongWidth, oblongHeight, 'black');
	    this.baseChain.eachAnchor(function(anchor, isParent) {
	        var o = anchor.getTransformedOffset();
	        this.wrappedCanvas.drawCircle(o.x, o.y, anchorRadius, 'black');
	    }.bind(this));

	    this.drawGround();
	};

	MTOItem.prototype.drawGround = function() {
	    var g = this.physics.summarize(this.groundBody);
	    this.wrappedCanvas.drawRectangle(g.x, g.y, g.angle, oblongWidth, oblongHeight, 'black');
	};

	MTOItem.prototype.stepPhysics = function(dt) {
	    this.physics.tick(dt);

	    // sync physics body data with containg Charm object
	    this.iterateCharms(function(charm) {
	        var physData = this.physics.summarize(charm.body);
	        charm.pos.x = physData.x;
	        charm.pos.y = physData.y;
	        charm.angleInRadians = physData.angle;
	    }.bind(this));
	};

	MTOItem.prototype.forConnectedCharms = function(seedCharm, fn) {
	    console.log( "=== Executing forConnectedCharms..." );
	    var visited = Object.create(null);
	    var checkQueue = [ seedCharm ];
	    for (var i = 0; i < checkQueue.length; i++) {
	        fn(checkQueue[i]);
	        checkQueue[i].eachAnchor(function(anchor, isParent) {
	            if (anchor.attachedAnchor) {
	                var expansionCharm = anchor.attachedAnchor.ownerCharm;
	                if (!visited[expansionCharm.key]) {
	                    visited[expansionCharm.key] = true;
	                    checkQueue.push(expansionCharm);
	                }
	            }
	        });
	    }
	};

	// use base chain as starting point for valid anchors to attach to, will be used to
	// check against any open anchors on the focused charm for connections
	MTOItem.prototype.sortAnchorsOnFocus = function() {
	    var that = this;
	    this.openRootAnchors = [];
	    this.openFocusAnchors = [];

	    console.warn("Sorting anchors not properly iterating through linked anchors");
	    this.forConnectedCharms(this.baseChain, function(charm) {
	        console.log(" base charm: ", charm);
	        charm.eachAnchor(function(anchor) {
	            if (!anchor.attachedAnchor) {
	                that.openRootAnchors.push(anchor);
	            }
	        });
	    });

	    this.selectedCharm.eachAnchor(function(anchor) {
	        if (!anchor.attachedAnchor) {
	            that.openFocusAnchors.push(anchor);
	        }
	    });
	};

	MTOItem.prototype.getClosestCharmClicked = function(mousePos) {
	    var closestDist = Infinity;
	    var closestCharm = null;
	    this.charmList.map(function(charm) {
	        var result = charm.hitCheck(mousePos);
	        if (result.hit) {
	            if (!closestCharm || result.dist < closestDist) {
	                closestCharm = charm;
	                closestDist = result.dist;
	            }
	        }
	    });
	    return closestCharm;
	};

	MTOItem.prototype.detachParentCharm = function(selectedCharm) {
	    var pa = selectedCharm.parentAnchor;
	    if (pa) {
	        var parentCharm = pa.attachedAnchor.ownerCharm;
	        pa.attachedAnchor.attachedAnchor = null;
	        pa.attachedAnchor = null;
	        this.physics.world.DestroyJoint(pa.joint);
	        return parentCharm;
	    }

	    return null;
	};

	console.warn("TODO: fix buggy logic for detecting anchor collisions");
	MTOItem.prototype.findAnchorCollisions = function(overlapRadius = 5) {
	    var overlappingAnchorPairs = [];

	    for (var i = 0; i < this.openFocusAnchors.length; i++) {
	        for (var j = 0; j < this.openRootAnchors.length; j++) {
	            var selectionAnchor = this.openFocusAnchors[i];
	            var hangingAnchor = this.openRootAnchors[j];

	            var result = selectionAnchor.checkCollision(hangingAnchor, overlapRadius);
	            if (result.hit) {
	                result.selectionAnchor = selectionAnchor;
	                result.hangingAnchor = hangingAnchor;
	                overlappingAnchorPairs.push( result );
	            }
	        }
	    }
	    return overlappingAnchorPairs;
	};

	MTOItem.prototype.attachAnchors = function(anchorA, anchorB) {
	    console.log("TODO: connect anchors and add joint to physics");
	    var bodyA = anchorA.ownerCharm.body;
	    var bodyB = anchorB.ownerCharm.body;

	    var newJoint = this.physics.createJoint(bodyA, anchorA.offset, bodyB, anchorB.offset);
	    anchorA.joint = newJoint;
	    anchorB.joint = newJoint;
	    anchorA.attachedAnchor = anchorB;
	    anchorB.attachedAnchor = anchorA;
	};

	MTOItem.prototype.handleMousedown = function(evt) {
	    var mousePos = this.wrappedCanvas.getTransformedCoords(evt.clientX, evt.clientY);
	    var selected = this.getClosestCharmClicked(mousePos);
	    if (selected) {
	        this.selectedCharm = selected;

	        this.detachParentCharm(selected);
	        this.sortAnchorsOnFocus();

	        var body = this.selectedCharm.body;
	        body.SetGravityScale(0);
	        body.SetLinearVelocity( Box2D.b2Vec2( 0, 0) );
	        body.SetAngularVelocity( 0 );

	        this.selectedCharm.status = 'selected';
	    }
	};

	MTOItem.prototype.handleMouseup = function(evt) {
	    if (this.selectedCharm) {
	        this.selectedCharm.status = 'normal';
	        this.selectedCharm.body.SetGravityScale(1);
	        this.selectedCharm = null;

	        var collisions = this.findAnchorCollisions(2*anchorRadius);
	        var closest = null;
	        var closestDist = Infinity;
	        if (collisions.length > 0) {
	            collisions.map(function(hitReport) {
	                if (!closest || hitReport.separation < closestDist) {
	                    closest = hitReport;
	                    closestDist = hitReport.separation;
	                }
	            });

	            var ownerCharm = closest.selectionAnchor.ownerCharm;
	            var physData = this.physics.summarize(ownerCharm.body);
	            closest.selectionAnchor.ownerCharm.translate(physData, closest.dx, closest.dy);
	            this.attachAnchors(closest.selectionAnchor, closest.hangingAnchor);
	            this.openRootAnchors = [];
	            this.openFocusAnchors = [];
	        }
	    }
	};

	var oldMousePos;
	MTOItem.prototype.handleMousemove = function(evt) {
	    var mousePos = this.wrappedCanvas.getTransformedCoords(evt.clientX, evt.clientY);

	    if (this.selectedCharm) {

	        var dx = mousePos.x - oldMousePos.x;
	        var dy = mousePos.y - oldMousePos.y;

	        var oldPhysical = this.physics.summarize(this.selectedCharm.body);
	        this.selectedCharm.translate(oldPhysical, dx, dy);
	    }
	    oldMousePos = mousePos;
	};

	module.exports = MTOItem;



/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	var Anchor = __webpack_require__(4);
	var Box2D = __webpack_require__(5);

	function Charm(spec) {
	    this.imgURL = spec.imgURL;
	    this.pos = spec.position;
	    this.width = spec.width;
	    this.height = spec.height;
	    this.angleInRadians = spec.rotation || 0;

	    // invariant: `parentAnchor` should be cleared if not connecting to a parent charm anchor
	    this.parentAnchor = null;

	    this.anchors = Object.create(null);
	    var anchorSpecs = spec.anchors || [];
	    anchorSpecs.map(function(anchorSpec) {
	        anchorSpec.key = anchorSpec.offset.x + "," + anchorSpec.offset.y;
	        this.anchors[anchorSpec.key] = new Anchor(anchorSpec, this);
	    }.bind(this));

	    this.body = null; // set by containing item
	    this.status = 'normal';
	}

	Charm.prototype.translate = function(oldPhys, dx, dy) {
	    var b2Pos = new Box2D.b2Vec2( oldPhys.x + dx, oldPhys.y + dy);
	    this.body.SetTransform( b2Pos, oldPhys.angle );

	    // should hanging chains be recursively translated?
	};

	Charm.prototype.loadAssets = function() {
	    var that = this;

	    return new Promise(function(resolve, reject){
	        var img = new Image()
	        img.onload = function(){
	            resolve(that.imgURL)
	        }
	        img.onerror = function(){
	            reject(that.imgURL)
	        }

	        img.src = that.imgURL
	        that.img = img;
	    });
	}

	var outsideVec = new THREE.Vector3(0, 0, 1);

	Charm.prototype.hitCheck = function(checkPos) {
	    var hx = this.width / 2;
	    var hy = this.height / 2;
	    var minX = this.pos.x - hx;
	    var maxX = this.pos.x + hx;
	    var minY = this.pos.y - hy;
	    var maxY = this.pos.y + hy;

	    // to transform rectangular region with known rotation and width x height to centered
	    // translate by negative position, rotate by negative angle, translate back by position
	    var checkCenterOffset = new THREE.Vector3(checkPos.x - this.pos.x, checkPos.y - this.pos.y, 0);
	    checkCenterOffset.applyAxisAngle( outsideVec, -this.angleInRadians );
	    checkCenterOffset.add( this.pos );

	    var miss = { hit: false };
	    if (checkCenterOffset.x < minX) return miss;
	    if (checkCenterOffset.x > maxX) return miss;
	    if (checkCenterOffset.y < minY) return miss;
	    if (checkCenterOffset.y > maxY) return miss;

	    // TODO: use only Box2D vectors
	    var center = this.pos.clone();
	    var displacement = new THREE.Vector2(checkPos.x, checkPos.y).sub(center);

	    return {
	        hit: true,
	        dist: displacement.length()
	    };
	}

	// pass callback of form
	// fn(anchor, isParent)
	Charm.prototype.eachAnchor = function(fn) {
	    Object.keys(this.anchors).map(function(anchorKey) {
	        var anchor = this.anchors[anchorKey];
	        fn(anchor, anchor == this.parentAnchor);
	    }.bind(this));
	}

	// TODO: es6 changes
	Charm.prototype.compareAnchors = function(comparison) {
	    var lenA = this.anchors.length;
	    var lenB = comparison.anchors.length;
	    var pointA = new THREE.Vector2();
	    var pointB = new THREE.Vector2();
	    var cutoffRadius = 10;
	    for (var i = 0; i < lenA; i++) {
	        for (var j = i; j < lenB; j++) {
	            pointA.copy(this.anchors[i].position).add(this.position);
	            pointB.copy(comparison.anchors[j].position).add(comparison.position);
	            var dist = pointA.distanceTo(pointB);
	            if (dist < cutoffRadius) {
	                return {
	                    hit: true,
	                    dist: dist,
	                    indexA: i,
	                    indexB: j
	                }
	            }
	        }
	    }

	    return {
	        hit: false
	    };
	}


	// these functions have to do with non-physical means of specifying change in location
	Charm.prototype.moveTo = function(x, y) {
	    this.pos.set(x, y);
	}

	Charm.prototype.transitionTo = function(x, y, duration) {
	    this.transitionActive = true;

	    this.transitionStart = Date.now();
	    this.duration = duration;

	    this.startPos = this.pos.clone();
	    this.endPos = new THREE.Vector2(x, y);
	}

	Charm.prototype.syncTransition = function() {
	    if (!this.transitionActive) {
	        return;
	    }

	    var progress = (Date.now() - this.transitionStart) / this.duration;
	    if (progress >= 1) {
	        this.transitionActive = false;
	        return;
	    }

	    this.pos.lerpVectors(this.startPos, this.endPos, progress);
	}
	// end of non-physical location manipulation 

	module.exports = Charm;


/***/ },
/* 4 */
/***/ function(module, exports) {

	
	function Anchor(spec, owner) {
	    this.key = spec.key;
	    this.ownerCharm = owner;
	    this.offset = spec.offset; // the offset of this anchor from the charm's origin at rotation 0
	    this.joint = null;
	    this.attachedAnchor = null;
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


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = Box2D;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	
	var Box2D = __webpack_require__(5);

	// realizing this functionality should be a mixin

	function Box2DHelper() {
	    this.world = null;
	    this.bodies = [];
	};


	Box2DHelper.prototype.init = function() {
	    var earthGravity = new Box2D.b2Vec2( 0.0, -9.8 );
	    this.world = new Box2D.b2World( earthGravity );

	    this.bodyDef = new Box2D.b2BodyDef();

	    this.fixtureDef = new Box2D.b2FixtureDef();
	    this.fixtureDef.set_density( 1.0 );
	    this.fixtureDef.set_friction( 0.5 );
	};

	Box2DHelper.prototype.createBox = function(x, y, desiredAngle, width, height, type) {
	    if (type == 'static') {
	        this.bodyDef.set_type(Box2D.b2_staticBody);
	    } else {
	        this.bodyDef.set_type(Box2D.b2_dynamicBody);
	    }
	    
	    var shape = new Box2D.b2PolygonShape();
	    shape.SetAsBox(width / 2, height / 2);
	    this.fixtureDef.set_shape( shape );

	    var newBody = this.world.CreateBody(this.bodyDef);
	    newBody.CreateFixture( this.fixtureDef );

	    newBody.SetTransform( new Box2D.b2Vec2( x, y ), desiredAngle );

	    this.bodies.push( newBody );

	    return newBody;
	};

	Box2DHelper.prototype.createJoint = function(bodyA, vectorLikeA, bodyB, vectorLikeB) {
	    var offsetA = new Box2D.b2Vec2(vectorLikeA.x, vectorLikeA.y);
	    var offsetB = new Box2D.b2Vec2(vectorLikeB.x, vectorLikeB.y);

	    var joint_def = new Box2D.b2RevoluteJointDef();
	    joint_def.set_bodyA( bodyA );
	    joint_def.set_localAnchorA( offsetA );
	    joint_def.set_bodyB( bodyB );
	    joint_def.set_localAnchorB( offsetB );

	    return Box2D.castObject( this.world.CreateJoint(joint_def), Box2D.b2RevoluteJoint );
	}


	Box2DHelper.prototype.summarize = function(body) {
	    var bpos = body.GetPosition();
	    return {
	        x: bpos.get_x(),
	        y: bpos.get_y(),
	        angle: body.GetAngle()
	    };
	};

	// FIXME: figure out way around extremely long delta
	// watch for the tab losing focus, if it does reset the `lastTime` upon returning to the tab
	var timeScale = 1;
	console.log("physics running at %s x real time delta", timeScale);
	Box2DHelper.prototype.tick = function(dt) {
	    var realDeltaInSeconds = dt / 1000;
	    var desiredDelta = 1/60;
	    this.world.Step(realDeltaInSeconds*timeScale, 2, 2);
	    this.world.ClearForces(); // not certain if this is necessary...
	};

	module.exports = Box2DHelper;



/***/ }
/******/ ]);