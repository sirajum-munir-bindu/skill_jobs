import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import models from database
from database import (
    Base,
    SQLEvent,
    SQLAmbassador,
    SQLMessage,
    SQLConfig,
    SQLUser,
    SQLWorkReport,
    SQLNfcOrder
)

def sync_data(cloud_db_url: str):
    local_url = "mysql+pymysql://root:@127.0.0.1:3306/bindu_db"
    
    print(f"Connecting to Local MySQL ({local_url})...")
    local_engine = create_engine(local_url, pool_pre_ping=True)
    LocalSession = sessionmaker(bind=local_engine)
    local_session = LocalSession()

    print(f"Connecting to Cloud Database...")
    cloud_engine = create_engine(cloud_db_url, pool_pre_ping=True)
    CloudSession = sessionmaker(bind=cloud_engine)
    cloud_session = CloudSession()

    tables = [
        ("site_configs", SQLConfig, "key"),
        ("users", SQLUser, "id"),
        ("events", SQLEvent, "id"),
        ("ambassadors", SQLAmbassador, "id"),
        ("messages", SQLMessage, "id"),
        ("work_reports", SQLWorkReport, "id"),
        ("nfc_orders", SQLNfcOrder, "id")
    ]

    for table_name, model_cls, id_attr in tables:
        try:
            local_records = local_session.query(model_cls).all()
            print(f"Transferring {table_name} ({len(local_records)} records)...")
            for rec in local_records:
                data = {c.name: getattr(rec, c.name) for c in model_cls.__table__.columns}
                id_val = data.get(id_attr)
                
                # Check if exists in cloud
                existing = cloud_session.query(model_cls).filter(getattr(model_cls, id_attr) == id_val).first()
                if existing:
                    # Update fields
                    for k, v in data.items():
                        setattr(existing, k, v)
                else:
                    # Insert new
                    new_item = model_cls(**data)
                    cloud_session.add(new_item)
            cloud_session.commit()
            print(f"✓ {table_name} synchronized successfully.")
        except Exception as e:
            cloud_session.rollback()
            print(f"✗ Error syncing {table_name}: {e}")

    local_session.close()
    cloud_session.close()
    print("\n🎉 ALL REAL DATA (Ambassadors, Users, NFC Orders, Events) SYNCHRONIZED TO CLOUD DATABASE!")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1].strip() != "YOUR_TIDB_DATABASE_URL":
        target_url = sys.argv[1].strip()
    else:
        target_url = input("Paste your TiDB DATABASE_URL from Render: ").strip()

    # Clean quotes if user pasted with quotes
    target_url = target_url.strip('"').strip("'")

    if target_url.startswith("mysql://"):
        target_url = target_url.replace("mysql://", "mysql+pymysql://", 1)

    if not target_url.startswith("mysql+pymysql://"):
        print("Error: The URL must start with mysql+pymysql://")
        sys.exit(1)

    sync_data(target_url)
