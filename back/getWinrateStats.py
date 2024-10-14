import json

# Get today's date in yyyy-mm-dd format
import datetime
today = datetime.date.today().strftime("%Y-%m-%d")

# Construct the file path
file_path = "./answers/" + today + "/stats.json"

# Read the JSON file
with open(file_path, 'r') as file:
    data = json.load(file)

# Calculate the correct percentage of each question
individual_stats = data['individualStats']


correct_percentages = {}
for question in individual_stats:
    if question["nJugades"] == 0:
        correct_percentages[question["id"]] = 0
    else:
        encerts = question["nEncertades"]
        total_responses = question["nJugades"]
        correct_percentages[question["id"]] = round(encerts / total_responses * 100, 2)

# Print the results
allObj = []
for questionId, percentage in correct_percentages.items():
    obj = {
        "questionId": questionId,
        "percentage": percentage
    }
    allObj.append(obj)

print(json.dumps(allObj))

exit(0)