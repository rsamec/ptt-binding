"use strict";
var _ = require("lodash");
var SimpleCursor = (function () {
    function SimpleCursor(target, path) {
        this.target = target;
        this.path = path || [];
    }
    SimpleCursor.prototype.set = function (propName, value) {
        var targetNode = this.getNodeByPath(this.path);
        if (targetNode === undefined)
            return;
        _.set(targetNode, propName, value);
        return targetNode;
    };
    SimpleCursor.prototype.get = function (propName) {
        var targetNode = this.getNodeByPath(this.path);
        if (targetNode === undefined)
            return;
        return targetNode[propName];
    };
    SimpleCursor.prototype.newCursor = function (path) {
        if (path === undefined)
            return new SimpleCursor(this.target, this.path);
        return new SimpleCursor(this.target, this.path.concat(path));
    };
    SimpleCursor.prototype.getNodeByPath = function (path) {
        if (path === undefined || path.length === 0)
            return this.target;
        var targetNode = _.get(this.target, path);
        return targetNode;
    };
    return SimpleCursor;
}());
exports.__esModule = true;
exports["default"] = SimpleCursor;
