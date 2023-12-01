import restricted
import prelude
import requests

_current_component: restricted.Component | None = None


class _CurrentComponentHelper:
    """Helper class for setting current component"""

    def __init__(self, component: restricted.Component):
        """Initialize the helper"""
        self.component = component

    def __enter__(self):
        """Enter the context"""
        global _current_component
        _current_component = self.component

    def __exit__(self, exc_type, exc_value, traceback):
        """Exit the context"""
        global _current_component
        _current_component = None


def init_oai(
    component: restricted.Component,
) -> _CurrentComponentHelper:
    """Set the current component"""
    return _CurrentComponentHelper(component)


def chatcmpl(data: dict):
    """Call Chatmpl"""

    response = requests.post(
        f"{restricted.url}/oai/chatcmpl/{_current_component.id}/",
        json={"request": data},
        headers=prelude.headers,
    )
    response.raise_for_status()
    return response.json()


def remove_recursively(item: any, *forbidden):
    """Remove recursively all forbidden items from a list or a dict."""
    if isinstance(item, list):
        return [
            remove_recursively(entry, *forbidden)
            for entry in item
            if entry not in forbidden
        ]
    if isinstance(item, dict):
        result = {}
        for key, value in item.items():
            value = remove_recursively(value, *forbidden)
            if key not in forbidden and value not in forbidden:
                result[key] = value
        return result
    return item
