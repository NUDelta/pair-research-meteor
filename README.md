# Pair Research

[Pair Research](https://groups.csail.mit.edu/uid/other-pubs/cscw14-pair-research.pdf) is a new
kind of interaction developed by Miller, Zhang, Gilbert & Gerber designed to pair members of
group together weekly to work on each other's projects.

This application takes the original Google Sheets prototype further, developing platform on
which users can create customized groups to make pairings with, view analytics, and promote
pairings and collaboration between certain subgroups (e.g. professors with students in a
research lab)

## Development

This project was developed with [Meteor 1.3/1.4](https://guide.meteor.com/) best practices in
mind. This section describes some architectural design decisions and any nonconventional
dev solutions.

### API Organization
Pair Research's general functionality depends on the following collections:

 * `Affinities`: The current set of `N x N` ratings between group members about how much
 they are capable of helping the other person with their task.
 * `Groups`: This is the main organizational unit of Pair Research, in which people
 participate in Pair Research together.
 * `Pairings`: This is the set of all pairings results generated per group
 * `Tasks`: The current set of tasks each group member wants to complete in a Pair Research
 session.
 * `Meteor.users`: The user organization unit, pulled in by the `accounts-base` and
 `accounts-password` packages.
 
Each collection has an appropriate set of methods in the same folder as the collection definition.

The Pair Research app provides a number of analytic functions in some archival collections.
In particular, `Affinities` and `Tasks` only contains the current tasks of a user, so additional
`AffinitiesHistory` and `TasksHistory` collections store historic info with some additional
metadata. Currently, a `PairsHistory` collection also archives Pairing information. This might 
not be necessary.

We also extend the `lodash` and `ReactiveDict` packages in `/imports/api/extensions` and add
some Blaze helpers in `/imports/ui/blaze-helpers.js`.

Any new files with package extensions or server-side API startup registrations (e.g. defining 
methods or publications) must be added to the appropriate `register-api.js` file in 
`/imports/startup/[client|server]`.

### Authentication
We've defined an authentication mixin that can be attached to any method. See 
`/imports/api/authentication.js`.

### The Pair Research Script
Pair Research actually relies on a Python script to do the matching after we create the
graph in Javascript (`/imports/api/pairings/methods.js:makePairs`). To run this script,
we load it as an asset in the `private/` folder and `exec` it.

### Git Setup
There's two really important branches here: `deploy` and `master`. `master` is the main branch: be sure
to never force push to master. `deploy` is always expected to be a number of commits ahead of masters
(e.g. deploy settings, database migrations). In general, migrations consists of two commits: one for the
actual deployment and one with the migration commented out and timestamped. To keep track of what version
is live, avoid force pushing `deploy` until it's live. Use `git rebase` to keep the migrations as the latest commit.

## Deployment
Pair Research is hosted on [Galaxy](https://galaxy.meteor.com) and [mLab](https://mlab.com). We host a production and staging server. It is recommended that all major changes be deployed to the staging server first for testing.

### Setup
You will need the `settings-staging.json` and `settings-production.json` to deploy to the staging and production servers respectively. These can be found in the DTR Dropbox (`/App Builds/Pair Research` folder).

Additionally, you will need access the the Galaxy and mLab accounts. Ask Haoqi to add you to DTR Galaxy account and ask Yongsung for his mLab credientials since the Pair Research database is under his account (*note: In the future, we should probably do a migration to more easily scalable DB since we should be wary of hitting rate limits on this application*).

### Deploying
We provide two scripts that allow you to easily deploy to the servers, given you have completed the above steps. 

`npm run-script deploy-staging` will deploy to the staging server at [pair-staging.meteorapp.com](pair-staging.meteorapp.com]). 

`npm run-script deploy-production` will deploy to the production server at [pairresearch.io](pairresearch.io).
