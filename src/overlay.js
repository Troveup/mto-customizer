
function Overlay(container) {
    this.root = container;

    this.storedDefinition = null;
    this.storedInstance = null;
}

Overlay.prototype.buildHTML = function() {
    this.root.innerHTML = ` <div class="categoryCell"></div> <button>Add Charm</button>`;
    this.root.style.display = 'none';

    var button = this.root.querySelector('button');
    button.addEventListener('click', this.handleGenericButtonClick.bind(this));
};

Overlay.prototype.handleGenericButtonClick = function() {

    if (this.storedDefinition) {
        this.defHandler.call(null, this.storedDefinition);
    }

    if (this.storedInstance) {
        this.instanceHandler.call(null, this.storedInstance);
        this.hide();
    }
};

Overlay.prototype.displayDefinition = function(charmDef) {
    this.storedDefinition = charmDef;
    this.storedInstance = null;

    var imgDiv = this.root.querySelector('.categoryCell');
    imgDiv.style.margin = '10px';
    imgDiv.style.width = '80px';
    imgDiv.style.height = '80px';
    imgDiv.style.backgroundImage = `url(${charmDef.imgURL})`;

    var button = this.root.querySelector('button');
    button.innerHTML = 'Add Charm';

    this.root.style.display = 'block';
};

// may need to modify this so definition is also passed, depends on what is
// needed for rendering overlay details. if just image and charm ref needed
// for deletion this is fine
Overlay.prototype.displayInstance = function(charm) {
    this.storedDefinition = null;
    this.storedInstance = charm;

    var imgDiv = this.root.querySelector('.categoryCell');
    imgDiv.style.backgroundImage = `url(${charm.imgURL})`;

    var button = this.root.querySelector('button');
    button.innerHTML = 'Remove Charm';

    this.root.style.display = 'block';
};

Overlay.prototype.registerDefHandler = function(fn) {
    this.defHandler = fn;
};
Overlay.prototype.registerInstanceHandler = function(fn) {
    this.instanceHandler = fn;
};

Overlay.prototype.hide = function() {
    this.root.style.display = 'none';
    this.storedDefinition = null;
    this.storedInstance = null;
};

module.exports = Overlay;

