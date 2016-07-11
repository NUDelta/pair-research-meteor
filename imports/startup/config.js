import { Meteor } from 'meteor/meteor';

export const DEV_OPTIONS = {
  CLEAN_DB: 0,
  AUTOJOIN: 0,
  LATENCY: 0
};


export const PAIR_SCRIPT = 'assets/app/scripts/pair_research.py';

export const ADMIN_ID = Meteor.settings.adminId;
