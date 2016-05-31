
function Gateway() {
    this.cache = {};
}

/* potential CloudReference format
 * {
 *  bucket: '',
 *  type: '',
 *  key: '',
 *  version: 1 // not immediately necessary
 * }
 */

// fetch item based on cloudRef, add to cache based on type and key and return promise with data
Gateway.prototype.load = function(cloudRef) {
};

Gateway.prototype.get = function(type, key) { // eventually version
};

// directly set to cache, used internally and for debugging
Gateway.prototype.set = function(type, key, entry) {
};

module.exports = Gateway;
