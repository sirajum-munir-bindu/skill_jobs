from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from bson import ObjectId


def format_doc(doc: Any) -> dict:
    """Format database document (dict or SQLAlchemy ORM object) by converting ObjectId/id and dates to strings."""
    if not doc:
        return doc
    if hasattr(doc, "__dict__"):
        d = dict(doc.__dict__)
        d.pop("_sa_instance_state", None)
        if "id" in d and "_id" not in d:
            d["_id"] = str(d["id"])
        doc = d
    else:
        doc = dict(doc)
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["_id"] = str(doc["_id"])
    elif "_id" in doc:
        doc["_id"] = str(doc["_id"])
    elif "id" in doc:
        doc["_id"] = str(doc["id"])
    for k, v in doc.items():
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
        elif isinstance(v, ObjectId):
            doc[k] = str(v)
    return doc


class EventModel(BaseModel):
    title: str
    date: str
    time: str
    location: str
    image: str
    category: str
    status: Optional[str] = "Upcoming"
    regLink: Optional[str] = None


class AmbassadorModel(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    university: str
    reason: str
    image: Optional[str] = None
    role: Optional[str] = None
    dept: Optional[str] = None
    status: Optional[str] = "Pending"

class UserRegisterModel(BaseModel):
    name: str
    email: str
    password: str

class UserLoginModel(BaseModel):
    email: str
    password: str

class UserUpdateModel(BaseModel):
    id: str
    name: str
    email: str
    password: Optional[str] = None


class AmbassadorStatusModel(BaseModel):
    status: str


class ConfigModel(BaseModel):
    key: str
    value: Any


class MessageModel(BaseModel):
    name: str
    email: str
    subject: str
    message: str
