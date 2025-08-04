from datetime import datetime
from enum import Enum
from turtle import st
from httpx import request
from pydantic import BaseModel,EmailStr
from typing import Optional
from models import FriendStatus

class Create_User(BaseModel):
    name: str
    email: EmailStr
    password: str

    model_config = {
        "from_attributes": True
    }


class Return_User(BaseModel):
    id: int
    name: str
    email: str

    model_config = {
        "from_attributes": True
    }


class Login_User(BaseModel):
    email: EmailStr
    password: str

    model_config = {
        "from_attributes": True
    }

class Token(BaseModel):
    access_token: str
    token_type: str

    model_config = {
        "from_attributes": True
    }

class TokenData(BaseModel):
    id: Optional[int] = None

    model_config = {
        "from_attributes": True
    }


class Create_Post(BaseModel):
    title: str
    content: str
    model_config = {
        "from_attributes": True
    }

class Response_Post(Create_Post):
    pass
    id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class getAllUsers(BaseModel):
    name: str

    model_config = {
        "from_attributes": True
    }


class Friend_Requests(BaseModel):
    receiver_name : str

    model_config = {
        "from_attributes": True
    }

class Friend_Response(BaseModel):
    sender_name: str
    status: FriendStatus

    model_config = {
        "from_attributes": True
    }

class Friend_Request_Detail(BaseModel):
    id: int
    sender_name: str
    receiver_name: str
    status: FriendStatus

    model_config = {
        "from_attributes": True
    }

class FriendPost(BaseModel):
    friend_name: str
    title: str
    content: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }