import json
from pprint import pprint

affinity_history = 'pair-app-data/affinities-history.json'
task_history = 'pair-app-data/tasks-history.json'
pairing_history = 'pair-app-data/pair-history.json'
user_affinities = 'output/user_affinities.json'  # Individual user affinities

# Open the corresponding data files
with open(affinity_history) as data_file:
    affinities = json.load(data_file)
with open(task_history) as data_file:
    tasks = json.load(data_file)
with open(pairing_history) as data_file:
    pairs = json.load(data_file)

affinities = affinities["affinities-history"]
tasks = tasks["tasks-history"]
pairs = pairs["pair-history"]

# the pairing history is a collection of pairings, its users, and the timestamp
# we'll use this to find the timestamp of all the pairingIds
pairingIds = list(set([pair["pairingId"] for pair in pairs]))
pairingIdDict = {}

for pairingId in pairingIds:
    timestamp = pairingIdDict.get(pairingId, None);
    if timestamp:
        continue
    pairings_timestamps = [pairing["timestamp"]["$date"] for pairing in pairs if pairing["pairingId"] == pairingId]
    pairingIdDict[pairingId] = pairings_timestamps[0]

# Build a dictionary to convert the Data representation of the values to the UI representation
# (i.e. -1->1, 0->1, 0.33->2, ...)
value_mappings = {
    "-1": 1,
    "0": 2,
    "0.33": 3,
    "0.66": 4,
    "1": 5
}

# Build the nodes
nodes = []

for affinity in affinities:
    new_affinity = {}
    new_affinity["helperId"] = affinity["helperId"]
    new_affinity["helpeeId"] = affinity["helpeeId"]
    new_affinity["value"] = value_mappings[str(affinity["value"])]
    new_affinity["pairingId"] = affinity["pairingId"]
    new_affinity["groupId"] = affinity["groupId"]
    new_affinity["timestamp"] = pairingIdDict[affinity["pairingId"]];
    # Filter to the task field of the given affinity
    # The userId of a task item is equal to the helpeeId (the person asking for help) in a given affinity
    pairing_session_tasks = [task for task in tasks if task["pairingId"] == affinity["pairingId"]]
    new_affinity["task"] = [task["task"] for task in pairing_session_tasks if task["userId"] == affinity["helpeeId"]]

    # Current tasks don't have a field for "pairingId" set yet so we can't join them
    if new_affinity["task"]:
        nodes.append(new_affinity)
    else:
        print "Node doesn't have matching task field:"
        print new_affinity

with open(user_affinities, 'w') as outfile:
        json.dump(nodes, outfile)
