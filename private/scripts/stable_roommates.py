"""
Stable Roommate Matching

Implementation of Robert Irving's Stable Roommates Algorithm.
http://www.dcs.gla.ac.uk/~pat/jchoco/roommates/papers/Comp_sdarticle.pdf
"""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import random
import unittest
from copy import deepcopy


def stable_matching_wrapper(preferences, handle_odd_method='remove', remove_all=True, debug=False):
    """
    Formats input and runs stable roommates algorithm, returning a stable matching if one exists.

    Input:
        preferences (matrix, list of lists of numbers): n-by-m preference matrix containing preferences for each person.
            m = n - 1, so each person has rated all other people.
            Each row is a 1-indexed ordered ranking of others in the pool.
            Therefore max(preferences[person]) <= number people and min(preferences[person]) = 1.
        handle_odd_method (string): how to handle odd case, either by adding ('add') or removing ('remove') a user
        remove_all (boolean): whether to try and remove other users if first removal doesn't give a stable matching.
        debug (boolean): including print statements

    Return:
        (list): stable or partially stable matching, if exists. Otherwise, None.
            If a matching exists, -1 for a person indicates no partner.
            ex: [2, 1, -1] (Person 0 matched with 2, 1 matched with 0, 2 not matched)
        (boolean): whether matching is fully stable
        (string): debug result for when matching succeeded/failed
    """
    # validate input
    is_valid, valid_preferences = validate_input(preferences, debug=debug)

    if not is_valid:
        if debug:
            print('Invalid input. Must be n-by-m (where m = n - 1) list of lists of numbers.')
        return None, False, 'Invalid input. Must be n-by-m (where m = n - 1) list of lists of numbers.'

    # handle odd and attempt matching
    output = None
    if handle_odd_method == 'add':
        # handle cases where odd number of people
        odd_handled_preferences, is_odd, person_added, person_manipulated = handle_odd_users(valid_preferences,
                                                                                             method='add',
                                                                                             debug=debug)

        # create a preference lookup table
        # person_number : [list of preferences]
        preferences_dict = {
            str(x + 1): [str(y) for y in odd_handled_preferences[x]] for x in range(len(odd_handled_preferences))
        }

        # create a dict of dicts holding index of each person ranked
        # person number : {person : rank_index}
        ranks = {index: dict(zip(value, range(len(value)))) for (index, value) in preferences_dict.items()}

        # run stable matching once with added user and return
        output = stable_matching(preferences_dict, ranks, is_odd, person_added, person_manipulated, debug=debug)
    elif handle_odd_method == 'remove':
        # randomly pick a user to remove
        randomized_users = [x for x in range(len(valid_preferences))]
        random.seed(42)
        random.shuffle(randomized_users)

        # if remove_all, randomly try to remove one user at a time and see if a stable matching can be found.
        # else, only remove one and attempt to find a matching
        if not remove_all:
            randomized_users = [randomized_users[0]]

        for i in randomized_users:
            odd_handled_preferences, is_odd, person_added, person_manipulated = handle_odd_users(valid_preferences,
                                                                                                 method='remove',
                                                                                                 person_to_remove=i,
                                                                                                 debug=debug)

            # create a preference lookup table
            # person_number : [list of preferences]
            preferences_dict = {}
            index = 0

            for current_person in range(1, len(valid_preferences) + 1):
                # add user to preference_dict if they have not been removed
                if current_person != person_manipulated:
                    preferences_dict[str(current_person)] = [str(y) for y in odd_handled_preferences[index]]
                    index += 1

            # create a dict of dicts holding index of each person ranked
            # person number : {person : rank_index }
            ranks = {index: dict(zip(value, range(len(value)))) for (index, value) in preferences_dict.items()}

            if debug:
                print('Preference Dict: {}'.format(preferences_dict))
                print('Ranks Dict: {}'.format(ranks))

            # run stable matching once with added user
            output = stable_matching(preferences_dict, ranks, is_odd,
                                     person_added, person_manipulated, debug=debug)

            # return output if matching is fully stable or if no stable matching and even number of users
            if output[1] or (not output[1] and not is_odd):
                return output
    else:
        if debug:
            print('Invalid input. handle_odd_method must either be \'add\' or \'remove\'')
        return None, False, 'Invalid input. handle_odd_method must either be \'add\' or \'remove\''

    # return last results if remove all fails to find a matching
    # TODO: if using remove all, return the matching with the highest stable cardinality
    return output


