import json
from database import SessionLocal, SQLConfig

def update_infoblock():
    db = SessionLocal()
    try:
        config_record = db.query(SQLConfig).filter(SQLConfig.key == "infoBlocks").first()
        if not config_record:
            print("infoBlocks config not found in DB.")
            return

        info_blocks = json.loads(config_record.value)
        
        # Modify the second info block to be about completed events
        if len(info_blocks) > 1:
            info_blocks[1] = {
                "badge": "COMPLETED EVENTS",
                "title": "Relive Our Past Mega Seminars & Success Stories",
                "desc": "Explore highlights from our recently completed campus bootcamps, corporate summits, and national seminars. Witness real student transformations, project showcases, and how our alumni transitioned directly into top corporate roles.",
                "bullets": [
                    "Archived masterclass recordings and downloadable seminar slides",
                    "Alumni project highlights and live competition winners gallery",
                    "Direct placement stats and recruiter testimonials from past events"
                ],
                "btnText": "See our events",
                "btnLink": "/events",
                "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "reverse": True
            }
            
            config_record.value = json.dumps(info_blocks, ensure_ascii=False)
            db.commit()
            print("Successfully updated the second infoBlock in the database.")
        else:
            print("Not enough info blocks to update.")
    except Exception as e:
        db.rollback()
        print("Error updating database:", e)
    finally:
        db.close()

if __name__ == "__main__":
    update_infoblock()
