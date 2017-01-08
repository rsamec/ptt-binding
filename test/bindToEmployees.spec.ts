/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../src/types/ptt.d.ts" />
/// <reference path="../src/types/DataBinding.d.ts" />

var Freezer = require('freezer-js');
import { reaction } from 'mobx';
import * as _ from 'lodash';

import * as chai from "chai";
const expect = chai.expect;

var Binder: Bind.BinderStatic = require('react-binding/lib/MobxBinder').default;
import { initBindings, freezerCursor, simpleCursor } from "../src/index";

var Binder2: Bind.BinderStatic = require('react-binding').default;

var employeesSchema = require("./examples/employees.json");

const CONTAINER_PATH = ["containers", 0, "boxes"];
const EMPLOYEE_LIST = ["containers", 1, "containers",0];
const EMPLOYEE_LIST_FIRST_ROW = EMPLOYEE_LIST.concat(["containers",0]);
const EMPLOYEE_LIST_FIRST_ROW_FULL_NAME = EMPLOYEE_LIST_FIRST_ROW.concat(["boxes",3,"props","content"]);

const EMPLOYEE_LENGTH_PATH = CONTAINER_PATH.concat([0, "props", "content"]);

describe('employees repeater binding', () => {
  describe('initialize', () => {

    it('render list of employees - freezer', () => {
      //setup
      var schema = _.cloneDeep(employeesSchema);
      var frozenSchema = new Freezer(schema);

      var dataContext = Binder.bindTo(schema.props.defaultData);
      var employees = Binder.bindArrayTo(dataContext, "Employees");
      var row = employees.items[0];

      var person = Binder.bindTo(row, "Person");
      var firstName = Binder.bindTo(person, "FirstName");
      var lastName = Binder.bindTo(person, "LastName");
      
      //exec
      initBindings(new freezerCursor<PTT.Container>(frozenSchema), frozenSchema.get(), dataContext,reaction);

      
      //verify
      var newState = frozenSchema.get();

     
      expect(_.get(newState, EMPLOYEE_LENGTH_PATH)).to.equal(1);
    });

    it('render list of employees - simple', () => {
      //setup
      var frozenSchema = _.cloneDeep(employeesSchema);

      var dataContext = Binder2.bindTo(frozenSchema.props.defaultData);
      var employees = Binder2.bindArrayTo(dataContext, "Employees");
      var row = employees.items[0];

      //exec
      initBindings(new simpleCursor<PTT.Container>(frozenSchema), frozenSchema, dataContext);

      //verify
      var newState = frozenSchema;

      expect(_.get(newState, EMPLOYEE_LENGTH_PATH)).to.equal(1);
    });

  });

  describe('reactions', () => {
    it('render list of employees - add new employee', (done) => {
      var doneFlag = false;
      var schema = _.cloneDeep(employeesSchema);
      var frozenSchema = new Freezer(schema);
      frozenSchema.on('update', (newState, oldState) => {
        //console.log(JSON.stringify(newState));

        if (doneFlag) {

          //verify
          //console.log(JSON.stringify(_.get(newState,EMPLOYEE_LIST_FIRST_ROW),null,2));
          expect(_.get(newState, EMPLOYEE_LIST_FIRST_ROW_FULL_NAME)).to.equal("Roman Call");
          expect(_.get(newState, EMPLOYEE_LENGTH_PATH)).to.equal(2);

          done();
        }
      })

      var dataContext = Binder.bindTo(schema.props.defaultData);
      var employees = Binder.bindArrayTo(dataContext, "Employees");
      var row = employees.items[0];

      var person = Binder.bindTo(row, "Person");
      var firstName = Binder.bindTo(person, "FirstName");
      var lastName = Binder.bindTo(person, "LastName");

      var addresses = Binder.bindArrayTo(person, "Addresses");

      //exec
      initBindings(new freezerCursor<PTT.Container>(frozenSchema), frozenSchema.get(), dataContext,reaction);
      //console.log("-------------------- after bindings ---------------")

      lastName.value = "Call"
      employees.add({ Person: { Addresses: [{ Address: {} }] } });

      // var street = Binder.bindTo(addresses.items[1],"Address.Street");
      // street.value = "My Street";

      doneFlag = true;

    });
  });
});
