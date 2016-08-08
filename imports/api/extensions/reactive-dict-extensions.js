import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/stevezhu:lodash';

/**
 * Pushes an item to a key-value in the reactive dict.
 * @external 'ReactiveDict'
 * @param {string} key
 * @param {*} obj
 */
ReactiveDict.prototype.push = function(key, obj) {
  const array = this.get(key);
  this.set(key, array.concat(obj));
};

/**
 * Pushes a unique item to a key-value in the reactive dict.
 * @external 'ReactiveDict'
 * @param {string} key
 * @param {*} obj
 */
ReactiveDict.prototype.addToSet = function(key, obj) {
  const array = this.get(key);
  if (!_.includes(array, obj)) {
    this.push(key, obj);
  }
};

/**
 * Removes one item at index of a key-value array in the reactive dict.
 * @external 'ReactiveDict'
 * @param {string} key
 * @param {number} index
 */
ReactiveDict.prototype.removeIndex = function(key, index) {
  let array = this.get(key);
  array.splice(index, 1);
  this.set(key, array);
};

/**
 * Sets one key-value pair of an key-value object in the reactive dict.
 * @param {string} key
 * @param {string} objKey
 * @param {*} objVal
 */
ReactiveDict.prototype.setKey = function(key, objKey, objVal) {
  const obj = this.get(key);
  obj[objKey] = objVal;
  this.set(key, obj);
};

/**
 * Increments one key-value number in the reactive dict.
 * @param {string} key
 */
ReactiveDict.prototype.increment = function(key) {
  const obj = this.get(key);
  this.set(key, obj + 1);
};

/**
 * Decrements one key-value number in the reactive dict.
 * @param {string} key
 */
ReactiveDict.prototype.decrement = function(key) {
  const obj = this.get(key);
  this.set(key, obj - 1);
};
