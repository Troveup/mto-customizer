
function CharmDrawer(rootElem) {
    rootElem.className = "charmDrawerRoot";
    rootElem.style.width = "200px";
    rootElem.style.border = '1px solid black';
    this.containers = {
        root: rootElem
    };
    this.handlers = {};
}

// TODO: define max height and other parameters
CharmDrawer.prototype.defineCategory = function(opts) {
    var cat = document.createElement('div');
    cat.setAttribute('data-type', opts.type);
    cat.className = "drawerCategory group";
    cat.innerHTML = `<div class="categoryHeader">${opts.title}</div>`;

    this.containers.root.appendChild(cat);
    this.containers[opts.type] = cat;
};

//console.warn("TODO: render anchors on drawer charms");
CharmDrawer.prototype.addTypeEntry = function(categoryType, charmDef) {
    var cat = this.containers[categoryType];

    var cell = document.createElement('div');
    //cell.setAttribute('data-type', categoryType);
    cell.setAttribute('data-key', charmDef.key);
    cell.className = "categoryCell";
    cell.style.backgroundImage = `url(${charmDef.imgURL})`;

    if (this.handlers[categoryType]) {
        var fn = this.handlers[categoryType];
        cell.addEventListener('click', function(evt) {
            var key = evt.target.getAttribute('data-key');
            fn.call(null, categoryType, key);
        });
    }

    cat.appendChild(cell);
};

// for every cell of the given @categoryType apply the @fn with parametesr:
// fn(type, key) // from gateway scheme, tbdocumented
// don't really need the type parameter, seemed like it would be nice
CharmDrawer.prototype.registerTypeHandler = function(categoryType, fn) {
    this.handlers[categoryType] = fn;
    var cat = this.containers[categoryType];
    var cells = cat.querySelectorAll('.drawerCategory .categoryCell');
    for (var i = 0; i < cells.length; i++) {
        cells[i].addEventListener('click', function(evt) {
            var key = evt.target.getAttribute('data-key');
            fn.call(null, categoryType, key);
        });
    }
};

// TODO: add and remove trove pink border around selected elements
CharmDrawer.prototype.highlightEntry = function(categoryType, key) { };
CharmDrawer.prototype.clearHighlight = function(categoryType) { };


module.exports = CharmDrawer;
