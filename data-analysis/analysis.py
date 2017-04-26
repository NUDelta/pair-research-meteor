import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

df = pd.read_json(path_or_buf="output/user_skill_graph.json", orient="records");
print df.head()
