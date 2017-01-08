/// <reference path="../src/types/DataBinding.d.ts" />

import * as _ from 'lodash';
var Binder: Bind.BinderStatic = require('react-binding/lib/MobxBinder').default;

const CONTAINER_NAME = "Container";
const REPEATER_CONTAINER_NAME = "Repeater";
const BOXES_COLLECTION_NAME = "boxes";

const VISIBILITY_KEY = "visibility";
const ITEMS_KEY = "binding";
const ITEMS_INDEX_KEY = "index";

declare type Reaction = (expression: () => any,effect: (arg: any, r: { dispose: () => void}) => void, fireImmediately?: boolean) => void
const EMPTY_REACTION:Reaction = () => {}

export function initBindings(provider: Cursor.Provider<PTT.Container>, frozenSchema: PTT.Container, dataBinder: any, reaction?:Reaction, cursor?: Cursor.Path) {

	if (frozenSchema === undefined) return;
	if (dataBinder === undefined) return;

	if (reaction === undefined) reaction = EMPTY_REACTION;
	if (cursor === undefined) cursor = [];

	var ctx = (frozenSchema.props && frozenSchema.props && frozenSchema.props['context']) || {};
	var code = ctx['code'] && ctx['code'].compiled;
	if (!!code) {
		dataBinder.customCode = eval(code);
	}

	trav(frozenSchema, function (x, cursor) {

		// bind container
		bindContainer(x, provider.newCursor<PTT.Container>(cursor), dataBinder,reaction);

		// bind boxes
		bindBoxes(x, provider.newCursor<PTT.Container>(cursor), dataBinder,reaction);

	}, cursor);
}
var trav = function (container: PTT.Container, fce: (currentNode: PTT.Container, cursor: Cursor.Path) => void, cursor?: Cursor.Path) {
	if (cursor === undefined) cursor = [];
	var containers = container.containers || [];
	fce(container, cursor);
	if (container.elementName === REPEATER_CONTAINER_NAME) return;
	cursor.push('containers');
	for (var i = 0; i !== containers.length; i++) {
		trav(containers[i], fce, cursor.concat([i]));
	}
}
var bindBoxes = (x: PTT.Container, cursor: Cursor.Provider<PTT.Node>, dataBinder: Bind.BinderStatic,reaction:Reaction) => {
	// bind boxes
	if (x.boxes === undefined || x.boxes.length === 0) return;

	var boxes = x.boxes;
	for (var i = 0; i != boxes.length; i++) {
		var box = boxes[i];
		if (box.bindings === undefined) continue;
		//console.log(cursor.path.concat(["boxes", i]));
		
		var updated:PTT.Node = box.props === undefined ? (cursor.newCursor<PTT.Node>(["boxes",i]).set('props', {})) : box;
		//console.log(updated);
		//var updated = box.props === undefined ? box.set('props', {}) : box;
		bindProps(updated, cursor.newCursor<PTT.Node>(["boxes", i, "props"]), dataBinder, false,reaction);
	}
}
var bindContainer = (x: PTT.Container, cursor: Cursor.Provider<PTT.Container>, dataBinder: Bind.BinderStatic,reaction:Reaction) => {

	var visibilityBinding = x.bindings && x.bindings[VISIBILITY_KEY];

	if (visibilityBinding !== undefined) {
		if (!!!visibilityBinding.path) return;

		let binding = getValueBinding(dataBinder, visibilityBinding);
		let newCursor = cursor.newCursor(["props"]);

		// create reaction when binding.value changed
		let setVisibilityReaction = (val: any) => newCursor.set(VISIBILITY_KEY, val);

		setVisibilityReaction(binding.value);
		reaction(() => binding.value, setVisibilityReaction,false);

	}

	if (x.elementName === REPEATER_CONTAINER_NAME) {

		cursor.set("containers", []);

		var itemsBinding = x.bindings && x.bindings[ITEMS_KEY];
		if (!!!itemsBinding.path) return;

		let binding = getValueBinding(dataBinder, itemsBinding);

		let rowsToRemove = 1; // default is 1=the repetaer itself
		var lastRange: any[] = [];

		let repeaterReaction = (dataLength: number) => {
			var currentContainers = cursor.get("containers");
			if (currentContainers === undefined) return;

			var currentLength = currentContainers.length;
			if (currentLength === dataLength) return;

			// console.log("reaction Length: " + dataLength + " != " + currentLength);

			if (dataLength > currentLength) {

				// add rows				
				let range = { from: currentLength, to: dataLength };
				repeatContainers(range, x, cursor, binding,reaction);

			}
			else {
				// remove rows
				let rowsToRemove = currentLength - dataLength;
				cursor.get("containers").splice(currentLength - rowsToRemove, rowsToRemove);
			}

		}
		repeaterReaction(binding.value.length);
		reaction(() => binding.value.length, repeaterReaction, false)
	}

	var containers = x.containers || [];
	for (var i = 0; i != containers.length; i++) {
		var box = containers[i];
		if (box.bindings === undefined) continue;
		var updated = box.props === undefined ? (cursor.newCursor<PTT.Container>(["containers",i]).set('props', {})) : box;
		//console.log(updated);
		//var updated = box.props === undefined ? box.set('props', {}) : box;
		bindProps(updated, cursor.newCursor<any>(["containers", i, "props"]), dataBinder, false,reaction);
	}
}
var repeatContainers = (range: { from: number, to: number }, x: PTT.Container, cursor: Cursor.Provider<PTT.Container>, binding: any,reaction:Reaction): void => {
	let clonedRows: PTT.Container[] = [];
	// for each row - deep clone row template
	for (let i = range.from; i != range.to; i++) {
		var clonedRow = _.cloneDeep(x);
		clonedRow.elementName = CONTAINER_NAME;
		clonedRow.name = clonedRow.name + "." + i;
		clonedRow.props[ITEMS_KEY] = undefined;
		clonedRow.props[ITEMS_INDEX_KEY] = i;

		clonedRows.push(clonedRow);
	}
	let containers = cursor.get("containers");
	var updated = containers.splice(range.from, 0, ...clonedRows);

	var rootArrayBinding = Binder.bindArrayTo(binding, undefined, binding.valueConverter);
	let dataItems = rootArrayBinding.items;

	for (let i = range.from; i != range.to; i++) {
		initBindings(cursor, updated[i], dataItems[i],reaction, ["containers", i]);
	}

}
var bindProps = (box: PTT.Node, cursor: Cursor.Provider<PTT.Node>, dataBinder: Bind.BinderStatic, isDesignMode: boolean,reaction:Reaction) => {
	if (box === undefined) return;

	let bindings = box.bindings;
	if (bindings === undefined) return;

	let props = box.props;
	if (props === undefined) return;

	// go through all properties
	for (var propName in bindings) {

		let bindingProps = bindings[propName];

		// if binding -> replace binding props
		if (bindingProps === undefined) continue;

		if (!!!bindingProps.path) {
			// binding is not correctly set - do not apply binding
			props[propName] = undefined;
			continue;
		}

		var isArrayBinding = bindingProps.mode ==='OneTime'; 
		// apply binding		
		let binding = isArrayBinding? getArrayBinding(dataBinder, bindingProps): getValueBinding(dataBinder, bindingProps);

		if (!isDesignMode && (bindingProps.mode === 'TwoWay' || bindingProps.mode === 'OneTime')) {
			//apply two-way binding
			cursor.set("valueLink", binding);
		}
				
		// create reaction when binding.value changed
		let setValueReaction = (val: any) => {
			//console.log(cursor.path.join(".") +" , " + propName + " = " + val);			
			cursor.set(propName, val) 
		}
		if (getBinding(binding, bindingProps)){
			setValueReaction(binding.value)
			reaction(() => (<Bind.Binding>binding).value, setValueReaction,false);
		}
		else{
			setValueReaction(binding.items)
			reaction(() => (<Bind.ArrayBinding>binding).items, setValueReaction, false);
		}
	}

	return props;
}
var getConverter = (dataBinder: Bind.BinderStatic, bindingProps: any) => {
	var converter: any;
	if (!!bindingProps.converter && !!bindingProps.converter.compiled) {
		converter = eval(bindingProps.converter.compiled);

		if (typeof converter === 'string' || converter instanceof String) {

			var sharedConverter = (<any>dataBinder)["customCode"] && (<any>dataBinder)["customCode"][<any>converter];
			if (sharedConverter === undefined) return;
			converter = sharedConverter;
		}
	}
	return converter;

}

var getBinding = (binding : Bind.ArrayBinding | Bind.Binding, bindingProps:any): binding is Bind.Binding => {
	return bindingProps.mode !== 'OneTime';
}
var getValueBinding = (dataBinder: Bind.BinderStatic, bindingProps: any) => {
	var converter = getConverter(dataBinder, bindingProps);
	return Binder.bindTo(dataBinder, bindingProps.path, converter, bindingProps.converterArgs);
}
var getArrayBinding = (dataBinder: Bind.BinderStatic, bindingProps: any) => {
	var converter = getConverter(dataBinder, bindingProps);
	return Binder.bindArrayTo(dataBinder, bindingProps.path, converter, bindingProps.converterArgs);
}
