import json
import re
from pprint import pprint

with open('dtr-words.json') as input_file:
    corpus = json.load(input_file)

with open('output-data.json') as input_file:
    matching_nodes = json.load(input_file)

corpus = corpus["categories"]

for category_key in corpus:
    for keyword in corpus[category_key]:
        for node in matching_nodes:
            # Perform text search here
            # Make more efficient by using DP instead of calculating each time
            matching_string = node["task"][0].lower()
            keyword = keyword.lower()
            
            if re.search(r'' + keyword, matching_string):
                category_list = node.get("categories", [])
                category_list.append(keyword)
                node["categories"] = category_list

print matching_nodes

with open('task-category-graph.json', 'w') as outfile:
    json.dump(matching_nodes, outfile)
