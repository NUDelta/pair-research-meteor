import sys

import re
import json
import numpy as np
import pandas as pd

# In[2]:

def parse_phrase_for_categories(input_phrase, category_list):
    matching_categories = []
    input_phrase = input_phrase.lower()

    for category_key, keyword_list in category_list.items():
        for keyword in keyword_list:
            keyword = keyword.lower()

            if re.search(r'' + keyword, input_phrase):
                matching_categories.append(category_key)

    return list(set(matching_categories))


def get_top_in_category(category, n, skill_dataframe):
    current_df = skill_dataframe.loc[skill_dataframe['category'] == category]
    top_users_df = current_df.groupby('helperId').mean().sort_values(by='value', ascending=False)
    return top_users_df.iloc[:min(n, top_users_df.shape[0])]

def parse_phrase_for_people(phrase, n, category_list, skill_dataframe):
    people_category_dictionary = {}
    matching_categories = parse_phrase_for_categories(phrase, category_list)
    for category in matching_categories:
        top_people = get_top_in_category(category, n, skill_dataframe)
        people_category_dictionary[category] = top_people

    return people_category_dictionary

def look_up_person(userId, group):
    person_name = ""
    for person in group["members"]:
        if person["userId"] == userId:
            person_name = person["fullName"]

    print person_name



# In[3]:

df = pd.read_json(path_or_buf="assets/app/user_skill_graph.json", orient="records")
with open("assets/app/skill-words.json") as input_file:
    words = json.load(input_file)

with open("assets/app/groups.json") as input_file:
    people = json.load(input_file)

df['categories'] = df['categories'].apply(tuple)
new_rows = []
for index, row in df.iterrows():
    new_rows.extend([[row['helperId'], row['timestamp'], row['task'][0], nn, row['value']] for nn in row.categories])
expanded_df = pd.DataFrame(new_rows,columns=['helperId', 'timestamp', 'task', 'category', 'value'])

words = words['categories']

task_categories = parse_phrase_for_categories("debug our meteor app", words)

print parse_phrase_for_people(eval(sys.stdin.readlines()[0]), 5, words, expanded_df)
