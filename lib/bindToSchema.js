"use strict";
var _ = require("lodash");
var CONTAINER_NAME = "Container";
var REPEATER_CONTAINER_NAME = "Repeater";
var BOXES_COLLECTION_NAME = "boxes";
var VISIBILITY_KEY = "visibility";
var ITEMS_KEY = "binding";
var ITEMS_INDEX_KEY = "index";
var EMPTY_REACTION = function () { };
function initBindings(provider, frozenSchema, dataContext, binder, reaction, cursor) {
    if (frozenSchema === undefined)
        return;
    if (dataContext === undefined)
        return;
    if (reaction === undefined)
        reaction = EMPTY_REACTION;
    if (cursor === undefined)
        cursor = [];
    var ctx = (frozenSchema.props && frozenSchema.props && frozenSchema.props['context']) || {};
    var code = ctx['code'] && ctx['code'].compiled;
    if (!!code) {
        dataContext["customCode"] = eval(code);
    }
    trav(frozenSchema, function (x, cursor) {
        bindContainer(x, provider.newCursor(cursor), dataContext, binder, reaction);
        bindBoxes(x, provider.newCursor(cursor), dataContext, binder, reaction);
    }, cursor);
}
exports.initBindings = initBindings;
var trav = function (container, fce, cursor) {
    if (cursor === undefined)
        cursor = [];
    var containers = container.containers || [];
    fce(container, cursor);
    if (container.elementName === REPEATER_CONTAINER_NAME)
        return;
    cursor.push('containers');
    for (var i = 0; i !== containers.length; i++) {
        trav(containers[i], fce, cursor.concat([i]));
    }
};
var bindBoxes = function (x, cursor, dataContext, binder, reaction) {
    if (x.boxes === undefined || x.boxes.length === 0)
        return;
    var boxes = x.boxes;
    for (var i = 0; i != boxes.length; i++) {
        var box = boxes[i];
        if (box.bindings === undefined)
            continue;
        var updated = box.props === undefined ? (cursor.newCursor(["boxes", i]).set('props', {})) : box;
        bindProps(updated, cursor.newCursor(["boxes", i, "props"]), dataContext, binder, false, reaction);
    }
};
var bindContainer = function (x, cursor, dataContext, binder, reaction) {
    var visibilityBinding = x.bindings && x.bindings[VISIBILITY_KEY];
    if (visibilityBinding !== undefined) {
        if (!!!visibilityBinding.path)
            return;
        var binding_1 = getValueBinding(dataContext, binder, visibilityBinding);
        var newCursor_1 = cursor.newCursor(["props"]);
        var setVisibilityReaction = function (val) { return newCursor_1.set(VISIBILITY_KEY, val); };
        setVisibilityReaction(binding_1.value);
        reaction(function () { return binding_1.value; }, setVisibilityReaction, false);
    }
    if (x.elementName === REPEATER_CONTAINER_NAME) {
        var clonedRepeater = _.cloneDeep(x);
        cursor.set("containers", []);
        var itemsBinding = x.bindings && x.bindings[ITEMS_KEY];
        if (!!!itemsBinding.path)
            return;
        var binding_2 = getValueBinding(dataContext, binder, itemsBinding);
        var rowsToRemove = 1;
        var lastRange = [];
        var repeaterReaction = function (dataLength) {
            var currentContainers = cursor.get('containers');
            if (currentContainers === undefined)
                return;
            var currentLength = currentContainers.length;
            if (currentLength === dataLength)
                return;
            if (dataLength > currentLength) {
                var range = { from: currentLength, to: dataLength };
                repeatContainers(range, clonedRepeater, cursor, binding_2, binder, reaction);
            }
            else {
                var rowsToRemove_1 = currentLength - dataLength;
                cursor.get("containers").splice(currentLength - rowsToRemove_1, rowsToRemove_1);
            }
        };
        repeaterReaction(binding_2.value.length);
        reaction(function () { return binding_2.value.length; }, repeaterReaction, false);
    }
    var containers = x.containers || [];
    for (var i = 0; i != containers.length; i++) {
        var box = containers[i];
        if (box.bindings === undefined)
            continue;
        var updated = box.props === undefined ? (cursor.newCursor(["containers", i]).set('props', {})) : box;
        bindProps(updated, cursor.newCursor(["containers", i, "props"]), dataContext, binder, false, reaction);
    }
};
var repeatContainers = function (range, x, cursor, binding, binder, reaction) {
    var clonedRows = [];
    for (var i = range.from; i != range.to; i++) {
        var clonedRow = _.cloneDeep(x);
        clonedRow.elementName = CONTAINER_NAME;
        clonedRow.name = clonedRow.name + "." + i;
        clonedRow.props[ITEMS_KEY] = undefined;
        clonedRow.props[ITEMS_INDEX_KEY] = i;
        clonedRows.push(clonedRow);
    }
    var containers = cursor.get("containers");
    var updated = containers.splice.apply(containers, [range.from, 0].concat(clonedRows));
    if (updated.length === 0)
        updated = containers;
    var rootArrayBinding = binder.bindArrayTo(binding, undefined, binding["valueConverter"]);
    var dataItems = rootArrayBinding.items;
    dataItems["customCode"] = binding["customCode"];
    for (var i = range.from; i != range.to; i++) {
        initBindings(cursor, updated[i], dataItems[i], binder, reaction, ["containers", i]);
    }
};
var bindProps = function (box, cursor, dataContext, binder, isDesignMode, reaction) {
    if (box === undefined)
        return;
    var bindings = box.bindings;
    if (bindings === undefined)
        return;
    var props = box.props;
    if (props === undefined)
        return;
    var _loop_1 = function () {
        var bindingProps = bindings[propName];
        if (bindingProps === undefined)
            return "continue";
        if (!!!bindingProps.path) {
            props[propName] = undefined;
            return "continue";
        }
        isArrayBinding = bindingProps.mode === 'OneTime';
        var binding = isArrayBinding ? getArrayBinding(dataContext, binder, bindingProps) : getValueBinding(dataContext, binder, bindingProps);
        if (!isDesignMode && (bindingProps.mode === 'TwoWay' || bindingProps.mode === 'OneTime')) {
            cursor.set("valueLink", binding);
        }
        var setValueReaction = function (val) {
            cursor.set(propName, val);
        };
        if (getBinding(binding, bindingProps)) {
            setValueReaction(binding.value);
            reaction(function () { return binding.value; }, setValueReaction, false);
        }
        else {
            setValueReaction(binding.items);
            reaction(function () { return binding.items; }, setValueReaction, false);
        }
    };
    var isArrayBinding;
    for (var propName in bindings) {
        _loop_1();
    }
    return props;
};
var getConverter = function (dataContext, bindingProps) {
    var converter;
    if (!!bindingProps.converter && !!bindingProps.converter.compiled) {
        converter = eval(bindingProps.converter.compiled);
        if (typeof converter === 'string' || converter instanceof String) {
            var rootContext = dataContext.root;
            var sharedConverter = rootContext["customCode"] && rootContext["customCode"][converter];
            if (sharedConverter === undefined)
                return;
            converter = sharedConverter;
        }
    }
    return converter;
};
var getBinding = function (binding, bindingProps) {
    return bindingProps.mode !== 'OneTime';
};
var getValueBinding = function (dataContext, binder, bindingProps) {
    var converter = getConverter(dataContext, bindingProps);
    return binder.bindTo(dataContext, bindingProps.path, converter, bindingProps.converterArgs);
};
var getArrayBinding = function (dataContext, binder, bindingProps) {
    var converter = getConverter(dataContext, bindingProps);
    return binder.bindArrayTo(dataContext, bindingProps.path, converter, bindingProps.converterArgs);
};
