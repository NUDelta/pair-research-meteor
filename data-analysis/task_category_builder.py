import json
import re
from pprint import pprint

# Filenames
dtr_words = 'pair-app-data/skill-words.json'  # Skill category words
user_affinities = 'output/user_affinities.json'  # Individual user affinities
user_skill_graph = 'output/user_skill_graph-TEST.json'    # Final skill graph

with open(dtr_words) as input_file:
    corpus = json.load(input_file)
with open(user_affinities) as input_file:
    matching_nodes = json.load(input_file)

corpus = corpus["categories"]

for category_key in corpus:  # category_key = "ui/ux design"
    for keyword in corpus[category_key]:  # keyword = "ui", "ux", ...
        for node in matching_nodes:
            # Perform text search here
            # Make more efficient by using DP instead of calculating each time
            matching_string = node["task"][0].lower()
            keyword = keyword.lower()

            # The list of categories associated with a given help request
            category_list = node.get("categories", [])

            if re.search(r'' + keyword, matching_string):
                category_list.append(category_key)

            node["categories"] = list(set(category_list))  # Remove duplicates

json_output = matching_nodes

with open(user_skill_graph, 'w') as outfile:
    json.dump(json_output, outfile)
