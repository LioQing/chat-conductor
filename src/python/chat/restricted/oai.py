import requests
import os

current_component = None

url = os.getenv("REACT_APP_COMPOSER_BASE_URL")
function_paths = {
    "chatcmpl": "/conductor/chat/oai/chatcmpl",
    "chatcmpl_with_messages": "/conductor/chat/oai/chatcmpl_with_messages",
    "chatcmpl_function": "/conductor/chat/oai/chatcmpl_function",
}

def post(function_name: str, data: dict):
    """Send a POST request to the Composer API."""
    path = function_paths[function_name]
    response = requests.post(f"{url}/{path}/{current_component.id}", json=data)
    return response.json()