from pydantic import BaseModel
from typing import Optional, Any, List
from datetime import datetime
try:
    from bson import ObjectId
except ImportError:
    class ObjectId:
        pass


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


class BulkDeleteUsersModel(BaseModel):
    userIds: List[str]


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
    phone: Optional[str] = None
    university: str
    reason: str
    image: Optional[str] = None
    role: Optional[str] = None
    dept: Optional[str] = None
    status: Optional[str] = "Pending"

class AmbassadorUpdateModel(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    university: Optional[str] = None
    reason: Optional[str] = None
    image: Optional[str] = None
    role: Optional[str] = None
    dept: Optional[str] = None
    status: Optional[str] = None

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

class AdminUserCreateModel(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Participant"
    permissions: Optional[List[str]] = None

class AdminUserUpdateModel(BaseModel):
    name: str
    email: str
    role: Optional[str] = "Participant"
    password: Optional[str] = None
    permissions: Optional[List[str]] = None


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


class WorkReportModel(BaseModel):
    name: str
    email: str
    phone: str
    ambassadorEmail: Optional[str] = None
    ambassadorName: Optional[str] = None
    institution: Optional[str] = None
    status: Optional[str] = "Pending"
    createdAt: Optional[str] = None


class WorkReportUpdateModel(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    institution: Optional[str] = None
    status: Optional[str] = None


class WorkReportStatusModel(BaseModel):
    status: str


class NfcOrderModel(BaseModel):
    id: Optional[str] = None
    customerName: str
    customerEmail: str
    customerPhone: str
    deliveryAddress: str
    district: Optional[str] = "Dhaka"
    cardVariantId: Optional[str] = None
    cardVariantName: Optional[str] = None
    customNameOnCard: Optional[str] = None
    customRoleOnCard: Optional[str] = None
    customOrgOnCard: Optional[str] = None
    paymentMethod: Optional[str] = "bkash"
    trxId: Optional[str] = ""
    ambassadorCode: Optional[str] = ""
    notes: Optional[str] = ""
    quantity: Optional[Any] = 1
    unitPrice: Optional[Any] = 0
    subtotal: Optional[Any] = 0
    deliveryCharge: Optional[Any] = 0
    discountAmount: Optional[Any] = 0
    grandTotal: Optional[Any] = 0
    status: Optional[str] = "Pending"
    createdAt: Optional[str] = None


class NfcOrderStatusModel(BaseModel):
    status: str

