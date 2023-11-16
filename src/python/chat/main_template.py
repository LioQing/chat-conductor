import os

os.environ['REACT_APP_COMPOSER_BASE_URL'] = ''
os.environ['ACCESS_TOKEN'] = ''

import requests

response = requests.get(f"{os.getenv('REACT_APP_COMPOSER_BASE_URL')}/ping", headers={
    "Authorization": f"Bearer {os.getenv('ACCESS_TOKEN')}",
    "Accept-Encoding": None,
    "Connection": None,
})
print("Ping Response:", response.json())
print("This is a test")
print("Ping Response: " + repr(response.json()))

import pipeline

pipeline.chat_send(
    pipeline_id=0,
    user_message='',
)