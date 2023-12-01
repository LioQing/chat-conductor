from typing import Dict, Any
import prelude

from pydantic import BaseModel

url = f"{prelude.composer_base_url}/conductor/chat"


class InvalidComponentCode(Exception):
    """Invalid component code"""

    pass


class Component(BaseModel):
    """Component instance"""

    id: int
    name: str
    code: str
    function_name: str
    state: Dict[str, Any]

    def model_dump(self) -> Dict[str, Any]:
        """Dump the model"""
        return self.json()