def stable_matching(preferences_dict, ranks, is_odd, person_added, person_manipulated, debug=False):
    """
    Given valid preference and ranking dictionaries, with odd cases handled, attempts to find a stable matching.

    Input:
        preferences_dict (dict of lists): dictionary of
        debug (boolean): including print statements
        is_odd (boolean): whether input was odd
        person_added (boolean): whether odd is handled by adding a n + 1 person
        person_manipulated (

    Return:
        (list): stable or partially stable matching, if exists. Otherwise, None.
            If a matching exists, -1 for a person indicates no partner.
            ex: [2, 1, -1] (Person 0 matched with 2, 1 matched with 0, 2 not matched)
        (boolean): whether matching is fully stable
        (string): debug result for when matching succeeded/failed
    """
    # phase 1: initial proposal
    p1_holds = phase_1(preferences_dict, ranks)

    # if anyone does not have a hold, stable matching is not possible
    for hold in p1_holds:
        if p1_holds[hold] is None:
            if debug:
                print('Stable matching is not possible. Failed at Phase 1: not everyone was proposed to.')
                print(p1_holds)

            # compute partial matching
            if is_odd:
                p1_holds = undo_odd_handling(p1_holds, person_added, person_manipulated)

            p1_holds_partial_matching = compute_partially_stable_matching(p1_holds, ranks, debug)

            return format_output(p1_holds_partial_matching), False, \
                'Failed at Phase 1: not everyone was proposed to.'

    # phase 1: reduction
    p1_reduced_preferences = phase_1_reduce(preferences_dict, ranks, p1_holds)

    # phase 1: stable match halting condition
    # if p1_reduced_preferences has only one preference per person, matching should be stable (lemma 2)
    p1_halt = True
    for person in p1_reduced_preferences:
        if len(p1_reduced_preferences[person]) > 1:
            p1_halt = False
            break

    if p1_halt:
        # verification before returning
        if verify_matching(p1_holds):
            if verify_stability(p1_holds, ranks):
                if debug:
                    print('Stable matching found. Returning person : partner dictionary.')

                # handle odd cases where person may have been added or removed
                if is_odd:
                    p1_holds = undo_odd_handling(p1_holds, person_added, person_manipulated)

                if debug:
                    print(p1_holds)

                return format_output(p1_holds), True, 'Stable matching found after Phase 1.'
            else:
                if debug:
                    print('Stable matching is not possible. Failed at Verification: matching computed, but not stable.')
                    print(p1_holds)

                # compute partial matching
                if is_odd:
                    p1_holds = undo_odd_handling(p1_holds, person_added, person_manipulated)

                p1_holds_partial_matching = compute_partially_stable_matching(p1_holds, ranks, debug)

                return format_output(p1_holds_partial_matching), False, \
                    'Failed at Verification after Phase 1: matching computed, but not stable.'
        else:
            if debug:
                print('Stable matching is not possible. Failed at Verification: matching computed, but not valid.')
                print(p1_holds)

            # compute partial matching
            if is_odd:
                p1_holds = undo_odd_handling(p1_holds, person_added, person_manipulated)

            p1_holds_partial_matching = compute_partially_stable_matching(p1_holds, ranks, debug)

            return format_output(p1_holds_partial_matching), False, \
                'Failed at Verification after Phase 1: matching computed, but not valid.'

    # phase 2: find an all-or-nothing cycle
    cycle = find_all_or_nothing_cycle(p1_reduced_preferences)

    # if cycle with more than size 3 does not exist, no stable matching exists
    if cycle is None:
        if debug:
            print('Stable matching is not possible. Failed at Phase 2: could not find an all-or-nothing cycle.')

        # compute partial matching
        if is_odd:
            p1_holds = undo_odd_handling(p1_holds, person_added, person_manipulated)

        p1_holds_partial_matching = compute_partially_stable_matching(p1_holds, ranks, debug)

        return format_output(p1_holds_partial_matching), False, \
            'Failed at Phase 2: could not find an all-or-nothing cycle.'
    elif cycle is not None and len(cycle) == 3:
        if debug:
            print('Stable matching is not possible. Failed at Phase 2: could not find an all-or-nothing cycle len > 3.')
            print(p1_holds)
            print(p1_reduced_preferences)

        # compute partial matching
        if is_odd:
            p1_holds = undo_odd_handling(p1_holds, person_added, person_manipulated)

        p1_holds_partial_matching = compute_partially_stable_matching(p1_holds, ranks, debug)

        return format_output(p1_holds_partial_matching), False, \
            'Failed at Phase 2: could not find an all-or-nothing cycle len > 3.'

    # phase 2: reduction
    final_holds = phase_2_reduce(p1_reduced_preferences, ranks, cycle)

    # check if holds are not empty
    if final_holds is not None:
        # verification
        if verify_matching(final_holds):
            if verify_stability(final_holds, ranks):
                if debug:
                    print('Stable matching found. Returning person : partner dictionary.')

                # handle odd cases where person may have been added or removed
                if is_odd:
                    final_holds = undo_odd_handling(final_holds, person_added, person_manipulated)

                if debug:
                    print(final_holds)

                return format_output(final_holds), True, 'Stable matching found after Phase 2.'
            else:
                if debug:
                    print('Stable matching is not possible. Failed at Verification: matching computed, but not stable.')
                    print(final_holds)

                # compute partial matching
                if is_odd:
                    final_holds = undo_odd_handling(final_holds, person_added, person_manipulated)

                final_holds_partial_matching = compute_partially_stable_matching(final_holds, ranks, debug)

                return format_output(final_holds_partial_matching), False, \
                    'Failed at Verification after Phase 2: matching computed, but not stable.'
        else:
            if debug:
                print('Stable matching is not possible. Failed at Verification: matching computed, but not valid.')
                print(final_holds)

            # compute partial matching
            if is_odd:
                final_holds = undo_odd_handling(final_holds, person_added, person_manipulated)

            final_holds_partial_matching = compute_partially_stable_matching(final_holds, ranks, debug)

            return format_output(final_holds_partial_matching), False, \
                'Failed at Verification after Phase 2: matching computed, but not valid.'
    else:
        if debug:
            print('Stable matching is not possible. Failed at Phase 2 reduction.')

        # compute partial matching
        if is_odd:
            final_holds = undo_odd_handling(final_holds, person_added, person_manipulated)

        final_holds_partial_matching = compute_partially_stable_matching(final_holds, ranks, debug)

        return format_output(final_holds_partial_matching), False, \
            'Failed at Phase 2 reduction.'


