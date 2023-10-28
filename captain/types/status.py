from enum import Enum

from pydantic import BaseModel


class ServerStatusEnum(str, Enum):
    OK = "OK"
    ERROR = "ERROR"


class ServerStatus(BaseModel):
    status: ServerStatusEnum
    message: str
