import os

os.environ["REACT_APP_COMPOSER_BASE_URL"] = ""
os.environ["ACCESS_TOKEN"] = ""

composer_base_url = os.getenv("REACT_APP_COMPOSER_BASE_URL")
access_token = os.getenv("ACCESS_TOKEN")

headers = {
    "Authorization": f"Bearer {access_token}",
    # These are not allowed by pyodide
    "Accept-Encoding": None,
    "Connection": None,
    "Content-Length": None,
}
