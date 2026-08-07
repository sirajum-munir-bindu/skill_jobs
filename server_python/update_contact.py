import json
from database import SessionLocal, SQLConfig

def update_contact():
    db = SessionLocal()
    try:
        config_record = db.query(SQLConfig).filter(SQLConfig.key == "contact").first()
        if not config_record:
            print("contact config not found in DB.")
            return

        contact_info = json.loads(config_record.value)
        contact_info["phone"] = "01847-334785"
        contact_info["email"] = "corporate2@skill.jobs"
        
        config_record.value = json.dumps(contact_info, ensure_ascii=False)
        db.commit()
        print("Successfully updated contact info in the database.")
    except Exception as e:
        db.rollback()
        print("Error updating database:", e)
    finally:
        db.close()

if __name__ == "__main__":
    update_contact()