def phase_1(preferences, ranks, curr_holds=None):
    """
    Performs first phase of matching by doing round robin proposals until stopping condition (i) or (ii) is met:
         (i) each person is holding a proposal
        (ii) one person is rejected by everyone

    Input:
        preferences (dict of list of strings): dict of ordered preference lists {person : [ordered list]}
        ranks (dict of dict of ranking index): dict of persons with dicts indicating rank of each other person
        curr_holds (dict, optional): dict of persons with current holds

    Return:
        (dict): holds after condition (i) or (ii) is met.
    """
    people = list(preferences.keys())

    # placeholder for holds
    holds = {person: None for person in people}

    # during phase 1, no holds exist. initialize curr_holds to 0 (all people are > 0)
    if curr_holds is None:
        curr_holds = {person: 0 for person in people}

    # track people who are already proposed to
    proposed_set = set()

    # begin proposing
    for person in people:
        proposer = person

        # proposal step
        while True:
            # find proposer someone to propose to, in order of proposer's preference list
            while curr_holds[proposer] < len(preferences[proposer]):
                # find proposee given proposer's preferences
                proposee = preferences[proposer][curr_holds[proposer]]
                curr_holds[proposer] += 1

                # find who proposee is holding, if any
                proposee_hold = holds[proposee]

                # stop searching if proposee doesn't hold anyone or ranks proposer higher than curr hold
                if proposee_hold is None or ranks[proposee][proposer] < ranks[proposee][proposee_hold]:
                    # proposee holds proposer's choice
                    holds[proposee] = proposer
                    break

            # check if proposee has already been proposed to
            if proposee not in proposed_set:
                # successful proposal
                proposed_set.add(proposee)
                break

            # if all preferences are exhausted and proposee does not have anyone, stop
            if curr_holds[proposer] >= len(preferences[proposer]):
                break

            # if proposee is proposed to, reject proposee_hold and continue proposal with them
            proposer = proposee_hold

    # final holds from phase 1
    return holds


def phase_1_reduce(preferences, ranks, holds):
    """
    Performs a reduction on preferences based on phase 1 proposals, and the following:
        Preference list for y who holds proposal x can be reduced by deleting
             (i) all those to whom y prefers x
            (ii) all those who hold a proposal from a person they prefer to y

    Input:
        preferences (dict of list of strings): dict of ordered preference lists {person : [ordered list]}
        ranks (dict of dict of ranking index): dict of persons with dicts indicating rank of each other person
        holds (dict): dict of persons with current holds

    Return:
        (dict of list of strings): reduced preference list such that:
            (iii) y is the first on x's list and last on y's
             (iv) b appears on a's list iff a appears on b's
    """
    # create output preferences
    reduced_preferences = deepcopy(preferences)

    # loop though each hold
    for proposee in holds:
        proposer = holds[proposee]

        # loop though all of person's preferences
        i = 0
        while i < len(reduced_preferences[proposee]):
            # fetch proposee's preferences
            curr_proposee_preference = reduced_preferences[proposee][i]

            # proposee should only hold preferences equal and higher to proposer (i)
            if curr_proposee_preference == proposer:
                reduced_preferences[proposee] = reduced_preferences[proposee][:(i + 1)]
            # delete all people who hold a proposal from someone they prefer to the proposee (ii)
            elif ranks[curr_proposee_preference][holds[curr_proposee_preference]] < \
                    ranks[curr_proposee_preference][proposee]:
                reduced_preferences[proposee].pop(i)
                continue

            # continue to preference list
            i += 1

    return reduced_preferences


def find_all_or_nothing_cycle(preferences):
    """
    Finds an all-or-nothing cycle in reduced preferences, if exists.

    Input:
        preferences (dict of list of strings): dict of ordered preference lists {person : [ordered list]}

    Return:
        (list): cycle of persons
    """
    # start with two individuals, p and q
    p = []
    q = []

    # find a person with > 1 preference left
    curr = None
    for person in preferences:
        if len(preferences[person]) > 1:
            curr = person
            break

    # if no person can be found, no cycle exists
    if curr is None:
        return None

    # create cycle
    while curr not in p:
        # q_i = second person in p_i's list
        q += [preferences[curr][1]]

        # p_{i + 1} = q_i's last person
        p += [curr]
        curr = preferences[q[-1]][-1]

    cycle = p[p.index(curr):]

    return cycle


