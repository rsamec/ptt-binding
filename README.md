# ptt-binding

It enables to extend [PTT document](https://github.com/rsamec/ptt) with data binding capability. 

Data binding suppport for each component and its props can be simple added by extending PTT Node by 

+   **bindings** - component bindings - corresponds to component props, each prop can have its own binding exporession
   
```json
{
 "name": "Hello World Example",
 "elementName": "PTTv1",
 "containers": [
    {
     "name": "My first container",
     "elementName": "Container",
     "style": { "top": 0, "left": 0, "height": 200, "width": 740, "position": "relative" },
     "boxes": [{
        "name": "My first text",
        "elementName": "TextContent",
        "style": { "top": 0, "left": 0 },
        "props":{
            "content": "Hello world"
            }
        },
        bindings":{
            "content": "data.message"
            }
        }]
    }]
}
```
The binding expression path __data.message__ is evaluated before rendering occurs and the value __Hello world__ is replaced with the data binding result.

## Features

+   supports mutable + immutable data structures
+   supports reactions using [mobx](https://github.com/mobxjs/mobx) - reactive virtual dependency state graph that is only updated when strictly needed and is never stale

## Main goal

+   strictly separate content description from content applying
+   render effectivally UI and react to data changes effectively.


### Content desription

+   _schema_ is framework agnostic content description [PTT document](https://github.com/rsamec/ptt)
+   _data_ is fremework agnostic data descriptin (plain JSON).
+   _binding_ is framework agnostic connection between _schema_ and _data_ [ptt-binding](https://github.com/rsamec/ptt-binding).


### Content applying

+   [react](https://github.com/facebook/react) provides mechanisms to optimally render UI by using a virtual DOM that reduces the number of costly DOM mutations
+   [freezer](https://github.com/arqex/freezer) provides hiearchy immutable data structure to help react to update only the right part of UI
+   [mobx](https://github.com/mobxjs/mobx) provides reactive virtual dependency state graph that is only updated when strictly needed and is never stale.

### Examples


- To use the ptt-binding with immutable ptt-schema using `freezer-js` and `mobx reaction` class in a JavaScript file -

```js
//import
var Freezer = require('freezer-js');
var reaction = require('mobx').reaction;
var Binder = require('react-binding').default;

//ptt-binding
var initBindings = require('ptt-binding').initBindings;
var freezerCursor = require('ptt-binding').freezerCursor;

var schema = {}
var data = {}

var freezer = new Freezer(schema);
var dataContext = Binder.bindTo(data);

//init bindings for current schema with data context
initBindings(new freezerCursor(freezer), freezer.get(), dataContext,reaction);
```

- To use the ptt-binding with simple mutable plain JSON object and without `reactions` class in a JavaScript file -

```js
//import
var Binder = require('react-binding').default;

var initBindings = require('ptt-binding').initBindings;
var simpleCursor = require('ptt-binding').simpleCursor;

var schema = {}
var data = {}

//exec
initBindings(new simpleCursor(schema), schema, Binder.bindTo(data));
```
