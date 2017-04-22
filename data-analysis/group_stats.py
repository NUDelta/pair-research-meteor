# Calculates skill profile for a given userID
import json
from pprint import pprint

def calculate_skill_profile(affinity_graph, userId):
    skills = []
    user_graph = [affinity for affinity in affinity_graph if affinity["userId"] == userId]

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

    user_and_skills = {}
    user_and_skills["userId"] = userId
    user_and_skills["skills"] = skill_rankings
    return user_and_skills



# ----------- Begin script -----------
with open('task-category-graph.json') as input_file:
    graph = json.load(input_file)

graph = graph['data']

group_ids = [affinity["userId"] for affinity in graph]
group_ids = list(set(group_ids));

group_skills = []

for userId in group_ids:
    group_skills.append(calculate_skill_profile(graph, userId))


group_profile = {}

for user in group_skills:
    for skill, skill_value in user["skills"].items():
        skill_rating = group_profile.get(skill, 0);
        skill_rating += skill_value
        group_profile[skill] = skill_rating

print group_profile
