import os
import time
import random
import string
import json
from typing import Optional, List, Dict, Any
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_, func

from database import (
    get_db_connection,
    get_db_session,
    local_db,
    save_local_database,
    seed_initial_data,
    SQLEvent,
    SQLAmbassador,
    SQLMessage,
    SQLConfig,
    SQLUser,
    SQLWorkReport,
    SQLNfcOrder
)
from models import (
    format_doc,
    EventModel,
    AmbassadorModel,
    AmbassadorUpdateModel,
    AmbassadorStatusModel,
    UserRegisterModel,
    UserLoginModel,
    UserUpdateModel,
    AdminUserCreateModel,
    AdminUserUpdateModel,
    ConfigModel,
    MessageModel,
    WorkReportModel,
    WorkReportUpdateModel,
    WorkReportStatusModel,
    BulkDeleteUsersModel,
    NfcOrderModel,
    NfcOrderStatusModel
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed initial data
    seed_initial_data()
    yield
    # Shutdown logic if any


app = FastAPI(title="Skill Jobs API (Python)", lifespan=lifespan)

# CORS Middleware
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
if allowed_origins_env.strip() == "*":
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"^https?:\/\/.*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    cors_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
# Health check and root route

@app.get("/")
def root():
    db_status = "Connected" if get_db_connection() else "Offline (using Persistent JSON Database Fallback)"
    return f"Skill Jobs API is running. Database Status: {db_status}"


# ==============================================================================
# EVENTS CRUD ROUTES
# ==============================================================================

@app.get("/api/events")
def get_events():
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                events = db.query(SQLEvent).order_by(SQLEvent.createdAt.desc()).all()
                formatted = []
                for e in events:
                    obj = format_doc(e)
                    if not obj.get("status"):
                        try:
                            obj["status"] = "Completed" if datetime.strptime(obj.get("date", ""), "%B %d, %Y") < datetime.now() else "Upcoming"
                        except Exception:
                            obj["status"] = "Upcoming"
                    if obj.get("regLink") is None:
                        obj["regLink"] = ""
                    formatted.append(obj)
                return formatted
            except Exception as err:
                print(f"MySQL error fetching events, falling back: {err}")
            finally:
                db.close()

    # Fallback to local database
    formatted_local = []
    for e in local_db.get("events", []):
        obj = dict(e)
        if not obj.get("status"):
            obj["status"] = "Upcoming"
        if obj.get("regLink") is None:
            obj["regLink"] = ""
        formatted_local.append(obj)
    return formatted_local


@app.post("/api/events", status_code=status.HTTP_201_CREATED)
def create_event(event: EventModel):
    event_status = event.status or "Upcoming"
    payload = event.dict()
    payload["status"] = event_status
    now_str = datetime.now().isoformat()
    new_id = "evt-" + "".join(random.choices(string.ascii_lowercase + string.digits, k=9))

    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                sql_evt = SQLEvent(
                    id=new_id,
                    title=event.title,
                    date=event.date,
                    time=event.time,
                    location=event.location,
                    image=event.image,
                    category=event.category,
                    status=event_status,
                    regLink=event.regLink,
                    createdAt=now_str,
                    updatedAt=now_str
                )
                db.add(sql_evt)
                db.commit()
                db.refresh(sql_evt)
                return {"message": "Event created successfully!", "event": format_doc(sql_evt)}
            except Exception as err:
                db.rollback()
                print(f"Database error creating event, saving locally: {err}")
            finally:
                db.close()

    # Fallback to local database
    new_local = {
        "_id": new_id,
        **event.dict(),
        "status": event_status,
        "createdAt": now_str
    }
    if "events" not in local_db:
        local_db["events"] = []
    local_db["events"].insert(0, new_local)
    save_local_database()
    return {"message": "Event created locally!", "event": new_local}


@app.put("/api/events/{id}")
def update_event(id: str, event: EventModel):
    payload = event.dict()
    now_str = datetime.now().isoformat()

    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                sql_evt = db.query(SQLEvent).filter(SQLEvent.id == id).first()
                if sql_evt:
                    sql_evt.title = event.title
                    sql_evt.date = event.date
                    sql_evt.time = event.time
                    sql_evt.location = event.location
                    sql_evt.image = event.image
                    sql_evt.category = event.category
                    sql_evt.status = event.status or sql_evt.status or "Upcoming"
                    sql_evt.regLink = event.regLink
                    sql_evt.updatedAt = now_str
                    db.commit()
                    db.refresh(sql_evt)
                    return {"message": "Event updated successfully!", "event": format_doc(sql_evt)}
            except Exception as err:
                db.rollback()
                print(f"Database error updating event: {err}")
            finally:
                db.close()

    # Fallback to local database
    events_list = local_db.get("events", [])
    for idx, e in enumerate(events_list):
        if str(e.get("_id")) == id or str(e.get("id")) == id:
            updated_local = {**e, **payload, "status": event.status or e.get("status", "Upcoming"), "updatedAt": now_str}
            local_db["events"][idx] = updated_local
            save_local_database()
            return {"message": "Event updated locally!", "event": updated_local}

    raise HTTPException(status_code=404, detail="Event not found.")


@app.delete("/api/events/{id}")
def delete_event(id: str):
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                sql_evt = db.query(SQLEvent).filter(SQLEvent.id == id).first()
                if sql_evt:
                    deleted_doc = format_doc(sql_evt)
                    db.delete(sql_evt)
                    db.commit()
                    return {"message": "Event deleted successfully!", "event": deleted_doc}
            except Exception as err:
                db.rollback()
                print(f"Database error deleting event: {err}")
            finally:
                db.close()

    # Fallback to local database
    events_list = local_db.get("events", [])
    for idx, e in enumerate(events_list):
        if str(e.get("_id")) == id or str(e.get("id")) == id:
            deleted_local = local_db["events"].pop(idx)
            save_local_database()
            return {"message": "Event deleted locally!", "event": deleted_local}

    raise HTTPException(status_code=404, detail="Event not found.")


# ==============================================================================
# AMBASSADOR CRUD ROUTES
# ==============================================================================

@app.get("/api/ambassadors")
def get_ambassadors():
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                apps = db.query(SQLAmbassador).order_by(SQLAmbassador.createdAt.desc()).all()
                return [format_doc(a) for a in apps]
            except Exception as err:
                print(f"MySQL error fetching ambassadors, falling back: {err}")
            finally:
                db.close()
    return local_db.get("ambassadors", [])


@app.post("/api/ambassador/apply", status_code=status.HTTP_201_CREATED)
def apply_ambassador(app_data: AmbassadorModel):
    app_status = app_data.status or "Pending"
    now_str = datetime.now().isoformat()
    new_id = "amb-" + "".join(random.choices(string.ascii_lowercase + string.digits, k=9))

    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                sql_amb = SQLAmbassador(
                    id=new_id,
                    name=app_data.name,
                    email=app_data.email,
                    university=app_data.university,
                    reason=app_data.reason,
                    status=app_status,
                    phone=getattr(app_data, 'phone', None),
                    dept=getattr(app_data, 'dept', None),
                    year=getattr(app_data, 'year', None),
                    linkedin=getattr(app_data, 'linkedin', None),
                    role=getattr(app_data, 'role', None),
                    image=getattr(app_data, 'image', None),
                    createdAt=now_str
                )
                db.add(sql_amb)
                db.commit()
                db.refresh(sql_amb)
                return {"message": "Application submitted successfully!", "application": format_doc(sql_amb)}
            except Exception as err:
                db.rollback()
                print(f"Database error submitting ambassador app: {err}")
            finally:
                db.close()

    # Fallback to local database
    new_local = {
        "_id": new_id,
        **app_data.dict(),
        "status": app_status,
        "createdAt": now_str
    }
    if "ambassadors" not in local_db:
        local_db["ambassadors"] = []
    local_db["ambassadors"].insert(0, new_local)
    save_local_database()
    return {"message": "Application submitted locally!", "application": new_local}


@app.post("/api/auth/register")
def register_user(reg_data: UserRegisterModel):
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                # Check if exists
                existing = db.query(SQLUser).filter(SQLUser.email == reg_data.email).first()
                if existing:
                    raise HTTPException(status_code=400, detail="Email already registered")
                
                new_id = f"usr_{int(time.time()*1000)}"
                now_str = datetime.now().isoformat()
                sql_user = SQLUser(
                    id=new_id,
                    name=reg_data.name,
                    email=reg_data.email,
                    password=reg_data.password,
                    role="Participant",
                    createdAt=now_str
                )
                db.add(sql_user)
                db.commit()
                db.refresh(sql_user)
                return {"message": "Registration successful", "user": format_doc(sql_user)}
            except HTTPException:
                raise
            except Exception as err:
                db.rollback()
                print(f"Database error during register: {err}")
                raise HTTPException(status_code=500, detail="Internal server error")
            finally:
                db.close()
                
    # Fallback local
    users = local_db.get("users", [])
    for u in users:
        if u.get("email") == reg_data.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = {
        "_id": f"usr_{int(time.time()*1000)}",
        "name": reg_data.name,
        "email": reg_data.email,
        "password": reg_data.password,
        "role": "Participant",
        "createdAt": datetime.now().isoformat()
    }
    local_db.setdefault("users", []).append(new_user)
    save_local_database()
    return {"message": "Registration successful locally", "user": new_user}


@app.post("/api/auth/login")
@app.post("/api/users/login")
def login_user(login_data: UserLoginModel):
    clean_email = login_data.email.strip().lower()
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                user = db.query(SQLUser).filter(func.lower(SQLUser.email) == clean_email).first()
                if user and user.password == login_data.password:
                    doc = format_doc(user)
                    if isinstance(doc.get("permissions"), str):
                        try:
                            doc["permissions"] = json.loads(doc["permissions"])
                        except Exception:
                            doc["permissions"] = []
                    return {"message": "Login successful", "user": doc}
                else:
                    raise HTTPException(status_code=401, detail="Invalid administrator email or password.")
            except HTTPException:
                raise
            except Exception as err:
                print(f"Database error during login: {err}")
                raise HTTPException(status_code=500, detail="Internal server error")
            finally:
                db.close()

    # Fallback local
    users = local_db.get("users", [])
    for u in users:
        if u.get("email", "").strip().lower() == clean_email and u.get("password") == login_data.password:
            return {"message": "Login successful locally", "user": u}
            
    raise HTTPException(status_code=401, detail="Invalid administrator email or password.")


@app.put("/api/auth/update")
def update_user(update_data: UserUpdateModel):
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                user = db.query(SQLUser).filter(SQLUser.id == update_data.id).first()
                if not user:
                    raise HTTPException(status_code=404, detail="User not found")
                
                if user.email != update_data.email:
                    existing = db.query(SQLUser).filter(SQLUser.email == update_data.email).first()
                    if existing:
                        raise HTTPException(status_code=400, detail="Email already taken")
                
                user.name = update_data.name
                user.email = update_data.email
                if update_data.password:
                    user.password = update_data.password
                
                db.commit()
                db.refresh(user)
                return {"message": "Profile updated successfully", "user": format_doc(user)}
            except HTTPException:
                raise
            except Exception as err:
                db.rollback()
                print(f"Database error during update: {err}")
                raise HTTPException(status_code=500, detail="Internal server error")
            finally:
                db.close()
                
    users = local_db.get("users", [])
    for idx, u in enumerate(users):
        if u.get("_id") == update_data.id or u.get("id") == update_data.id:
            if u.get("email") != update_data.email:
                if any(other.get("email") == update_data.email for other in users):
                    raise HTTPException(status_code=400, detail="Email already taken")
            
            users[idx]["name"] = update_data.name
            users[idx]["email"] = update_data.email
            if update_data.password:
                users[idx]["password"] = update_data.password
            
            save_local_database()
            return {"message": "Profile updated locally", "user": users[idx]}
            
    raise HTTPException(status_code=404, detail="User not found")


# ==============================================================================
# USERS CRUD (ADMIN MANAGEMENT)
# ==============================================================================

@app.get("/api/users")
def get_all_users():
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                users = db.query(SQLUser).order_by(SQLUser.createdAt.desc()).all()
                result = []
                for u in users:
                    d = format_doc(u)
                    if isinstance(d.get("permissions"), str):
                        try:
                            d["permissions"] = json.loads(d["permissions"])
                        except Exception:
                            d["permissions"] = []
                    result.append(d)
                return result
            except Exception as err:
                print(f"Database error fetching users: {err}")
            finally:
                db.close()

    # Fallback local
    return local_db.get("users", [])


@app.post("/api/users", status_code=status.HTTP_201_CREATED)
def admin_create_user(user_data: AdminUserCreateModel):
    now_str = datetime.now().isoformat()
    new_id = f"usr_{int(time.time()*1000)}"
    perm_list = user_data.permissions if user_data.permissions is not None else [
        "users", "ambassadors", "ambassadortasks", "ambassadordashboard", 
        "homepage", "aboutpage", "ambassadorpage", "contactpage", "contactmessages"
    ]

    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                existing = db.query(SQLUser).filter(SQLUser.email == user_data.email).first()
                if existing:
                    raise HTTPException(status_code=400, detail="Email is already in use.")

                sql_user = SQLUser(
                    id=new_id,
                    name=user_data.name,
                    email=user_data.email,
                    password=user_data.password,
                    role=user_data.role or "Participant",
                    permissions=json.dumps(perm_list),
                    createdAt=now_str
                )
                db.add(sql_user)
                db.commit()
                db.refresh(sql_user)
                doc = format_doc(sql_user)
                doc["permissions"] = perm_list
                return {"message": "User created successfully!", "user": doc}
            except HTTPException:
                raise
            except Exception as err:
                db.rollback()
                print(f"Database error creating user: {err}")
                raise HTTPException(status_code=500, detail="Database insertion failed.")
            finally:
                db.close()

    # Fallback local
    users = local_db.get("users", [])
    if any(u.get("email") == user_data.email for u in users):
        raise HTTPException(status_code=400, detail="Email is already in use.")

    new_user = {
        "_id": new_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": user_data.password,
        "role": user_data.role or "Participant",
        "permissions": perm_list,
        "createdAt": now_str
    }
    local_db.setdefault("users", []).append(new_user)
    save_local_database()
    return {"message": "User created successfully!", "user": new_user}


@app.put("/api/users/{id}")
def admin_update_user(id: str, update_data: AdminUserUpdateModel):
    clean_email = update_data.email.strip().lower()
    
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                user = db.query(SQLUser).filter(or_(SQLUser.id == id, func.lower(SQLUser.email) == clean_email)).first()
                if user:
                    if user.email.strip().lower() != clean_email:
                        existing = db.query(SQLUser).filter(func.lower(SQLUser.email) == clean_email, SQLUser.id != user.id).first()
                        if existing:
                            raise HTTPException(status_code=400, detail="Email is already in use by another user.")

                    user.name = update_data.name
                    user.email = update_data.email
                    if update_data.role:
                        user.role = update_data.role
                    if update_data.password and update_data.password.strip():
                        user.password = update_data.password.strip()
                        amb = db.query(SQLAmbassador).filter(func.lower(SQLAmbassador.email) == clean_email).first()
                        if amb:
                            amb.password = update_data.password.strip()
                    if update_data.permissions is not None:
                        user.permissions = json.dumps(update_data.permissions)

                    db.commit()
                    db.refresh(user)
                    doc = format_doc(user)
                    if isinstance(doc.get("permissions"), str):
                        try:
                            doc["permissions"] = json.loads(doc["permissions"])
                        except Exception:
                            pass
                    return {"message": "User updated successfully!", "user": doc}
            except HTTPException:
                raise
            except Exception as err:
                db.rollback()
                print(f"Database error updating user: {err}")
            finally:
                db.close()

    # Fallback local
    users = local_db.get("users", [])
    for idx, u in enumerate(users):
        if str(u.get("_id")) == id or str(u.get("id")) == id or u.get("email", "").strip().lower() == clean_email:
            if u.get("email", "").strip().lower() != clean_email:
                if any(str(o.get("_id", o.get("id"))) != id and o.get("email", "").strip().lower() == clean_email for o in users):
                    raise HTTPException(status_code=400, detail="Email is already in use by another user.")

            users[idx]["name"] = update_data.name
            users[idx]["email"] = update_data.email
            if update_data.role:
                users[idx]["role"] = update_data.role
            if update_data.password and update_data.password.strip():
                users[idx]["password"] = update_data.password.strip()
                for amb in local_db.get("ambassadors", []):
                    if amb.get("email", "").strip().lower() == clean_email:
                        amb["password"] = update_data.password.strip()
            if update_data.permissions is not None:
                users[idx]["permissions"] = update_data.permissions

            save_local_database()
            return {"message": "User updated successfully!", "user": users[idx]}

    raise HTTPException(status_code=404, detail="User not found.")


@app.delete("/api/users/{id}")
def admin_delete_user(id: str):
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                user = db.query(SQLUser).filter(SQLUser.id == id).first()
                if not user:
                    raise HTTPException(status_code=404, detail="User not found.")

                db.delete(user)
                db.commit()
                return {"message": "User deleted successfully."}
            except HTTPException:
                raise
            except Exception as err:
                db.rollback()
                print(f"Database error deleting user: {err}")
                raise HTTPException(status_code=500, detail="Database deletion failed.")
            finally:
                db.close()

    # Fallback local
    users = local_db.get("users", [])
    initial_len = len(users)
    local_db["users"] = [u for u in users if str(u.get("_id")) != id and str(u.get("id")) != id]
    if len(local_db["users"]) < initial_len:
        save_local_database()
        return {"message": "User deleted successfully."}

    raise HTTPException(status_code=404, detail="User not found.")


@app.post("/api/users/bulk-delete")
def admin_bulk_delete_users(data: BulkDeleteUsersModel):
    ids_to_delete = set(str(i) for i in data.userIds)
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                users = db.query(SQLUser).filter(SQLUser.id.in_(ids_to_delete)).all()
                deleted_count = len(users)
                for u in users:
                    db.delete(u)
                db.commit()
                return {"message": f"{deleted_count} user accounts deleted successfully.", "deletedCount": deleted_count}
            except Exception as err:
                db.rollback()
                print(f"Database error bulk deleting users: {err}")
            finally:
                db.close()

    # Fallback local
    users = local_db.get("users", [])
    initial_len = len(users)
    local_db["users"] = [u for u in users if str(u.get("_id")) not in ids_to_delete and str(u.get("id")) not in ids_to_delete]
    deleted_count = initial_len - len(local_db["users"])
    save_local_database()
    return {"message": f"{deleted_count} user accounts deleted successfully.", "deletedCount": deleted_count}


@app.patch("/api/ambassadors/{id}")
def update_ambassador_status(id: str, status_data: AmbassadorStatusModel):
    if status_data.status not in ["Pending", "Approved", "Rejected"]:
        raise HTTPException(status_code=400, detail="Valid status is required.")

    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                sql_amb = db.query(SQLAmbassador).filter(SQLAmbassador.id == id).first()
                if sql_amb:
                    sql_amb.status = status_data.status
                    db.commit()
                    db.refresh(sql_amb)
                    return {"message": f"Application status updated to {status_data.status}!", "application": format_doc(sql_amb)}
            except Exception as err:
                db.rollback()
                print(f"Database error updating ambassador status: {err}")
            finally:
                db.close()

    # Fallback to local database
    ambs = local_db.get("ambassadors", [])
    for idx, a in enumerate(ambs):
        if str(a.get("_id")) == id or str(a.get("id")) == id:
            local_db["ambassadors"][idx]["status"] = status_data.status
            save_local_database()
            return {"message": f"Application status updated locally to {status_data.status}!", "application": local_db["ambassadors"][idx]}

    raise HTTPException(status_code=404, detail="Application not found.")


@app.put("/api/ambassadors/{id}")
def update_ambassador(id: str, ambassador_data: AmbassadorUpdateModel):
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                sql_amb = db.query(SQLAmbassador).filter(SQLAmbassador.id == id).first()
                if sql_amb:
                    # Update fields
                    if ambassador_data.name is not None:
                        sql_amb.name = ambassador_data.name
                    if ambassador_data.email is not None:
                        sql_amb.email = ambassador_data.email
                    if ambassador_data.phone is not None:
                        sql_amb.phone = ambassador_data.phone
                    if ambassador_data.university is not None:
                        sql_amb.university = ambassador_data.university
                    if ambassador_data.role is not None:
                        sql_amb.role = ambassador_data.role
                    if ambassador_data.dept is not None:
                        sql_amb.dept = ambassador_data.dept
                    
                    db.commit()
                    db.refresh(sql_amb)
                    return {"message": "Ambassador updated successfully!", "application": format_doc(sql_amb)}
            except Exception as err:
                db.rollback()
                print(f"Database error updating ambassador: {err}")
            finally:
                db.close()

    # Fallback to local database
    ambs = local_db.get("ambassadors", [])
    for idx, a in enumerate(ambs):
        if str(a.get("_id")) == id or str(a.get("id")) == id:
            if ambassador_data.name is not None:
                local_db["ambassadors"][idx]["name"] = ambassador_data.name
            if ambassador_data.email is not None:
                local_db["ambassadors"][idx]["email"] = ambassador_data.email
            if ambassador_data.phone is not None:
                local_db["ambassadors"][idx]["phone"] = ambassador_data.phone
            if ambassador_data.university is not None:
                local_db["ambassadors"][idx]["university"] = ambassador_data.university
            if ambassador_data.role is not None:
                local_db["ambassadors"][idx]["role"] = ambassador_data.role
            if ambassador_data.dept is not None:
                local_db["ambassadors"][idx]["dept"] = ambassador_data.dept
            
            save_local_database()
            return {"message": "Ambassador updated locally!", "application": local_db["ambassadors"][idx]}

    raise HTTPException(status_code=404, detail="Application not found.")



@app.delete("/api/ambassadors/{id}")
def delete_ambassador(id: str):
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                sql_amb = db.query(SQLAmbassador).filter(SQLAmbassador.id == id).first()
                if sql_amb:
                    deleted_doc = format_doc(sql_amb)
                    db.delete(sql_amb)
                    db.commit()
                    return {"message": "Application deleted successfully!", "application": deleted_doc}
            except Exception as err:
                db.rollback()
                print(f"Database error deleting ambassador app: {err}")
            finally:
                db.close()

    # Fallback to local database
    ambs = local_db.get("ambassadors", [])
    for idx, a in enumerate(ambs):
        if str(a.get("_id")) == id or str(a.get("id")) == id:
            deleted_local = local_db["ambassadors"].pop(idx)
            save_local_database()
            return {"message": "Application deleted locally!", "application": deleted_local}

    raise HTTPException(status_code=404, detail="Application not found.")


# ==============================================================================
# CONFIGS CRUD ROUTES
# ==============================================================================

@app.get("/api/configs")
def get_configs():
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                configs = db.query(SQLConfig).all()
                config_map = {}
                for c in configs:
                    try:
                        config_map[c.key] = json.loads(c.value)
                    except Exception:
                        config_map[c.key] = c.value
                return config_map
            except Exception as err:
                print(f"Database error fetching configs, using local fallback: {err}")
            finally:
                db.close()
    return local_db.get("configs", {})


@app.post("/api/configs")
def upsert_config(config: ConfigModel):
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                val_str = json.dumps(config.value, ensure_ascii=False) if isinstance(config.value, (dict, list)) else str(config.value)
                sql_cfg = db.query(SQLConfig).filter(SQLConfig.key == config.key).first()
                if sql_cfg:
                    sql_cfg.value = val_str
                    sql_cfg.updatedAt = datetime.now().isoformat()
                else:
                    sql_cfg = SQLConfig(key=config.key, value=val_str, updatedAt=datetime.now().isoformat())
                    db.add(sql_cfg)
                db.commit()
                db.refresh(sql_cfg)
                return {"message": f"Config {config.key} saved successfully!", "config": {"key": sql_cfg.key, "value": config.value}}
            except Exception as err:
                db.rollback()
                print(f"Database error saving config: {err}")
            finally:
                db.close()

    # Fallback to local database
    if "configs" not in local_db:
        local_db["configs"] = {}
    local_db["configs"][config.key] = config.value
    save_local_database()
    return {"message": f"Config {config.key} saved locally!", "key": config.key, "value": config.value}


# ==============================================================================
# CONTACT MESSAGES CRUD ROUTES
# ==============================================================================

@app.post("/api/contact", status_code=status.HTTP_201_CREATED)
def submit_contact(msg: MessageModel):
    now_str = datetime.now().isoformat()
    new_id = "msg-" + "".join(random.choices(string.ascii_lowercase + string.digits, k=9))

    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                sql_msg = SQLMessage(
                    id=new_id,
                    name=msg.name,
                    email=msg.email,
                    subject=msg.subject,
                    message=msg.message,
                    createdAt=now_str
                )
                db.add(sql_msg)
                db.commit()
                db.refresh(sql_msg)
                return {"message": "Message sent successfully!", "contactMessage": format_doc(sql_msg)}
            except Exception as err:
                db.rollback()
                print(f"Database error saving contact message: {err}")
            finally:
                db.close()

    # Fallback to local database
    new_local = {
        "_id": new_id,
        **msg.dict(),
        "createdAt": now_str
    }
    if "messages" not in local_db:
        local_db["messages"] = []
    local_db["messages"].insert(0, new_local)
    save_local_database()
    return {"message": "Message sent locally!", "contactMessage": new_local}


@app.get("/api/messages")
def get_messages():
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                messages = db.query(SQLMessage).order_by(SQLMessage.createdAt.desc()).all()
                return [format_doc(m) for m in messages]
            except Exception as err:
                print(f"MySQL error fetching messages, falling back: {err}")
            finally:
                db.close()
    return local_db.get("messages", [])


@app.delete("/api/messages/{id}")
def delete_message(id: str):
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                sql_msg = db.query(SQLMessage).filter(SQLMessage.id == id).first()
                if sql_msg:
                    deleted_doc = format_doc(sql_msg)
                    db.delete(sql_msg)
                    db.commit()
                    return {"message": "Message deleted successfully!", "contactMessage": deleted_doc}
            except Exception as err:
                db.rollback()
                print(f"Database error deleting contact message: {err}")
            finally:
                db.close()

    # Fallback to local database
    msgs = local_db.get("messages", [])
    for idx, m in enumerate(msgs):
        if str(m.get("_id")) == id or str(m.get("id")) == id:
            deleted_local = local_db["messages"].pop(idx)
            save_local_database()
            return {"message": "Message deleted locally!", "contactMessage": deleted_local}

    raise HTTPException(status_code=404, detail="Message not found.")


# ==============================================================================
# WORK REPORTS (AMBASSADOR SUBMISSIONS)
# ==============================================================================

@app.get("/api/work-reports")
def get_work_reports(ambassadorEmail: Optional[str] = None):
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                query = db.query(SQLWorkReport)
                if ambassadorEmail:
                    query = query.filter(SQLWorkReport.ambassadorEmail == ambassadorEmail)
                reports = query.order_by(SQLWorkReport.createdAt.desc()).all()
                return [format_doc(r) for r in reports]
            except Exception as err:
                print(f"Error fetching SQL work reports: {err}")
            finally:
                db.close()

    reports = local_db.get("workReports", [])
    if ambassadorEmail:
        return [r for r in reports if r.get("ambassadorEmail") == ambassadorEmail]
    return reports


@app.post("/api/work-reports")
def create_work_report(report_data: WorkReportModel):
    new_id = f"wr_{int(time.time() * 1000)}"
    created_at = report_data.createdAt or datetime.now().isoformat()
    
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                sql_report = SQLWorkReport(
                    id=new_id,
                    ambassadorEmail=report_data.ambassadorEmail or "",
                    ambassadorName=report_data.ambassadorName or "",
                    name=report_data.name,
                    email=report_data.email,
                    phone=report_data.phone,
                    institution=report_data.institution or "Campus Member",
                    status=report_data.status or "Pending",
                    createdAt=created_at
                )
                db.add(sql_report)
                db.commit()
                db.refresh(sql_report)
                return {"message": "Work report entry created successfully!", "workReport": format_doc(sql_report)}
            except Exception as err:
                db.rollback()
                print(f"Error creating SQL work report: {err}")
            finally:
                db.close()

    new_report = {
        "_id": new_id,
        "ambassadorEmail": report_data.ambassadorEmail or "",
        "ambassadorName": report_data.ambassadorName or "",
        "name": report_data.name,
        "email": report_data.email,
        "phone": report_data.phone,
        "institution": report_data.institution or "Campus Member",
        "status": report_data.status or "Pending",
        "createdAt": created_at
    }
    if "workReports" not in local_db:
        local_db["workReports"] = []
    local_db["workReports"].insert(0, new_report)
    save_local_database()
    return {"message": "Work report entry created successfully!", "workReport": new_report}


@app.put("/api/work-reports/{id}")
def update_work_report(id: str, update_data: WorkReportUpdateModel):
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                report = db.query(SQLWorkReport).filter(SQLWorkReport.id == id).first()
                if report:
                    if update_data.name is not None:
                        report.name = update_data.name
                    if update_data.email is not None:
                        report.email = update_data.email
                    if update_data.phone is not None:
                        report.phone = update_data.phone
                    if update_data.institution is not None:
                        report.institution = update_data.institution
                    if update_data.status is not None:
                        report.status = update_data.status
                    db.commit()
                    db.refresh(report)
                    return {"message": "Work report entry updated successfully!", "workReport": format_doc(report)}
            except Exception as err:
                db.rollback()
                print(f"Error updating SQL work report: {err}")
            finally:
                db.close()

    reports = local_db.get("workReports", [])
    for idx, r in enumerate(reports):
        if str(r.get("_id")) == id or str(r.get("id")) == id:
            if update_data.name is not None:
                reports[idx]["name"] = update_data.name
            if update_data.email is not None:
                reports[idx]["email"] = update_data.email
            if update_data.phone is not None:
                reports[idx]["phone"] = update_data.phone
            if update_data.institution is not None:
                reports[idx]["institution"] = update_data.institution
            if update_data.status is not None:
                reports[idx]["status"] = update_data.status
            save_local_database()
            return {"message": "Work report entry updated successfully!", "workReport": reports[idx]}
    raise HTTPException(status_code=404, detail="Work report entry not found.")


@app.patch("/api/work-reports/{id}/status")
@app.put("/api/work-reports/{id}/status")
def update_work_report_status(id: str, status_data: WorkReportStatusModel):
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                report = db.query(SQLWorkReport).filter(SQLWorkReport.id == id).first()
                if report:
                    report.status = status_data.status
                    db.commit()
                    db.refresh(report)
                    return {"message": f"Work report status updated to {status_data.status}!", "workReport": format_doc(report)}
            except Exception as err:
                db.rollback()
                print(f"Error updating SQL work report status: {err}")
            finally:
                db.close()

    reports = local_db.get("workReports", [])
    for idx, r in enumerate(reports):
        if str(r.get("_id")) == id or str(r.get("id")) == id:
            reports[idx]["status"] = status_data.status
            save_local_database()
            return {"message": f"Work report status updated to {status_data.status}!", "workReport": reports[idx]}
    raise HTTPException(status_code=404, detail="Work report entry not found.")


@app.delete("/api/work-reports/{id}")
def delete_work_report(id: str):
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                report = db.query(SQLWorkReport).filter(SQLWorkReport.id == id).first()
                if report:
                    formatted = format_doc(report)
                    db.delete(report)
                    db.commit()
                    return {"message": "Work report entry deleted successfully!", "workReport": formatted}
            except Exception as err:
                db.rollback()
                print(f"Error deleting SQL work report: {err}")
            finally:
                db.close()

    reports = local_db.get("workReports", [])
    for idx, r in enumerate(reports):
        if str(r.get("_id")) == id or str(r.get("id")) == id:
            deleted_report = local_db["workReports"].pop(idx)
            save_local_database()
            return {"message": "Work report entry deleted successfully!", "workReport": deleted_report}
    raise HTTPException(status_code=404, detail="Work report entry not found.")


# ==============================================================================
# NFC CARD ORDERS / APPLICATIONS ROUTES
# ==============================================================================

@app.get("/api/nfc-orders")
def get_nfc_orders():
    """Retrieve all NFC card applications/orders (newest first)."""
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                orders = db.query(SQLNfcOrder).order_by(SQLNfcOrder.createdAt.desc()).all()
                return [format_doc(o) for o in orders]
            except Exception as err:
                print(f"Database error fetching NFC orders: {err}")
            finally:
                db.close()

    # Fallback to local
    orders = local_db.get("nfcOrders", [])
    return sorted(orders, key=lambda x: str(x.get("createdAt", "")), reverse=True)


@app.post("/api/nfc-orders")
def create_nfc_order(order_data: NfcOrderModel):
    """Submit a new NFC card application/order."""
    new_id = order_data.id if (order_data.id and order_data.id.strip()) else f"NFC-{random.randint(100000, 999999)}"
    now_iso = order_data.createdAt if order_data.createdAt else datetime.now().isoformat()

    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                sql_order = SQLNfcOrder(
                    id=new_id,
                    customerName=order_data.customerName,
                    customerEmail=order_data.customerEmail,
                    customerPhone=order_data.customerPhone,
                    deliveryAddress=order_data.deliveryAddress,
                    district=order_data.district or "Dhaka",
                    cardVariantId=order_data.cardVariantId,
                    cardVariantName=order_data.cardVariantName,
                    customNameOnCard=order_data.customNameOnCard,
                    customRoleOnCard=order_data.customRoleOnCard,
                    customOrgOnCard=order_data.customOrgOnCard,
                    paymentMethod=order_data.paymentMethod or "bkash",
                    trxId=order_data.trxId or "",
                    ambassadorCode=order_data.ambassadorCode or "",
                    notes=order_data.notes or "",
                    quantity=str(order_data.quantity or 1),
                    unitPrice=str(order_data.unitPrice or 0),
                    subtotal=str(order_data.subtotal or 0),
                    deliveryCharge=str(order_data.deliveryCharge or 0),
                    discountAmount=str(order_data.discountAmount or 0),
                    grandTotal=str(order_data.grandTotal or 0),
                    status=order_data.status or "Pending",
                    createdAt=now_iso
                )
                db.add(sql_order)
                db.commit()
                db.refresh(sql_order)
                return {"message": "NFC order placed successfully!", "order": format_doc(sql_order), "orderId": new_id}
            except Exception as err:
                db.rollback()
                print(f"Database error saving NFC order: {err}")
            finally:
                db.close()

    # Local fallback
    if "nfcOrders" not in local_db:
        local_db["nfcOrders"] = []
    
    order_dict = order_data.model_dump()
    order_dict["id"] = new_id
    order_dict["_id"] = new_id
    order_dict["createdAt"] = now_iso
    local_db["nfcOrders"].insert(0, order_dict)
    save_local_database()
    return {"message": "NFC order placed successfully (local fallback)!", "order": order_dict, "orderId": new_id}


@app.put("/api/nfc-orders/{order_id}/status")
def update_nfc_order_status(order_id: str, status_data: NfcOrderStatusModel):
    """Update status of an NFC order (Pending, Processing, Shipped, Delivered, Cancelled)."""
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                order = db.query(SQLNfcOrder).filter(SQLNfcOrder.id == order_id).first()
                if order:
                    order.status = status_data.status
                    db.commit()
                    db.refresh(order)
                    return {"message": "Order status updated successfully!", "order": format_doc(order)}
            except Exception as err:
                db.rollback()
                print(f"Database error updating NFC order status: {err}")
            finally:
                db.close()

    # Local fallback
    orders = local_db.get("nfcOrders", [])
    for o in orders:
        if str(o.get("id")) == order_id or str(o.get("_id")) == order_id:
            o["status"] = status_data.status
            save_local_database()
            return {"message": "Order status updated locally!", "order": o}

    raise HTTPException(status_code=404, detail="NFC Order not found.")


@app.delete("/api/nfc-orders/{order_id}")
def delete_nfc_order(order_id: str):
    """Delete an NFC order."""
    if get_db_connection():
        db = get_db_session()
        if db:
            try:
                order = db.query(SQLNfcOrder).filter(SQLNfcOrder.id == order_id).first()
                if order:
                    formatted = format_doc(order)
                    db.delete(order)
                    db.commit()
                    return {"message": "NFC order deleted successfully!", "order": formatted}
            except Exception as err:
                db.rollback()
                print(f"Database error deleting NFC order: {err}")
            finally:
                db.close()

    # Local fallback
    orders = local_db.get("nfcOrders", [])
    for idx, o in enumerate(orders):
        if str(o.get("id")) == order_id or str(o.get("_id")) == order_id:
            deleted = local_db["nfcOrders"].pop(idx)
            save_local_database()
            return {"message": "NFC order deleted locally!", "order": deleted}

    raise HTTPException(status_code=404, detail="NFC Order not found.")


