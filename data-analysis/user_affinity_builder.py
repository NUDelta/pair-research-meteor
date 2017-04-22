import json
from pprint import pprint

affinity_history = 'pair-app-data/affinities-history.json'
task_history = 'pair-app-data/tasks-history.json'
user_affinities = 'output/user_affinities.json'  # Individual user affinities


# Open the corresponding data files
with open(affinity_history) as data_file:
    affinities = json.load(data_file)
with open(task_history) as data_file:
    tasks = json.load(data_file)

nodes = []

affinities = affinities["affinities-history"]

# Filter to the tasks corresponding to the correct pairingId
tasks = tasks["tasks"]

# Build the nodes
for affinity in affinities:
    new_affinity = {}
    new_affinity["userId"] = affinity["helperId"]
    new_affinity["value"] = affinity["value"]
    # Filter to the task field of the given affinity
    # (This won't work when looking at a set of affinities outside of a single pairing session, make sure to change this when expanding)
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
