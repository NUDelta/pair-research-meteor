# Calculates skill profile for a given userID
import json
from pprint import pprint

userID = "u6DrqFSvdZnWDgjz8"

with open('task-category-graph.json') as input_file:
    graph = json.load(input_file)

graph = graph['data']
# Filter for userId
user_graph = [affinity for affinity in graph if affinity["userId"] == userID]

skills = []
for affinity in user_graph:
    skills.extend(affinity["categories"])

skills = list(set(skills))

skill_rankings = {}
for skill in skills:
    skill_sum = 0  # Sum of skill values
    add_count = 0  # Used to calculate average
    for affinity in user_graph:
        if skill in affinity["categories"]:
            skill_sum += affinity["value"]
            add_count += 1
    skill_rankings[skill] = skill_sum / add_count

print skill_rankings
