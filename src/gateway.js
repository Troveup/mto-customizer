
function Gateway() {
    this.cache = Object.create(null);
}

// fetch item based on cloudRef, add to cache based on type and key and return promise with data
Gateway.prototype.load = function(ref) {
    var publicURL = `https://storage.googleapis.com/${ref.bucket}/gateway/${ref.refType}/${ref.key}/${ref.hash}.json`;

    var categoryType = ref.refType;
    var typeHash = this.cache[categoryType];
    if (!typeHash) {
        typeHash = this.cache[categoryType] = {};
    }

    return fetch(publicURL)
        .then(function (response) {
            typeHash[ref.key] = Promise.resolve(response.json());
            return typeHash[ref.key];
        });
};

Gateway.prototype.forTypeEach = function(type, fn) {
    var typeHash = this.cache[type];
    Object.keys(typeHash).map(function(hashKey) {
        fn.call(null, typeHash[hashKey]);
    });
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
