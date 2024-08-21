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

def combineWithAnd(prereqSubArray) :
    print("prereqSubArray (and)", prereqSubArray)

    if isinstance(prereqSubArray, str):
        return prereqSubArray
    
    elif (len(prereqSubArray) > 0):
        prereqSubString = "("

        if isinstance(prereqSubArray[0], str):
            prereqSubString = prereqSubString + prereqSubArray[0]
        else:
            prereqSubString = prereqSubString + processPrereqString(prereqSubArray[0])
            
        for i in range(len(prereqSubArray)):
            if isinstance(prereqSubArray[i], str):
                prereqSubString = prereqSubString + " and " +  prereqSubArray[i]
            else:
                prereqSubString = prereqSubString + " and " + processPrereqString(prereqSubArray[i])
                
        prereqSubString = prereqSubString + ")"
        return prereqSubString

def combineWithOr(prereqSubArray) :
    print("prereqSubArray (and)", prereqSubArray)

    if isinstance(prereqSubArray, str):
        return prereqSubArray
    
    elif (len(prereqSubArray) > 0):
        prereqSubString = "("

        if isinstance(prereqSubArray[0], str):
            prereqSubString = prereqSubString + prereqSubArray[0]
        else:
            prereqSubString = prereqSubString + processPrereqString(prereqSubArray[0])
            
        for i in range(len(prereqSubArray)):
            if isinstance(prereqSubArray[i], str):
                prereqSubString = prereqSubString + " or " +  prereqSubArray[i]
            else:
                prereqSubString = prereqSubString + " or " + processPrereqString(prereqSubArray[i])
                
        prereqSubString = prereqSubString + ")"
        return prereqSubString
    
def processStrings(plannedArray):
    processed = plannedArray
    # print("plannedArray", plannedArray)
    # print("len(plannedArray)", len(plannedArray))
    
    for stringsIdx in range(len(plannedArray)):
        # print("plannedArray[i]", plannedArray[stringsIdx])

        typePrereq = set(list(plannedArray[stringsIdx].keys()))
        booID = "courseID" in typePrereq
        booPrereqs = "prereqs" in typePrereq
            
        if (booID):
            # print("ID logic works")
            processed[stringsIdx]["courseID"] = plannedArray[stringsIdx]["courseID"].replace("\xa0", " ")
        if (booPrereqs):
            # print("Prereqs logic works: ",plannedArray[stringsIdx]["prereqs"])
            prereqArr = plannedArray[stringsIdx]["prereqs"]
            if (len(prereqArr)> 0 ):
                processed[stringsIdx]["prereqs"] = processPrereqString(plannedArray[stringsIdx]["prereqs"][0])
    return processed

def processPrereqString(plannedArray):
    # print("processPrereqString argument: ",plannedArray)
    if isinstance(plannedArray, str):
        return plannedArray.replace("\xa0", " ")
    else:
        typePrereq = set(list(plannedArray.keys()))
        tryCon = "arrayCon" in typePrereq
        tryDis = "arrayDis" in typePrereq
        
        if (tryCon):
            for i in range(len(plannedArray["arrayCon"])):
                plannedArray["arrayCon"][i] = processPrereqString(plannedArray["arrayCon"][i])
            return plannedArray
        elif (tryDis):
            for i in range(len(plannedArray["arrayDis"])):
                plannedArray["arrayDis"][i] = processPrereqString(plannedArray["arrayDis"][i])
            return plannedArray
        
def lookForMatchInPlanned(prereqObj, requiredFor, parentIdx,plannedArray):
    found = False
    prior = False
    missingClasses = []
    misorderedClasses = []
    

    
    if isinstance(prereqObj, str):
        for i in range(len(plannedArray)):
            if (prereqObj.strip() == plannedArray[i]["courseID"].strip()):
                found = True
                if (plannedArray[i]["parentIdx"] < parentIdx):
                    prior == True
                
        if (found == False):
            missingClasses.append({"courseID": prereqObj, "requiredFor": requiredFor})
        elif (prior == False):
            misorderedClasses.append({"misorderedPrereqs":prereqObj, "requiredFor": requiredFor})
        return [missingClasses, misorderedClasses, found, prior]
    elif isinstance(prereqObj, list):
        return [[],[], False, False]
    else: 
        # print(prereqObj)
        typePrereq = set(list(prereqObj.keys()))
        tryCon = "arrayCon" in typePrereq
        tryDis = "arrayDis" in typePrereq
        if (tryCon):
            unnest = prereqObj["arrayCon"]
            for j in range(len(unnest)):
                processedCon = lookForMatchInPlanned(unnest[j], requiredFor, parentIdx, plannedArray)
                missingClasses = missingClasses + processedCon[0]
                misorderedClasses = misorderedClasses + processedCon[1]
        elif (tryDis):
            unnest = prereqObj["arrayDis"]
            foundAny = False
            priorAny = True
            subMissing = []
            subMisordered = []
            for j in range(len(unnest)):
                processedDis = lookForMatchInPlanned(unnest[j], requiredFor, parentIdx, plannedArray)
                foundSub = processedDis[2]
                priorSub = processedDis[3]
                if (found):
                    foundAny = True
                if (prior):
                    priorAny = True
                subMissing = subMissing + processedDis[0]
                subMisordered = subMisordered + processedDis[1]
            if (foundAny == False):
                missingClasses = subMissing
            elif (priorAny == False):
                misorderedClasses = [subMisordered]
        return [missingClasses, misorderedClasses, found, prior]
        
while True:
    plannedClasses = []
    missingClasses = []
    misorderedClasses = []

    message = socket.recv_json()
    # message = message.replace("\xa0", " ")
    # print('message["planned"]: ', message["planned"])
    # print()
    plannedClasses = message["planned"]
        
    plannedClasses = processStrings(plannedClasses)
        
    # print()
    print('plannedClasses: ', plannedClasses)
    # print()
    print('len(plannedClasses): ', len(plannedClasses))    
    
    # looking for missing and misordered prereqs for each planned class
    for i in range(len(plannedClasses)):
        accumulator = lookForMatchInPlanned(plannedClasses[i]["prereqs"], plannedClasses[i]["courseID"], plannedClasses[i]["parentIdx"], plannedClasses)
        missingClasses = missingClasses+accumulator[0]
        misorderedClasses = misorderedClasses+accumulator[1]    
    
    print()
    print('missingClasses: ', missingClasses)
    print()
    print('misorderedClasses: ', misorderedClasses)
    print()
    print('json reply: ', json.dumps({"missingClasses": missingClasses, "misorderedClasses": misorderedClasses}))
    socket.send_string(json.dumps({"missingClasses": missingClasses, "misorderedClasses": misorderedClasses}))
        



        


    
    

