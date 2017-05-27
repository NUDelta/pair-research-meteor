import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { exec } from 'child_process';
import { log } from '../logs';

import { TEST_SCRIPT } from '../../startup/config.js';

// export const getStats = new ValidatedMethod({
//     name: 'stats.getStats',
//     validate: new SimpleSchema({
//         groupId: {
//             type: String,
//             regEx: SimpleSchema.RegEx.Id
//         }
//     }).validator(),
//     run({groupId}) {
//         console.log("Function called")
//         // Simulating lag for the pairing in progress spinner.
//         if (Meteor.isDevelopment && !this.isSimulation) {
//             console.log("Dev/Simulation branch ran")
//             log.debug(`Sleeping for ${DEV_OPTIONS.LATENCY} ms...`);
//             Meteor._sleepForMs(DEV_OPTIONS.LATENCY);
//         }
//
//         log.info(`running Python script at ${TEST_SCRIPT}`);
//         const data = "Yooooooooooooo";
//         console.log(groupId);
//         const cmd = `echo '${data}' | python ${TEST_SCRIPT}`;
//         console.log(cmd);
//         const response = JSON.parse(Meteor.wrapAsync(exec)(cmd));
//         console.log(response);
//         log.info(`script results: ${JSON.stringify(response)}`);
//
//         return response;
//     }
// });

export const getStats = new ValidatedMethod({
    name: 'stats.getStats',
    validate: new SimpleSchema({
        groupId: {
            type: String,
            regEx: SimpleSchema.RegEx.Id
        }
    }).validator(),
    run({groupId}) {
        console.log("Function called")
        log.info(`running Python script at ${TEST_SCRIPT}`);
        console.log(groupId);
        // var obj = [ [ 0, 1, 47 ], [ 1, 2, 71 ] ];
        var obj = "test"
        const data = JSON.stringify(obj);
        const cmd = `echo '${data}' | python ${TEST_SCRIPT}`;
        console.log(cmd);
        if (!this.isSimulation) {
            const response = JSON.parse(Meteor.wrapAsync(exec)(cmd));
            console.log(response);
            log.info(`script results: ${JSON.stringify(response)}`);

            return response;
        }
    }
});
