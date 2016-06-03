
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
        this.executedDefinitionHandler();
    }
};

Overlay.prototype.displayDefinition = function(charmDef) {
    this.storedDefinition = charmDef;
    var imgDiv = this.root.querySelector('.categoryCell');
    imgDiv.style.margin = '10px';
    imgDiv.style.width = '80px';
    imgDiv.style.height = '80px';
    imgDiv.style.backgroundImage = `url(${charmDef.imgURL})`;

    this.root.style.display = 'block';
};

Overlay.prototype.handleButton = function(fn) {
    if (this.storedDefinition) {
        fn.call(null, this.storedDefinition);
    }
};

Overlay.prototype.executedDefinitionHandler = function() {
    this.defHandler.call(null, this.storedDefinition);
};

Overlay.prototype.registerDefHandler = function(fn) {
    this.defHandler = fn;
};

// may need to modify this so definition is also passed, depends on what is
// needed for rendering overlay details. if just image and charm ref needed
// for deletion this is fine
Overlay.prototype.displayInstance = function(charm) {
};

Overlay.prototype.hide = function() {
    this.root.style.display = 'none';
    this.storedDefinition = null;
    this.storedInstance = null;
};

module.exports = Overlay;

