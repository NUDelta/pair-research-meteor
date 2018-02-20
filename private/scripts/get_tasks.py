
# coding: utf-8

# # Pair Research (research)

# First we start with importing required libraries.

# In[56]:

import sys
import json

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

def get_tasks_from_date(date, task_df):
    timestamp = pd.to_datetime(date)
    return task_df[task_df['timestamp'] == timestamp]

def get_task_scores(filtered_task_df):
    return filtered_task_df.groupby(['task']).mean().to_dict(orient='index')

def get_task_scores_from_date(date, task_df):
    curr_tasks = get_tasks_from_date(date, task_df)
    return get_task_scores(curr_tasks)


# Now we can import the file we want to explore. In this case the filename is "user_skill_graph.json"

# In[57]:

df = pd.read_json(path_or_buf="assets/app/user_skill_graph.json", orient="records");
df['categories'] = df['categories'].apply(tuple)
df['task'] = df['task'].apply(lambda x: x[0])
timestamp = eval(sys.stdin.readlines()[0])
tasks = get_task_scores_from_date(timestamp, df)

print json.dumps(tasks)
