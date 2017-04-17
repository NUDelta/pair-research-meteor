import json
from pprint import pprint

# Open the corresponding data files
with open('affinities-history.json') as data_file:
    affinities = json.load(data_file)
with open('tasks-history.json') as data_file:
    tasks = json.load(data_file)

nodes = []

# Hardcoded pairingID of the one Pair Research session we're looking at
pairingId = "twHrFxA7GTQa7ibQv"

# Filter to the pairing sesison we want

affinities = affinities["affinities-history"]
affinities = [affinity for affinity in affinities if affinity["pairingId"] == pairingId]

# Filter to the tasks corresponding to the correct pairingId
tasks = tasks["tasks"]
tasks = [task for task in tasks if task["pairingId"] == pairingId]

# Build the nodes
for affinity in affinities:
    new_affinity = {}
    new_affinity["userId"] = affinity["helperId"]
    new_affinity["value"] = affinity["value"]
    # Filter to the task field of the given affinity
    # (This won't work when looking at a set of affinities outside of a single pairing session, make sure to change this when expanding)
    # The userId of a task item is equal to the helpeeId (the person asking for help) in a given affinity
    new_affinity["task"] = [task["task"] for task in tasks if task["userId"] == affinity["helpeeId"]]
    nodes.append(new_affinity)

with open('output-data.json', 'w') as outfile:
        json.dump(nodes, outfile)
