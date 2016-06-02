
function Gateway() {
    this.cache = Object.create(null);
}

console.log("woo woo got here");

// fetch item based on cloudRef, add to cache based on type and key and return promise with data
Gateway.prototype.load = function(ref) {
    var publicURL = `https://storage.googleapis.com/${ref.bucket}/gateway/${ref.type}/${ref.key}/${ref.hash}.json`;

    var contents = null;
    fetch(publicURL)
        .then(function (response) {
            contents = response.json();
        });

    var typeHash = this.cache[ref.type];
    if (!typeHash) {
        typeHash = this.cache[ref.type] = {};
    }
    typeHash[ref.key] = contents;
};

Gateway.prototype.get = function(type, key) { // eventually version
    return !!this.cache[type] ? this.cache[type][key] : null;
};

// directly set to cache, used internally and for debugging
Gateway.prototype.set = function(type, key, entry) {
    if (!this.cache[type]) {
        this.cache[type] = {};
    }
    this.cache[type][key] = entry;
};

module.exports = Gateway;
