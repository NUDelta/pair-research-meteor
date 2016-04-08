import 'meteor/nooitaf:colors';

export const log = {
  debug(message) {
    console.log(`[debug]: ${ message }`.blue);
  },

  info(message) {
    console.log(`[info]: ${ message }`.green);
  },

  warning(message) {
    console.log(`[warn]: ${ message }`.yellow);
  }

};


