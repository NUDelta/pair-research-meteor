import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { exec } from 'child_process';
import { log } from '../logs';

import { HELPER_SCRIPT } from '../../startup/config.js';

export const getHelpers = new ValidatedMethod({
    name: 'search.getHelpers',
    validate: new SimpleSchema({
        phrase: {
            type: String
        },
    }).validator(),
    run({phrase}) {
        log.info(`running Python script at ${HELPER_SCRIPT}`);
        const data = JSON.stringify(phrase);
        const cmd = `echo '${data}' | python ${HELPER_SCRIPT}`;
        if (!this.isSimulation) {
            const response = JSON.parse(Meteor.wrapAsync(exec)(cmd));
            log.info(`script results: ${JSON.stringify(response)}`);
            return response;
        }
    }
});


// const methodWithApplyOptions = new ValidatedMethod({
//   name: 'methodWithApplyOptions',
//   validate: new SimpleSchema({}).validator(),
//   applyOptions: {
//     onResultReceived: function() {
//       resultReceived = true;
//     }
//   },
//   run() {
//     return 'result';
//   }
// });
