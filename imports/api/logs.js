import 'meteor/nooitaf:colors';

export const log = {
  debug(message) {
    console.log(`[debug]: ${ JSON.stringify(message) }`.blue);
  },

  info(message) {
    console.log(`[info]: ${ JSON.stringify(message) }`.green);
  },

  warning(message) {
    console.log(`[warn]: ${ JSON.stringify(message) }`.yellow);
  }

};


