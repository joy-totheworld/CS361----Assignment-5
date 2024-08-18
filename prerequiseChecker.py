import zmq
import json
context = zmq.Context()
socket = context.socket(zmq.REP)
socket.bind("tcp://*:4444")

def processDisjunction(inputList, allCourses):
    found = False
    matchidx = 99999999
    for i in range(len(inputList)):
        if isinstance(inputList[i], list):
            recurse = processDisjunction(inputList[i],allCourses)
            if (recurse[0]):
                found = True
                matchidx = recurse[1]
        else:
            for j in range(len(allCourses)):
                if (inputList[i] == allCourses[j]["courseID"]):
                    found = True
                    matchidx = j
    return [found, matchidx]


def processString(inputList):
    processed = inputList
    # processing strings
    for i in range(len(inputList)):
        if isinstance(inputList[i], list):
            processed[i] = processString(inputList[i])
        else:
            processed[i]["courseID"] = inputList[i]["courseID"].replace("\xa0", " ")
            processed[i]["prereqs"] = processPrereqString(inputList[i]["prereqs"])
    return processed

def processPrereqString(inputList):
    processed = inputList
    # processing strings
    for i in range(len(inputList)):
        if isinstance(inputList[i], list):
            processed[i] = processPrereqString(inputList[i])
            print("recurse on: ", inputList[i])
        else:
            print("processing: ", inputList[i])
            processed[i] = inputList[i].replace("\xa0", " ")
    return processed
        
while True:
    plannedClasses = []
    missingClasses = []
    misorderedClasses = []

    message = socket.recv_json()
    # message = message.replace("\xa0", " ")
    print('message["planned"]: ', message["planned"])
    plannedClasses = message["planned"]
    
        
    processString(plannedClasses)
        
    print()
    print('plannedClasses: ', plannedClasses)
    print()
    print('len(plannedClasses): ', len(plannedClasses))
    print('plannedClasses[0]: ', plannedClasses[0])
    
    
    # looking for missing and misordered prereqs
    for i in range(len(plannedClasses)):
        for j in range (len(plannedClasses[i]["prereqs"])):
            found = False
            prior = False
            if isinstance(plannedClasses[i]["prereqs"][j], list):
                    matchidx = 99999999
                    foundArray = processDisjunction(plannedClasses[i]["prereqs"][j], plannedClasses)
                    if (foundArray[0] == True):
                        found = True
                        matchidx = foundArray[1]
                        # (idx of requiring class > idx of required class) for true
                        if (plannedClasses[i]["parentIdx"] > matchidx):
                            prior = True
                    plannedClasses[i]["prereqs"][j] = plannedClasses[i]["prereqs"][j][0]
            else:
                for k in range(len(plannedClasses)):
                    if (plannedClasses[i]["prereqs"][j] == plannedClasses[k]["courseID"]):
                        found = True
                        # print("plannedClasses[k]: ", plannedClasses[k])
                        # (idx of requiring class > idx of required class) for true
                        if (plannedClasses[i]["parentIdx"] > plannedClasses[k]["parentIdx"]):
                            prior = True
            if (found == False):
                missingClasses.append({"courseID": plannedClasses[i]["prereqs"][j], "requiredFor": plannedClasses[i]["courseID"]})
            elif (prior == False):
                misorderedClasses.append({"misorderedPrereqs":plannedClasses[i]["prereqs"][j], "requiredFor": plannedClasses[i]["courseID"]})
                # print(plannedClasses[i]["prereqs"][j], " is a misordered req for ", plannedClasses[i]["courseID"])
                # print(plannedClasses[i]["parentIdx"], " is the term idx of ", plannedClasses[i]["courseID"])
                # print('misorderedClasses: ', misorderedClasses)
                
    
    print()
    print('missingClasses: ', missingClasses)
    print()
    print('misorderedClasses: ', misorderedClasses)
    print()
    print('json.dumps: ', json.dumps({"missingClasses": missingClasses, "misorderedClasses": misorderedClasses}))
    socket.send_string(json.dumps({"missingClasses": missingClasses, "misorderedClasses": misorderedClasses}))
    
    
                
                
                
          
        

    # if (message["sender"] == "task-manager"):
    #     taskManagerSubscriptions = message["services"]
    # elif (message["sender"] == "subscription-tracker"):
    #     subscriptionTrackerSubscriptions = message["services"]

    # for i in range(len(subscriptionTrackerSubscriptions)):
    #     used = 0
    #     for j in range(len(taskManagerSubscriptions)):
    #         if (subscriptionTrackerSubscriptions[i]==taskManagerSubscriptions[j]):
    #             UsedSubscriptions.append(subscriptionTrackerSubscriptions[i])
    #             used = 1
    #             j = len(taskManagerSubscriptions)
        
    #     if (used == 0):
    #         UnusedSubscriptions.append(subscriptionTrackerSubscriptions[i])

    # for j in range(len(taskManagerSubscriptions)):
    #     exsisting = 0
    #     for i in range(len(subscriptionTrackerSubscriptions)):
    #         if (subscriptionTrackerSubscriptions[i]==taskManagerSubscriptions[j]):
    #             exsisting = 1
    #             i = len(subscriptionTrackerSubscriptions)
        
    #     if (exsisting == 0):
    #         NeededSubscriptions.append(taskManagerSubscriptions[j])

    # print("UsedSubscriptions: ")
    # print(UsedSubscriptions)
    # print("UnusedSubscriptions: ")
    # print(UnusedSubscriptions)
    # print("NeededSubscriptions: ")
    # print(NeededSubscriptions)
    
    # if (message["requested"] == "Used"):
    #     print("Sent UsedSubscriptions")
    #     socket.send_json({"error": "no", "subscriptions": UsedSubscriptions})
    # elif (message["requested"] == "Unused"):
    #     print("Sent UnusedSubscriptions")
    #     socket.send_json({"error": "no", "subscriptions": UnusedSubscriptions})
    # elif (message["requested"] == "Needed"):
    #     print("Sent NeededSubscriptions")
    #     socket.send_json({"error": "no", "subscriptions": NeededSubscriptions})
    # else:
    #     print("Sent Error")
    #     socket.send_json({"error": "yes", "subscriptions": []})
        
        



        


    
    

