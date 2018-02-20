import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { exec } from 'child_process';
import { log } from '../logs';

import { STATS_SCRIPT } from '../../startup/config.js';

export const getStats = new ValidatedMethod({
    name: 'search.getStats',
    validate: new SimpleSchema({
        timestamp: {
            type: String
        },
    }).validator(),
    run({timestamp}) {
        log.info(`running Python script at ${STATS_SCRIPT}`);
        // const date = JSON.stringify(timestamp);
        const cmd = `echo '${timestamp}' | python ${STATS_SCRIPT}`;
        if (!this.isSimulation) {
            const response = JSON.parse(Meteor.wrapAsync(exec)(cmd));
            log.info(`script results: ${JSON.stringify(response)}`);
            return response;
        }
    }
});
