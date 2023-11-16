"""OpenAI API functions.

Modified from engine.oai.api in Chat Composer
"""

from typing import List

from oai.models import (
    Chatcmpl,
    ChatcmplRequest,
    Function,
    Message,
)


def chatcmpl(request: ChatcmplRequest) -> Chatcmpl:
    """Call the OpenAI chat completion with the given request.

    The request and response are logged to the database.

    Args:
        request (models.ChatcmplRequest): The request to be sent to the API.

    Returns:
        models.Chatcmpl: The response from the API.
    """
    from restricted.oai import post

    return post("chatcmpl", {
        "request": request.model_dump()
    })


def chatcmpl_with_messages(messages: List[Message]) -> Chatcmpl:
    """Call the OpenAI chat completion with the given messages.

    Args:
        messages (List[models.Message]): A list of messages to be sent to the
            API.

    Returns:
        models.Chatcmpl: The response from the API.
    """
    from restricted.oai import post

    return post("chatcmpl_with_messages", {
        "messages": [message.model_dump() for message in messages]
    })


def chatcmpl_function(
    function: Function, messages: List[Message] = []
) -> Chatcmpl:
    """Call the OpenAI chat completion to provide arguments for the function.

    Args:
        function (models.Function): The function to be called.
        messages (List[models.Message], optional): A list of messages to be
            sent to the API. Defaults to [].

    Returns:
        models.Chatcmpl: The response from the API.
    """
    from restricted.oai import post

    return post("chatcmpl_function", {
        "function": function.model_dump(),
        "messages": [message.model_dump() for message in messages],
    })
