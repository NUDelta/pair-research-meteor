import 'meteor/nooitaf:colors';

export const log = {
  debug(message) {
    console.log(`[debug]: ${ process(message) }`.blue);
  },

  info(message) {
    console.log(`[info]: ${ process(message) }`.green);
  },

  warning(message) {
    console.log(`[warn]: ${ process(message) }`.yellow);
  }
};

function process(message) {
  if (typeof message == 'string') {
    return message;
  } else {
    return JSON.stringify(message);
  }
}


