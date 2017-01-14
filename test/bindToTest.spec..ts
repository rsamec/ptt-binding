/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../src/types/ptt.d.ts" />
/// <reference path="../src/types/DataBinding.d.ts" />

import * as _ from 'lodash';
import * as chai from "chai";
const expect = chai.expect;

const Binder: Bind.BinderStatic = require('react-binding').default;
import { initBindings, simpleCursor } from "../src/index";

var schema = require("./examples/MobxTest.json");

const CONTAINER_PATH = ["containers", 1, "boxes"];

describe('simple person binding', () => {
  describe('initialize', () => {

     it('render full name - simple', () => {

      //setup
      var frozenSchema = _.cloneDeep(schema);

      var dataContext = Binder.bindTo(frozenSchema.props.defaultData);
      // var person = Binder.bindTo(dataContext, "Person");
      // var firstName = Binder.bindTo(person, "FirstName");
      // var lastName = Binder.bindTo(person, "LastName");

      //exec
      initBindings(new simpleCursor<PTT.Container>(frozenSchema), frozenSchema, dataContext,Binder);


      //verify
      var newState = frozenSchema;

      //console.log(newState);


    });


  });
});
