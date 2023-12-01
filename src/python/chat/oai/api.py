"""OpenAI API functions.

Modified from engine.oai.api in Chat Composer
"""

from oai.models import (
    Chatcmpl,
    ChatcmplRequest,
)


def chatcmpl(request: ChatcmplRequest) -> Chatcmpl:
    """Call the OpenAI chat completion with the given request.

    The request and response are logged to the database.

    Args:
        request (models.ChatcmplRequest): The request to be sent to the API.

    Returns:
        models.Chatcmpl: The response from the API.
    """
    from restricted.oai import (
        chatcmpl as restricted_chatcmpl,
        remove_recursively,
    )

    response = restricted_chatcmpl(
        remove_recursively(request.model_dump(), None)
    )["response"]
    return Chatcmpl(**response)
