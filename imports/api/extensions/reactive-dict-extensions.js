import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/stevezhu:lodash';

ReactiveDict.prototype.push = function(key, obj) {
  const array = this.get(key);
  this.set(key, array.concat(obj));
};

ReactiveDict.prototype.addToSet = function(key, obj) {
  const array = this.get(key);
  if (!_.includes(array, obj)) {
    this.push(key, obj);
  }
};

ReactiveDict.prototype.remove = function(key, index) {
  let array = this.get(key);
  array.splice(index, 1);
  this.set(key, array);
};

ReactiveDict.prototype.setKey = function(key, objKey, objVal) {
  const obj = this.get(key);
  obj[objKey] = objVal;
  this.set(key, obj);
};

ReactiveDict.prototype.increment = function(key) {
  const obj = this.get(key);
  this.set(key, obj + 1);
};

ReactiveDict.prototype.decrement = function(key) {
  const obj = this.get(key);
  this.set(key, obj - 1);
};
