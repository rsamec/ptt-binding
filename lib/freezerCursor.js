"use strict";
var _ = require("lodash");
var FreezerCursor = (function () {
    function FreezerCursor(target, path) {
        this.target = target;
        this.path = path || [];
    }
    FreezerCursor.prototype.set = function (propName, value) {
        var targetNode = this.getNodeByPath(this.path);
        if (targetNode === undefined)
            return;
        return targetNode.set(propName, value);
    };
    FreezerCursor.prototype.get = function (propName) {
        var targetNode = this.getNodeByPath(this.path);
        if (targetNode === undefined)
            return;
        return targetNode[propName];
    };
    FreezerCursor.prototype.newCursor = function (path) {
        if (path === undefined)
            return new FreezerCursor(this.target, this.path);
        return new FreezerCursor(this.target, this.path.concat(path));
    };
    FreezerCursor.prototype.getNodeByPath = function (path) {
        if (path === undefined || path.length === 0)
            return this.target.get();
        var targetNode = _.get(this.target.get(), path);
        return targetNode;
    };
    return FreezerCursor;
}());
exports.__esModule = true;
exports["default"] = FreezerCursor;