def phase_2_reduce(preferences, ranks, cycle):
    """
    Performs a reduction on found all-or-nothing cycles.

    Input:
        preferences (dict of list of strings): dict of ordered preference lists {person : [ordered list]}
        ranks (dict of dict of ranking index): dict of persons with dicts indicating rank of each other person
        cycle (list): all-or-nothing cycle

    Return:
        (dict): holds after sequential reductions, or None if no matching can be found.
    """
    # continue while a cycle exists
    curr_cycle = deepcopy(cycle)
    curr_holds = None
    p2_preferences = deepcopy(preferences)

    while curr_cycle is not None:
        curr_preferences = {}

        for person in preferences:
            if person in curr_cycle:
                curr_preferences[person] = 1
            else:
                curr_preferences[person] = 0

        curr_holds = phase_1(p2_preferences, ranks, curr_preferences)
        p2_preferences = phase_1_reduce(p2_preferences, ranks, curr_holds)

        curr_cycle = find_all_or_nothing_cycle(p2_preferences)

    return curr_holds


def validate_input(preference_matrix, debug=False):
    """
    Makes sure a preference matrix is n-by-m and m = n - 1.
        If each isn't full, fill the list with the remaining people.

    Input:
        preferences (matrix, list of lists of numbers): n-by-m preference matrix containing preferences for each person.
            m = n - 1, so each person has rated all other people.
            Each row is a 1-indexed ordered ranking of others in the pool.
            Therefore max(preferences[person]) <= number people and min(preferences[person]) = 1.
        debug (boolean): including print statements

    Return:
        (boolean): if matrix is valid
        (matrix, list of lists numbers): filled and validated preference list
    """
    output_matrix = deepcopy(preference_matrix)

    n = len(output_matrix)
    m = n - 1

    matrix_iterator = range(n)

    # validate list of lists of numbers
    if type(output_matrix) is not list:
        if debug:
            print('Input validation failed: preference_matrix is not a list.')
        return False, None

    # validate size
    if n <= 1:  # empty matrix or only 1 person (no point in matching)
        if debug:
            print('Input validation failed: preference_matrix must have size > 1')
        return False, None

    # validate content of matrix
    for i in matrix_iterator:
        sublist = output_matrix[i]

        #  each sublist is a list
        if type(sublist) is not list:
            if debug:
                print('Input validation failed: each list in preference_list should be a list.')
            return False, None

        # each preference list can only be of length m
        if len(sublist) > m:
            if debug:
                print('Input validation failed: each list in preference_list cannot have length greater than m.')
            return False, None

        # each value is an int
        for j in sublist:
            if type(j) is not int:
                if debug:
                    print('Input validation failed: all values should be integers')
                return False, None

            # number should be between 1 and n and should be the person index
            if j < 1 or j > n or j == (i + 1):
                if debug:
                    print('Input validation failed: each value in each row should be between \
                          1 and n (number of people) and cannot be the person themselves')
                return False, None

    # fill any rows that are not of length m
    full_set = set(range(1, n + 1))
    for i in matrix_iterator:
        if len(output_matrix[i]) != m:
            to_add = full_set - set(output_matrix[i]) - {i + 1}
            output_matrix[i] += list(to_add)

    # returns is_valid (list of list of numbers), person_added (if n is odd), output_matrix (filled preference_matrix)
    if debug:
        print('Input validation passed.')
    return True, output_matrix


def handle_odd_users(preference_matrix, method='remove', person_to_remove=None, debug=False):
    """
    Handles matching instances where there are an odd number of people by either adding or removing a person.

    Inputs:
        preference_matrix (matrix, list of lists of numbers): n-by-m matrix containing preferences for each person.
            m = n - 1, so each person has rated all other people.
            Each row is a 1-indexed ordered ranking of others in the pool.
            Therefore max(preferences[person]) <= number people and min(preferences[person]) = 1.
        method (string): method to handle odd case, either 'add' or 'remove'.
        person_to_remove (number): if method 'remove' is specified, choose who to remove.
            Number corresponds to 0-indexed array element in the preference_matrix
        debug (boolean): including print statements

    Return:
        (matrix, list of lists numbers): manipulated preference matrix ready for matching
        (boolean): whether matrix was odd
        (boolean): whether person was added
        (number): index of person who was manipulated in preference matrix, either added or removed, as 1-indexed number
    """
    output_matrix = deepcopy(preference_matrix)

    n = len(output_matrix)

    matrix_iterator = range(n)

    # check if odd case must be handled
    is_odd = False
    person_added = False
    person_manipulated = None

    if n % 2 != 0:
        is_odd = True

        # handle based on odd-handling method
        if method == 'add':
            person_added = True
            output_matrix += [range(1, n + 1)]

            # add new person to end of everyone's preference list
            for i in matrix_iterator:
                output_matrix[i] += [n + 1]
        elif method == 'remove':
            if person_to_remove is None:
                if debug:
                    print('Error: method remove specified, but not given a person to remove.')
                return False, None

            # preferences are 1-indexed so increment person_to_remove
            person_to_remove_one_indexed = person_to_remove + 1

            if debug:
                print('Removing person {} (matrix index), {} (dict index)'.format(person_to_remove,
                                                                                  person_to_remove + 1))

            # remove person_to_remove from everyone else's preferences
            for i in matrix_iterator:
                if person_to_remove_one_indexed in output_matrix[i]:
                    output_matrix[i].remove(person_to_remove_one_indexed)

            # remove all preferences for person_to_remove
            del output_matrix[person_to_remove]

            # set variables
            person_added = False
            person_manipulated = person_to_remove + 1

    return output_matrix, is_odd, person_added, person_manipulated


