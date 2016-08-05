import { Meteor } from 'meteor/meteor';

export const DEV_OPTIONS = {
  CLEAN_DB: 1,
  AUTOJOIN: 1,
  LATENCY: 2000
};


export const PAIR_SCRIPT = 'assets/app/scripts/pair_research.py';

export const ADMIN_ID = Meteor.settings.adminId;
