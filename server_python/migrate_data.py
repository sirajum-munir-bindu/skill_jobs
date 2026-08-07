import json
import os
from database import SessionLocal, SQLEvent, SQLAmbassador, SQLMessage, SQLConfig

def migrate():
    db = SessionLocal()
    if not db:
        print("Could not connect to MySQL database.")
        return

    db_path = "in_memory_db.json"
    if not os.path.exists(db_path):
        print("in_memory_db.json not found.")
        return

    with open(db_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Migrate Events
    events = data.get("events", [])
    added_events = 0
    for e in events:
        # ID could be _id or id
        e_id = e.get("_id") or e.get("id")
        if not e_id: continue
        
        existing = db.query(SQLEvent).filter(SQLEvent.id == e_id).first()
        if not existing:
            new_evt = SQLEvent(
                id=e_id,
                title=e.get("title", ""),
                date=e.get("date", ""),
                time=e.get("time", ""),
                location=e.get("location", ""),
                image=e.get("image", ""),
                category=e.get("category", ""),
                status=e.get("status", "Upcoming"),
                regLink=e.get("regLink", ""),
                createdAt=e.get("createdAt", ""),
                updatedAt=e.get("updatedAt", "")
            )
            db.add(new_evt)
            added_events += 1

    # Migrate Ambassadors
    ambassadors = data.get("ambassadors", [])
    added_ambs = 0
    for a in ambassadors:
        a_id = a.get("_id") or a.get("id")
        if not a_id: continue
        
        existing = db.query(SQLAmbassador).filter(SQLAmbassador.id == a_id).first()
        if not existing:
            new_amb = SQLAmbassador(
                id=a_id,
                name=a.get("name", ""),
                email=a.get("email", ""),
                university=a.get("university", ""),
                reason=a.get("reason", ""),
                status=a.get("status", "Pending"),
                phone=a.get("phone", ""),
                dept=a.get("dept", ""),
                year=a.get("year", ""),
                linkedin=a.get("linkedin", ""),
                role=a.get("role", ""),
                image=a.get("image", ""),
                createdAt=a.get("createdAt", "")
            )
            db.add(new_amb)
            added_ambs += 1

    # Migrate Messages
    messages = data.get("messages", [])
    added_msgs = 0
    for m in messages:
        m_id = m.get("_id") or m.get("id")
        if not m_id: continue
        
        existing = db.query(SQLMessage).filter(SQLMessage.id == m_id).first()
        if not existing:
            new_msg = SQLMessage(
                id=m_id,
                name=m.get("name", ""),
                email=m.get("email", ""),
                subject=m.get("subject", ""),
                message=m.get("message", ""),
                createdAt=m.get("createdAt", "")
            )
            db.add(new_msg)
            added_msgs += 1

    try:
        db.commit()
        print(f"Successfully migrated: {added_events} Events, {added_ambs} Ambassadors, {added_msgs} Messages.")
    except Exception as e:
        db.rollback()
        print("Error during migration:", e)
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