def undo_odd_handling(holds, person_added, person_manipulated):
    """
    Helper function to undo the effects of adding/removing a person when handing an odd number of users.

    Input:
        holds (dict): dict containing person:matching pairs.
        person_added (boolean): whether person was added to handle odd case.
        person_manipulated (string): person who was removed if person_added is False

    Return:
        (dict): holds with target person either removed or added back with -1 hold
    """
    current_holds = deepcopy(holds)

    # person added: delete added person (n + 1) and set their match to -1
    if person_added:
        person_str = str(len(current_holds))
        person_added_match = current_holds[person_str]

        del current_holds[person_str]
        current_holds[person_added_match] = '-1'
    # person removed: add person with -1 as hold value
    elif person_manipulated is not None:
        person_str = str(person_manipulated)
        current_holds[person_str] = '-1'

    return current_holds


def verify_matching(matching):
    """
    Checks if a matching is valid.
        Valid matchings have all people matched to one and only one person.

    Input:
        matching (dict): dict containing person:matching pairs

    Return:
        (boolean)): matching is valid
    """
    # validate matching
    person_set = {person for person in matching.keys()}
    matching_set = {match for match in matching.values()}

    # equal cardinality and content
    if person_set != matching_set:
        return False

    # check for a:b, then b:a
    for person in matching:
        if person != matching[matching[person]]:
            return False

    # matching is valid
    return True


def verify_stability(matching, ranks):
    """
    Checks if a valid matching (all people matched to one and only one person) is stable.
        Stable iff no two unmatched members both prefer each other to their current partners in the matching.

    Input:
        matching (dict): dict containing person:matching pairs
        ranks (dict of dict of ranking index): dict of persons with dicts indicating rank of each other person

    Output:
        (boolean): matching is stable
    """
    for x in matching:
        for y in matching:
            # ignore if x, y are the same or x, y are matched
            if x == y or y == matching[x]:
                continue

            # get partner under matching for x, y and corresponding ranks of matched partners
            x_partner = matching[x]
            y_partner = matching[y]

            x_partner_rank = ranks[x][x_partner]
            y_partner_rank = ranks[y][y_partner]

            # get ranking of x -> y, y -> x
            x_y_rank = ranks[x][y]
            y_x_rank = ranks[y][x]

            # if x prefers y to current partner AND y prefers x to current partner, unstable
            # prefer = lower ranking index since ranking is highest -> lowest preference
            if x_y_rank < x_partner_rank and y_x_rank < y_partner_rank:
                return False

    return True


def compute_partially_stable_matching(matching, ranks, debug=False):
    """
    Given an incomplete matching, checks and returns a partially stable matching with members who are stably matched.

    Input:
        matching (dict): dict containing person:matching pairs. matching need not be stable.
        ranks (dict of dict of ranking index): dict of persons with dicts indicating rank of each other person
        debug (boolean): including print statements

    Output:
        (dict): partially stable matching, where some are stably matched, with '-1' indicating no partner for a person
    """
    partial_matching = deepcopy(matching)

    # validate matching by checking if both people are matched with each other
    for x in partial_matching:
        x_partner = partial_matching[x]

        # only check if a partner exists or not -1 already
        if x_partner is None or x_partner == '-1':
            partial_matching[x] = '-1'
            continue

        # unmatch x and x's partner if they are not the same
        y_partner = partial_matching[x_partner]
        if y_partner != x:
            partial_matching[x] = '-1'
            partial_matching[x_partner] = '-1'

    # remove all unpaired users
    partially_stable_matching = {key: value for (key, value) in partial_matching.items() if value != '-1'}

    # check which matchings are stable
    for x in ranks:
        # check if person x is in the partial matching
        if x not in partially_stable_matching or partially_stable_matching[x] == '-1':
            continue

        for y in ranks:
            # check if person y in in the partial matching
            if y not in partially_stable_matching or partially_stable_matching[y] == '-1':
                continue

            # ignore if x, y are the same or x, y are matched
            if x == y or y == partially_stable_matching[x]:
                continue

            # get partner under matching for x, y and corresponding ranks of matched partners
            x_partner = partially_stable_matching[x]
            y_partner = partially_stable_matching[y]

            x_partner_rank = ranks[x][x_partner]
            y_partner_rank = ranks[y][y_partner]

            # get ranking of x -> y, y -> x
            x_y_rank = ranks[x][y]
            y_x_rank = ranks[y][x]

            # if x prefers y to x's current partner AND y prefers x to y's current partner, unstable
            # prefer = lower ranking index since ranking is highest at lowest index
            # if not stable, assign x, y to -1
            if x_y_rank < x_partner_rank and y_x_rank < y_partner_rank:
                if debug:
                    print('{} and {} are unstably matched ({} and {} prefer each other more). Removing pairing.'.
                          format(x, x_partner, x, y))

                # remove unstable matching and break out of loop since x is now unmatched
                partially_stable_matching[x] = '-1'
                partially_stable_matching[x_partner] = '-1'
                break

    # format output and return
    partial_matching_output = {}
    for key, value in partial_matching.items():
        if key in partially_stable_matching:
            partial_matching_output[key] = partially_stable_matching[key]
        else:
            partial_matching_output[key] = '-1'

    return partial_matching_output


