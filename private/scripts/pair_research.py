from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import sys
import json
from copy import deepcopy
from mwmatching import *
from stable_roommates import create_preference_matrix
from stable_roommates import stable_matching_wrapper as sr_matching


def create_remaining_user_mapping(partial_matching):
    """
    Remaps indices of users who were not matched in a partial matching (match of -1) to 0-n values.

    Input:
        partial_matching (list): partial matching where unmatched users are matched with -1.

    Output:
        (dict): remapping of indices in partial_matching to new indices if user was unmatched.
    """
    index_remapping = {}

    counter = 0
    for index, value in enumerate(partial_matching):
        if value == -1:
            index_remapping[str(index)] = counter
            counter += 1

    return index_remapping


def remove_paired_users(graph, user_remapping):
    """
    Takes an undirected graph and removes any users who are already matched.

    Input:
        graph (list of tuples): each tuple represents an edge
            ex. (0, 1, 93) means an edge from 0 to 1 with a weight of 93.
        user_remapping (dict): dict of users and their remapping. If users are in user_remapping, they should be kept.

    Output:
        (list of tuples): graph where only edges for users without matching are present.
    """
    output_graph = deepcopy(graph)

    for edge_index in range(len(output_graph)):
        # check if both from and to persons are in user_remapping. if not, remove.
        from_person = output_graph[edge_index][0]
        to_person = output_graph[edge_index][1]

        if not (str(from_person) in user_remapping and str(to_person) in user_remapping):
            output_graph[edge_index][2] = None

    # remove any edges with None weight
    output_graph = [x for x in output_graph if x[2] is not None]

    return output_graph


def remap_remaining_users(graph, user_remapping):
    """
    Remaps indices from undirected graph to new user remapping as follows:
        graph: [[1, 4, 10], [3, 4, 9], [15, 10, 1]]
        user_remapping: {'1': 0, '3': 1, '4': 2, '9': 3, '10': 4, '15': 5}
        output: [[0, 2, 10], [1, 2, 9], [5, 4, 1]]

    Input:
        graph (list of tuples): each tuple represents an edge
            ex. (0, 1, 93) means an edge from 0 to 1 with a weight of 93.
        user_remapping (dict): dict of users and their remapping. If users are in user_remapping, they should be kept.

    Output:
        (list): graph with remapped edges, as shown above.
    """
    # dont modify original graph
    output_graph = deepcopy(graph)

    # loop though each edge and relabel edges
    for edge_index in range(len(output_graph)):
        output_graph[edge_index][0] = user_remapping[str(output_graph[edge_index][0])]
        output_graph[edge_index][1] = user_remapping[str(output_graph[edge_index][1])]

    return output_graph


def combine_matchings(partial_stable_matching, partial_mwm_matching, user_remapping):
    """
    Combines results from partial stable matching and mwm run on unstable users.

    Input:
        partial_stable_matching (list of numbers): matching from stable matching, with -1 = no match
        partial_mwm_matching (list of numbers): matching from MWM run on unmatched users, with -1 = no match
        user_remapping (dict): mapping from original user index to new MWM index
    """
    # reverse mapping so MWM results can be matched back to stable output
    reversed_user_mapping = {str(v): int(k) for k, v in user_remapping.items()}

    # create and fill output
    output_matching = deepcopy(partial_stable_matching)

    for index, value in enumerate(partial_mwm_matching):
        target_index = reversed_user_mapping[str(index)]
        target_value = -1

        # check if user still unmatched under mwm
        if value != -1:
            target_value = reversed_user_mapping[str(value)]

        output_matching[target_index] = target_value

    return output_matching


def verify_matching(matching):
    """
    Verifies if a matching is valid.
        Matching may only have an unmatched person if its odd.
        indexof(a) == matching[a] for all a in matching.
        If even, all values in matching are present (len(matching) = n, matching should contain 0 to n-1).

    Input:
        matching (list of numbers): matching where number corresponds to index.

    Output:
        (boolean): whether matching is valid.
    """
    # check for values and uniqueness
    matching_length = len(matching)
    matching_value_set = set(matching)

    # check if even length matching has a -1
    if matching_length % 2 == 0 and -1 in matching_value_set:
        return False

    # check if indexof(a) == matching[a]
    for index_a, value_a in enumerate(matching):
        if value_a != -1 and index_a != matching[value_a]:
            return False

    # check if all values are present
    if matching_length % 2 == 0:
        target_values_set = set([x for x in range(matching_length)])
        if matching_value_set != target_values_set:
            return False
    else:
        if len(matching_value_set) != matching_length:
            return False

    return True


def create_matching_output(graphs, handle_odd_method='remove', remove_all=True, debug=False):
    """
    Given a weighted directed and undirected graph, compute a matching.
        First, attempt to make a fully stable matching. If that fails, take the partially stable matching and combine
        results with maximum weighted matching (MWM) to form the full matching.

    Input:
        graphs (dict of lists): dict containing two keys, 'directed_graph' and 'undirected_graph', whose values are
            a directed graph used for Stable Roommates Matching and an undirected graph used for MWM.
        handle_odd_method (string): handling odd cases by either adding ('add') or removing ('remove') user
        remove_all (boolean): whether to try again if randomly removing a person fails

    Output:
        (dict): dict containing the following keys:
            matching: computed matching
            fully_stable: whether matching was fully stable from Stable Roommates
            stable_debug: debug output from stable roommates matching
            stable_result: result from stable roommmates matching (could be partially or fully stable)
            mwm_result_original: mwm run on full directed graph
            mwm_result_processed: mwm run on unstable portion of matching. [] if matching was fully stable.
    """
    # compute a stable roommates matching
    preference_matrix = create_preference_matrix(graphs['directed_graph'])
    stable_result, is_fully_stable, stable_debug = sr_matching(preference_matrix,
                                                               handle_odd_method=handle_odd_method,
                                                               remove_all=remove_all)

    # prepare output dict
    output_dict = {
        'matching': stable_result,
        'fully_stable': is_fully_stable,
        'stable_debug': stable_debug,
        'stable_result': stable_result,
        'mwm_result_full': maxWeightMatching(graphs['undirected_graph']),
        'mwm_result_partial': [],
        'mwm_remap_dict': {}
    }

    # if not fully stable, adjust the undirected graph and run MWM
    if not is_fully_stable:
        # create user remapping
        remaining_user_mapping = create_remaining_user_mapping(stable_result)

        # remove paired users from undirected graph
        unpaired_undirected_graph = remove_paired_users(graphs['undirected_graph'], remaining_user_mapping)

        # remap users before running mwm
        remapped_undirected_graph = remap_remaining_users(unpaired_undirected_graph, remaining_user_mapping)

        # get mwm result with remapped graph
        mwm_result = maxWeightMatching(remapped_undirected_graph)

        # combine results from stable roommates and mwm
        output_matching = combine_matchings(stable_result, mwm_result, remaining_user_mapping)

        # add to output dict if output_matching is correct, otherwise replace with mwm
        output_dict['matching'] = output_matching
        output_dict['mwm_result_partial'] = mwm_result
        output_dict['mwm_remap_dict'] = remaining_user_mapping

        if not verify_matching(output_matching) and debug:
            print('Combined matching not valid. {}'.format(output_matching))

    return output_dict


if __name__ == "__main__":
    # get input from pair research meteor app
    input_pair_research = eval(sys.stdin.readlines()[0])

    # create matching output
    output = create_matching_output(input_pair_research, handle_odd_method='remove', remove_all=True, debug=False)

    # print data out so meteor app can retrieve it
    print(json.dumps(output))