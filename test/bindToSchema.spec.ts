/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../src/types/ptt.d.ts" />
/// <reference path="../src/types/DataBinding.d.ts" />

import * as _ from 'lodash';
import * as chai from "chai";
const expect = chai.expect;

const Binder: Bind.BinderStatic = require('react-binding/lib/MobxBinder').default;
const SimpleBinder: Bind.BinderStatic = require('react-binding').default;
var Freezer = require('freezer-js');
import { reaction } from 'mobx';

import { initBindings, freezerCursor, simpleCursor } from "../src/index";

var personSchema = require("./examples/person.json");

const CONTAINER_PATH = ["containers", 1, "boxes"];
const FULL_NAME_CONTENT_PATH_CUSTOM_CONVERTER = CONTAINER_PATH.concat([0, "props", "content"]);
const FULL_NAME_CONTENT_PATH_SHARED_CONVERTER = CONTAINER_PATH.concat([1, "props", "content"]);

describe('person binding', () => {
  describe('initialize', () => {

    it('person schema has two containers', () => {
      var containers = personSchema.containers;
      expect(containers.length).to.equal(2);
    });

    it('render full name - freezer', () => {

      //setup
      var schema = _.cloneDeep(personSchema);
      var frozenSchema = new Freezer(schema);

      var dataContext = Binder.bindTo(schema.props.defaultData);
      var person = Binder.bindTo(dataContext, "Person");
      var firstName = Binder.bindTo(person, "FirstName");
      var lastName = Binder.bindTo(person, "LastName");

      //exec
      initBindings(new freezerCursor<PTT.Container>(frozenSchema), frozenSchema.get(), dataContext,Binder,reaction);


      //verify
      var newState = frozenSchema.get();

      expect(_.get(newState, FULL_NAME_CONTENT_PATH_CUSTOM_CONVERTER)).to.equal("Roman Samec");
      expect(_.get(newState, FULL_NAME_CONTENT_PATH_SHARED_CONVERTER)).to.equal("Roman Samec");

    });

     it('render full name - simple', () => {

      //setup
      var frozenSchema = _.cloneDeep(personSchema);

      var dataContext = Binder.bindTo(frozenSchema.props.defaultData);
      var person = Binder.bindTo(dataContext, "Person");
      var firstName = Binder.bindTo(person, "FirstName");
      var lastName = Binder.bindTo(person, "LastName");

      //exec
      initBindings(new simpleCursor<PTT.Container>(frozenSchema), frozenSchema, dataContext,SimpleBinder);


      //verify
      var newState = frozenSchema;

      expect(_.get(newState, FULL_NAME_CONTENT_PATH_CUSTOM_CONVERTER)).to.equal("Roman Samec");
      expect(_.get(newState, FULL_NAME_CONTENT_PATH_SHARED_CONVERTER)).to.equal("Roman Samec");

    });


  });

  describe('reactions', () => {
    it('render full name', (done) => {
      var doneFlag = false;
      var schema = _.cloneDeep(personSchema);
      var frozenSchema = new Freezer(schema);

      
      frozenSchema.on('update', (newState, oldState) => {
        //console.log(JSON.stringify(newState));

        if (doneFlag) {

          //verify
          expect(_.get(newState, FULL_NAME_CONTENT_PATH_CUSTOM_CONVERTER)).to.equal("John Smith");          

          done();
        }
      })

      var dataContext = Binder.bindTo(schema.props.defaultData);
      var person = Binder.bindTo(dataContext, "Person");
      var firstName = Binder.bindTo(person, "FirstName");
      var lastName = Binder.bindTo(person, "LastName");

      //exec
      initBindings(new freezerCursor<PTT.Container>(frozenSchema), frozenSchema.get(), dataContext,Binder,reaction);

      firstName.value = "John";
      lastName.value = "Smith";
      doneFlag = true;

    });
  });
});
