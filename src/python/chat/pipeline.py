"""Engine pipeline runner.

Modified from engine.pipeline in Chat Composer
"""

import prelude
import copy
import requests

from typing import Dict, Any, List

import restricted
import restricted.oai
import oai


def chat_send(pipeline_id: int, user_message: str):
    """Send a message to the chat

    Modified from conductor.views.ConductorChatSendView in Chat Composer
    """
    # Get pipeline state and components
    response = requests.get(
        f"{restricted.url}/pipeline/{pipeline_id}/",
        headers=prelude.headers,
    )
    response.raise_for_status()
    pipeline = response.json()
    pstate = pipeline["state"]
    components = [
        restricted.Component(
            id=component["id"],
            name=component["name"],
            code=component["code"],
            function_name=component["function_name"],
            state=component["state"],
        )
        for component in pipeline["components"]
    ]

    try:
        pipeline_data = run(pipeline_id, pstate, components, user_message)
    except requests.HTTPError as e:
        pipeline_data = {
            "api_message": e.response.json(),
        }
    except Exception:
        import traceback

        pipeline_data = {
            "api_message": traceback.format_exc(),
        }

    # Save to chat
    response = requests.patch(
        f"{restricted.url}/save/chat/{pipeline_id}/",
        json={
            "user_message": user_message,
            "api_message": pipeline_data.get(
                "api_message", "<no api message>"
            ),
        },
        headers=prelude.headers,
    )
    response.raise_for_status()


def run(
    pipeline_id: int,
    pstate: Dict[str, Any],
    components: List[restricted.Component],
    user_message: str,
) -> Dict[str, Any]:
    """Run the pipeline"""
    data = {}
    for component in components:
        data = run_component(
            pipeline_id, component, pstate, user_message, data
        )

    return data


def run_component(
    pipeline_id: int,
    component: restricted.Component,
    pstate: Dict[str, Any],
    user_message: str,
    data: Dict[str, Any],
) -> Dict[str, Any]:
    """Run a component"""
    with restricted.oai.init_oai(component):
        # Compile the code
        byte_code = compile(
            component.code, f"{component.function_name}.py", "exec"
        )

        loc = {}

        glob = {}
        glob["__name__"] = f"pipeline {pipeline_id} component {component.id}"
        glob["pstate"] = copy.deepcopy(pstate)
        glob["state"] = copy.deepcopy(component.state)
        glob["oai"] = oai

        exec(byte_code, glob, loc)

        # Run the code
        function = loc[component.function_name]
        new_data = function(user_message, data)
        component.state = glob["state"]
        pstate.clear()
        pstate.update(glob["pstate"])

        # Validation
        if not isinstance(component.state, dict):
            raise restricted.InvalidComponentCode(
                f"Component {component.name} did not set a dict for state"
            )

        if not isinstance(pstate, dict):
            raise restricted.InvalidComponentCode(
                f"Component {component.name} did not set a dict for pstate"
            )

        # Save
        response = requests.patch(
            f"{restricted.url}/save/states/{component.id}/",
            json={
                "state": component.state,
                "pstate": pstate,
            },
            headers=prelude.headers,
        )
        response.raise_for_status()

        # Validation
        if not isinstance(new_data, dict):
            raise restricted.InvalidComponentCode(
                f"Component {component.name} did not return a dict"
            )

    return new_data
