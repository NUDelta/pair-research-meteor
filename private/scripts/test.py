import sys

def testFunc(inputString):
    return '{ "name": "Test String"}'

print testFunc(eval(sys.stdin.readlines()[0]))
