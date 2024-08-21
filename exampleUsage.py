# Teammate's work, not my own
import zmq
from datetime import datetime


def send_request(data, start_date, end_date):
    """Send a request to the microservice and receive the response."""
    context = zmq.Context()
    socket = context.socket(zmq.REQ)  # REQ = Request
    socket.connect("tcp://localhost:5555")

    # Prepare the request payload
    request = {
        'data': data,
        'start_date': start_date.strftime('%Y-%m-%d'),
        'end_date': end_date.strftime('%Y-%m-%d')
    }

    # Send the request
    socket.send_json(request)

    # Receive and print the response
    response = socket.recv_json()
    return response


if __name__ == "__main__":
    # Sample data
    biggum = [
        {'date': '2024-08-01', 'value': 10},
        {'date': '2024-08-02', 'value': 20},
        {'date': '2024-08-03', 'value': 30},
        {'date': '2024-08-04', 'value': 40},
        {'date': '2024-08-05', 'value': 50}
    ]

    start_date = datetime(2024, 8, 2)
    end_date = datetime(2024, 8, 4)

    report = send_request(biggum, start_date, end_date)
    print("Received Report:")
    for line in report:
        print(line)