def format_output(matching):
    """
    Formats output into list with 0-indexed mapping.
        ex: [1, 0, -1] (Person 0 matched with 1, 1 matched with 0, 2 not matched)

    Input:
        matching (dict): dict of persons who they are matched to (-1 if unmatched)

    Return:
        (list): formatted stable matching, with 0-indexed numbers
            If a matching exists, -1 for a person indicates no partner.
    """
    n = len(matching)
    output = [0] * n

    # convert dict to output list
    for (key, value) in matching.items():
        # 0-index key and value
        int_key = int(key) - 1
        int_value = int(value) - 1 if int(value) > 0 else -1

        output[int_key] = int_value

    return output


def create_preference_matrix(weighted_matrix):
    """
    Helper function that converts an n^2 weighted matrix into a n-by-m preference matrix (where m = n - 1).

    Input:
        weighted_matrix (list of list of numbers): matrix of weighted affinities

    Return:
        (list of list of numbers): preference matrix where each list is ordered list of person indices.
    """
    # create zipped lists of (index, rating)
    preference_matrix = [[(index + 1, rating) for index, rating in enumerate(x)] for x in weighted_matrix]

    # format each row
    for index, curr_person in enumerate(preference_matrix):
        curr_person.sort(key=lambda tup: tup[1], reverse=True)

        # add sorted preference list without self
        preference_matrix[index] = [person_rating[0] for person_rating in curr_person if person_rating[0] - 1 != index]

    return preference_matrix


def compute_matching_cardinality(matching):
    """
    Helper function that computes the number of people who are matched under a stable or partially matching.

    Input:
        matching (dict or list): mapping of persons and who they are matched to (-1 if unmatched).
            if list, number refers to index.
            if dict, string value refers to dict key.

    Output:
        (number): number of people matched in the matching.
    """
    if isinstance(matching, dict):
        return sum(str(x) != '-1' for x in matching.values())
    else:
        return sum(str(x) != '-1' for x in matching)


