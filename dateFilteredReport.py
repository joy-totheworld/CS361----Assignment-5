# Teammate's work, not my own
import zmq
from datetime import datetime

# Configure ZeroMQ context and socket
context = zmq.Context()
socket = context.socket(zmq.REP)
socket.bind("tcp://*:5555")


def process_data(data, start_date, end_date):
    """Filters the data given by start and end date"""

    filtered_data = []
    try:
        for item in data:
            print()
            if 'date' not in item:
                raise ValueError("Data Format Error: each item must contain 'date' keys")
            item_date = datetime.strptime(item['date'], '%Y-%m-%d')
            if start_date <= item_date <= end_date:
                filtered_data.append(item)
    except Exception as e:
        return {"error": str(e)}
    return filtered_data


def main():
    print("Microservice is running...")
    while True:
        # Receive request
        message = socket.recv_json()
        data = message['data']
        start_date_str = message['start_date']
        end_date_str = message['end_date']

        # Convert date strings to datetime objects
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')

        # Process the data
        report = process_data(data, start_date, end_date)

        # Send back the report
        socket.send_json(report)


if __name__ == "__main__":
    main()
