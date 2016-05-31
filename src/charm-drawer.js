
function CharmDrawer(rootElem) {
    rootElem.className = "charmDrawerRoot";
    rootElem.style.width = "200px";
    this.containers = {
        root: rootElem
    };
}

CharmDrawer.prototype.defineCategory = function(categoryName) {
    var cat = document.createElement('div');
    cat.setAttribute('data-type', categoryName);
    cat.className = "drawerCategory group";
    cat.innerHTML = `<div class="categoryHeader">category: ${categoryName}</div>`;

    this.containers.root.appendChild(cat);
    this.containers[categoryName] = cat;
};

console.warn("TODO: add anchors to drawer charms");
CharmDrawer.prototype.addCategoryEntry = function(categoryName, charmDef) {
    var cat = this.containers[categoryName];

    var cell = document.createElement('div');
    cell.setAttribute('data-type', categoryName);
    cell.setAttribute('data-key', charmDef.key);
    cell.className = "categoryCell clearFix";
    cell.style.backgroundImage = `url(${charmDef.imgURL})`;

    cat.appendChild(cell);
    console.log(charmDef);
};

module.exports = CharmDrawer;