# unit tests
if __name__ == '__main__':
    # from http://www.dcs.gla.ac.uk/~pat/jchoco/roommates/papers/Comp_sdarticle.pdf
    paper_matching_6 = [
        [4, 6, 2, 5, 3],
        [6, 3, 5, 1, 4],
        [4, 5, 1, 6, 2],
        [2, 6, 5, 1, 3],
        [4, 2, 3, 6, 1],
        [5, 1, 4, 2, 3]
    ]

    paper_matching_8 = [
        [2, 5, 4, 6, 7, 8, 3],
        [3, 6, 1, 7, 8, 5, 4],
        [4, 7, 2, 8, 5, 6, 1],
        [1, 8, 3, 5, 6, 7, 2],
        [6, 1, 8, 2, 3, 4, 7],
        [7, 2, 5, 3, 4, 1, 8],
        [8, 3, 6, 4, 1, 2, 5],
        [5, 4, 7, 1, 2, 3, 6]
    ]

    paper_no_matching_4 = [
        [2, 3, 4],
        [3, 1, 4],
        [1, 2, 4],
        [1, 2, 3]
    ]

    paper_no_matching_6 = [
        [2, 6, 4, 3, 5],
        [3, 5, 1, 6, 4],
        [1, 6, 2, 5, 4],
        [5, 2, 3, 6, 1],
        [6, 1, 3, 4, 2],
        [4, 2, 5, 1, 3]
    ]

    # from https://en.wikipedia.org/wiki/Stable_roommates_problem#Algorithm
    wiki_matching_6 = [
        [3, 4, 2, 6, 5],
        [6, 5, 4, 1, 3],
        [2, 4, 5, 1, 6],
        [5, 2, 3, 6, 1],
        [3, 1, 2, 4, 6],
        [5, 1, 3, 4, 2]
    ]

    # from http://www.dcs.gla.ac.uk/~pat/roommates/distribution/data/
    external_matching_8 = [
        [2, 5, 4, 6, 7, 8, 3],
        [3, 6, 1, 7, 8, 5, 4],
        [4, 7, 2, 8, 5, 6, 1],
        [1, 8, 3, 5, 6, 7, 2],
        [6, 1, 8, 2, 3, 4, 7],
        [7, 2, 5, 3, 4, 1, 8],
        [8, 3, 6, 4, 1, 2, 5],
        [5, 4, 7, 1, 2, 3, 6]
    ]

    external_matching_10 = [
        [8, 2, 9, 3, 6, 4, 5, 7, 10],
        [4, 3, 8, 9, 5, 1, 10, 6, 7],
        [5, 6, 8, 2, 1, 7, 10, 4, 9],
        [10, 7, 9, 3, 1, 6, 2, 5, 8],
        [7, 4, 10, 8, 2, 6, 3, 1, 9],
        [2, 8, 7, 3, 4, 10, 1, 5, 9],
        [2, 1, 8, 3, 5, 10, 4, 6, 9],
        [10, 4, 2, 5, 6, 7, 1, 3, 9],
        [6, 7, 2, 5, 10, 3, 4, 8, 1],
        [3, 1, 6, 5, 2, 9, 8, 4, 7]
    ]

    external_matching_20 = [
        [13, 12, 20, 17, 11, 6, 8, 2, 3, 14, 4, 16, 5, 10, 18, 19, 9, 15, 7],
        [13, 6, 8, 17, 18, 19, 1, 11, 7, 4, 15, 16, 5, 9, 3, 20, 12, 10, 14],
        [6, 16, 4, 9, 14, 13, 17, 19, 8, 2, 1, 12, 20, 5, 18, 15, 7, 11, 10],
        [11, 7, 8, 2, 17, 3, 15, 6, 19, 10, 9, 5, 1, 16, 13, 20, 18, 14, 12],
        [8, 17, 14, 16, 4, 13, 15, 6, 19, 9, 12, 7, 2, 3, 11, 18, 20, 10, 1],
        [8, 13, 10, 14, 18, 15, 2, 7, 4, 16, 19, 5, 9, 17, 20, 3, 11, 12, 1],
        [13, 1, 4, 9, 19, 18, 11, 14, 10, 2, 17, 6, 15, 16, 5, 3, 12, 8, 20],
        [1, 6, 20, 7, 5, 15, 19, 4, 12, 3, 17, 9, 10, 14, 16, 2, 18, 11, 13],
        [17, 13, 3, 5, 7, 4, 12, 2, 18, 20, 15, 8, 10, 1, 6, 11, 19, 14, 16],
        [9, 4, 16, 14, 18, 17, 15, 11, 20, 13, 3, 12, 2, 1, 19, 7, 5, 8, 6],
        [6, 15, 4, 1, 18, 14, 5, 3, 9, 2, 17, 13, 8, 7, 12, 20, 19, 10, 16],
        [5, 18, 7, 16, 6, 20, 19, 14, 9, 17, 3, 1, 8, 10, 11, 13, 2, 15, 4],
        [3, 10, 7, 18, 14, 15, 1, 6, 12, 4, 8, 19, 16, 17, 5, 20, 9, 11, 2],
        [2, 5, 10, 13, 19, 17, 6, 3, 18, 7, 20, 9, 1, 4, 16, 12, 15, 8, 11],
        [12, 13, 5, 11, 2, 16, 18, 14, 1, 6, 17, 8, 19, 4, 10, 7, 20, 3, 9],
        [1, 7, 6, 5, 14, 18, 12, 17, 20, 11, 15, 10, 2, 13, 3, 8, 19, 9, 4],
        [5, 8, 15, 9, 7, 18, 11, 10, 19, 2, 1, 12, 3, 14, 20, 13, 6, 16, 4],
        [14, 3, 8, 10, 13, 5, 9, 15, 12, 1, 17, 6, 16, 11, 2, 7, 4, 19, 20],
        [9, 15, 20, 12, 18, 1, 11, 5, 3, 2, 13, 14, 10, 7, 6, 16, 8, 17, 4],
        [5, 6, 18, 19, 16, 7, 4, 9, 2, 17, 8, 15, 1, 12, 13, 10, 14, 3, 11]
    ]

    # matching exists if algorithm leaves 7 unmatched
    external_matching_7 = [
        [3, 4, 2, 6, 5, 7],
        [6, 5, 4, 1, 3, 7],
        [2, 4, 5, 1, 6, 7],
        [5, 2, 3, 6, 1, 7],
        [3, 1, 2, 4, 6, 7],
        [5, 1, 3, 4, 2, 7],
        [1, 2, 3, 4, 5, 6]
    ]

    # custom test cases
    # empty matrix
    custom_no_matching_empty = []

    # one person (no matching should be possible)
    custom_no_matching_1 = [[]]

    # two people
    custom_matching_2 = [[2], [1]]

    # three people (odd: should add person and find a matching)
    custom_matching_3 = [
        [3, 2],
        [3, 1],
        [1, 2]
    ]

    # build and execute test cases
    class StableRoommatesTests(unittest.TestCase):
        handle_odd_method = 'remove'

        def test0_input_checking(self):
            print('Input checking test cases where failure should occur before beginning matching algorithm...', end='')
            res_custom_no_matching_empty = stable_matching_wrapper(custom_no_matching_empty,
                                                                   handle_odd_method=self.handle_odd_method)
            res_custom_no_matching_1 = stable_matching_wrapper(custom_no_matching_1,
                                                               handle_odd_method=self.handle_odd_method)

            # custom_no_matching_empty should have no matching and fail at input validation
            self.assertEqual(res_custom_no_matching_empty[0], None)
            self.assertEqual(res_custom_no_matching_empty[1], False)
            self.assertEqual(res_custom_no_matching_empty[2],
                             'Invalid input. Must be n-by-m (where m = n - 1) list of lists of numbers.')

            # custom_no_matching_1 should have no matching and fail at input validation
            self.assertEqual(res_custom_no_matching_1[0], None)
            self.assertEqual(res_custom_no_matching_1[1], False)
            self.assertEqual(res_custom_no_matching_1[2],
                             'Invalid input. Must be n-by-m (where m = n - 1) list of lists of numbers.')

            print('SUCCESS.')

        def test1_paper_matching(self):
            print('Test cases from Irving\'s paper where matching is possible...', end='')
            res_paper_matching_6 = stable_matching_wrapper(paper_matching_6, handle_odd_method=self.handle_odd_method)
            res_paper_matching_8 = stable_matching_wrapper(paper_matching_8, handle_odd_method=self.handle_odd_method)

            # both should have a fully stable matching
            self.assertEqual(res_paper_matching_6[1], True)
            self.assertEqual(res_paper_matching_8[1], True)

            # paper_matching_6 should match with length 6 and contain 0-5
            self.assertNotEqual(res_paper_matching_6[0], None)
            self.assertEqual(len(res_paper_matching_6[0]), 6)
            self.assertEqual(set(res_paper_matching_6[0]), set(range(6)))

            # paper_matching_8 should match with length 8 and contain 0-7
            self.assertNotEqual(res_paper_matching_8[0], None)
            self.assertEqual(len(res_paper_matching_8[0]), 8)
            self.assertEqual(set(res_paper_matching_8[0]), set(range(8)))

            print('SUCCESS.')

        def test2_paper_no_matching(self):
            print('Test cases from Irving\'s paper where no matching is possible...', end='')
            res_paper_no_matching_4 = stable_matching_wrapper(paper_no_matching_4,
                                                              handle_odd_method=self.handle_odd_method)
            res_paper_no_matching_6 = stable_matching_wrapper(paper_no_matching_6,
                                                              handle_odd_method=self.handle_odd_method)

            # fully stable matching is NOT possible for both cases
            self.assertEqual(res_paper_no_matching_4[1], False)
            self.assertEqual(res_paper_no_matching_6[1], False)

            # no partial matching should exist either
            self.assertEqual(set(res_paper_no_matching_4[0]), {-1})
            self.assertEqual(set(res_paper_no_matching_6[0]), {-1})

            print('SUCCESS.')

        def test3_wiki_matching(self):
            print('Test cases from Stable Roommates Wikipedia article where matching is possible...', end='')
            res_wiki_matching_6 = stable_matching_wrapper(wiki_matching_6, handle_odd_method=self.handle_odd_method)

            # should have a fully stable matching
            self.assertEqual(res_wiki_matching_6[1], True)

            # paper_matching_6 should match with length 6 and contain 0-5
            self.assertNotEqual(res_wiki_matching_6[0], None)
            self.assertEqual(len(res_wiki_matching_6[0]), 6)
            self.assertEqual(set(res_wiki_matching_6[0]), set(range(6)))

            print('SUCCESS.')

        def test4_external_matching(self):
            print('Test cases from another implementation where matching is possible...', end='')
            res_external_matching_8 = stable_matching_wrapper(external_matching_8,
                                                              handle_odd_method=self.handle_odd_method)
            res_external_matching_10 = stable_matching_wrapper(external_matching_10,
                                                               handle_odd_method=self.handle_odd_method)
            res_external_matching_20 = stable_matching_wrapper(external_matching_20,
                                                               handle_odd_method=self.handle_odd_method)
            res_external_matching_7 = stable_matching_wrapper(external_matching_7,
                                                              handle_odd_method=self.handle_odd_method)

            # all matchings should be fully stable
            self.assertEqual(res_external_matching_8[1], True)
            self.assertEqual(res_external_matching_10[1], True)
            self.assertEqual(res_external_matching_20[1], True)
            self.assertEqual(res_external_matching_7[1], True)

            # paper_matching_8 should match with length 8 and contain 0-7
            self.assertNotEqual(res_external_matching_8[0], None)
            self.assertEqual(len(res_external_matching_8[0]), 8)
            self.assertEqual(set(res_external_matching_8[0]), set(range(8)))

            # paper_matching_10 should match with length 10 and contain 0-9
            self.assertNotEqual(res_external_matching_10[0], None)
            self.assertEqual(len(res_external_matching_10[0]), 10)
            self.assertEqual(set(res_external_matching_10[0]), set(range(10)))

            # paper_matching_20 should match with length 20 and contain 0-19
            self.assertNotEqual(res_external_matching_20[0], None)
            self.assertEqual(len(res_external_matching_20[0]), 20)
            self.assertEqual(set(res_external_matching_20[0]), set(range(20)))

            # paper_matching_7 should match with length 7 and not having a matching for user 7
            self.assertNotEqual(res_external_matching_7[0], None)
            self.assertEqual(len(res_external_matching_7[0]), 7)
            self.assertEqual(res_external_matching_7[0][6], -1)

            print('SUCCESS.')

        def test5_custom_matching(self):
            print('Custom test cases where matching is possible...', end='')
            res_custom_matching_2 = stable_matching_wrapper(custom_matching_2, handle_odd_method=self.handle_odd_method)
            res_custom_matching_3 = stable_matching_wrapper(custom_matching_3, handle_odd_method=self.handle_odd_method)

            # both matchings should be fully stable
            self.assertEqual(res_custom_matching_2[1], True)
            self.assertEqual(res_custom_matching_3[1], True)

            # custom_matching_2 should match with length 2 and contain 0-1
            self.assertNotEqual(res_custom_matching_2[0], None)
            self.assertEqual(len(res_custom_matching_2[0]), 2)
            self.assertEqual(set(res_custom_matching_2[0]), set(range(2)))

            # custom_matching_3 should match with length 3 and not have a matching for user 2
            self.assertNotEqual(res_custom_matching_3[0], None)
            self.assertEqual(len(res_custom_matching_3[0]), 3)
            self.assertEqual(res_custom_matching_3[0][1], -1)

            print('SUCCESS.')

    unittest.main()
