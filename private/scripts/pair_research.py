from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import sys
import json
from mwmatching import *
from stable_roommates import create_preference_matrix
from stable_roommates import stable_matching_wrapper as sr_matching

# get input from pair research meteor app
input_pair_research = eval(sys.stdin.readlines()[0])

# run both stable matching and mwm matching
stable_result = sr_matching(create_preference_matrix(input_pair_research['directed_graph']),
                            handle_odd_method='remove', remove_all=True)
mwm_result = maxWeightMatching(input_pair_research['undirected_graph'])

# print output
output_dict = {
    'stable_matching': stable_result[0] if stable_result[0] is not None else [],
    'stable_debug': stable_result[1],
    'mwm_matching': mwm_result
}

print(json.dumps(output_dict))
