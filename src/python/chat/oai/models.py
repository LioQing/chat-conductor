"""Models for OpenAI API.

Modified from engine.oai.models in Chat Composer to adapt to v1.10
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from .enums import FinishReason, Role


class FunctionCall(BaseModel):
    """Function call by chat completion.

    Attributes:
        arguments (str): The arguments to be passed to the function.
        name (str): The name of the function.
    """

    arguments: str
    name: str

    def model_dump(self) -> Dict[str, Any]:
        """Dump the model"""
        return self.json()


class Message(BaseModel):
    """Message by chat completion.

    Attributes:
        content (str): The content of the message.
        name (str, optional): The name of the message. Defaults to None.
        function_call (FunctionCall, optional): The function call. Defaults to
            None.
        role (Role): The role of the message.
    """

    content: str
    name: Optional[str] = Field(None)
    function_call: Optional[FunctionCall] = Field(None)
    role: Role

    def model_dump(self) -> Dict[str, Any]:
        """Dump the model"""
        dump = {"role": self.role, "content": self.content}

        if self.name is not None:
            dump["name"] = self.name

        if self.function_call is not None:
            dump["function_call"] = self.function_call

        return dump


class Choice(BaseModel):
    """Message choice by chat completion.

    Attributes:
        finish_reason (FinishReason): The finish reason.
        index (int): The index of the message.
        message (Message): The message.
    """

    finish_reason: FinishReason
    index: int
    message: Message

    def model_dump(self) -> Dict[str, Any]:
        """Dump the model"""
        return self.json()


class Usage(BaseModel):
    """Token usage by chat completion.

    Attributes:
        completion_tokens (int): The number of completion tokens.
        prompt_tokens (int): The number of prompt tokens.
        total_tokens (int): The number of total tokens.
    """

    completion_tokens: int
    prompt_tokens: int
    total_tokens: int

    def model_dump(self) -> Dict[str, Any]:
        """Dump the model"""
        return self.json()


class Chatcmpl(BaseModel):
    """Chat completion response by OpenAI API.

    Attributes:
        choices (List[Choice]): The choices.
        created (int): The created timestamp.
        model (str): The model.
        object (str): The object.
        usage (Usage): The usage.
    """

    id: str
    choices: List[Choice]
    created: int
    model: str
    object: str
    usage: Usage

    def model_dump(self) -> Dict[str, Any]:
        """Dump the model"""
        return self.json()


class FunctionCallRequest(BaseModel):
    """Function call for chat completion to call.

    Attributes:
        auto (bool): Whether to automatically call the function.
        name (str): The name of the function to call.
    """

    auto: Optional[bool] = Field(False)
    name: Optional[str] = Field(None)

    def model_dump(self) -> Dict[str, Any] | str:
        """Dump the model"""
        if self.name is not None:
            return {"name": self.name}
        if self.auto:
            return "auto"

        return "none"


class Parameter(BaseModel):
    """Function parameter.

    Attributes:
        type (str): The type of the parameter.
        description (str): The description of the parameter.
        enum (Optional[List[str]]): The enum of the parameter. Defaults to
            None.
        required (bool): Whether the parameter is required.
    """

    type: str
    description: str
    enum: Optional[List[str]] = Field(None)
    required: bool = Field(False, exclude=True)

    def model_dump(self) -> Dict[str, Any]:
        """Dump the model"""
        dump = {"type": self.type, "description": self.description}

        if self.enum is not None:
            dump["enum"] = self.enum

        return dump


class Parameters(BaseModel):
    """Parameters for function.

    Attributes:
        parameters (Dict[str, Parameter]): The parameters.
    """

    parameters: Dict[str, Parameter]

    def model_dump(self) -> Dict[str, Any]:
        """Dump the model"""
        dump = {
            "type": "object",
            "properties": {
                k: v.model_dump() for k, v in self.parameters.items()
            },
            "required": [
                k for k, v in self.parameters.items() if v.required is True
            ],
        }

        return dump


class Function(BaseModel):
    """Function.

    Attributes:
        description (str): The description of the function.
        name (str): The name of the function.
        parameters (Parameters): The parameters of the function.
    """

    description: str
    name: str
    parameters: Parameters

    def model_dump(self) -> Dict[str, Any]:
        """Dump the model"""
        return self.json()


class ChatcmplRequest(BaseModel):
    """Chat completion request body.

    Attributes:
        deployment_id (str): The deployment ID.
        messages (List[Message]): The messages.
        model (str): The model.
        frequency_penalty (float): The frequency penalty.
        function_call (FunctionCallRequest): The function call.
        functions (Optional[List[Function]]): The functions. Defaults to None.
        max_tokens (int): The maximum number of tokens.
        n (int): The number of responses to return.
        presence_penalty (float): The presence penalty.
        stop (Optional[str | List[str]]): The stop. Defaults to None.
        stream (bool): Whether to stream the response. Defaults to False.
        temperature (float): The temperature.
        top_p (float): The top p.
        user (Optional[str]): The user. Defaults to None.
    """

    deployment_id: str
    messages: List[Message]
    model: str
    frequency_penalty: float = Field(0.0, ge=-2.0, le=2.0)
    function_call: FunctionCallRequest = Field(
        default_factory=FunctionCallRequest
    )
    functions: Optional[List[Function]] = Field(None)
    max_tokens: int = Field(2048, gt=0)
    n: int = Field(1)
    presence_penalty: float = Field(0.0, ge=-2.0, le=2.0)
    stop: Optional[str | List[str]] = Field(None)
    stream: bool = Field(False)
    temperature: float = Field(1.0, ge=0.0, le=2.0)
    top_p: float = Field(1.0)
    user: Optional[str] = Field(None)

    def model_dump(self) -> Dict[str, Any]:
        """Dump the model"""
        dump = self.json()

        if self.functions is None:
            dump.pop("functions")
            dump.pop("function_call")

        if self.stop is None:
            dump.pop("stop")

        if self.user is None:
            dump.pop("user")

        return dump
