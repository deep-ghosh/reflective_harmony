import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Warning: SUPABASE_URL or SUPABASE_KEY not set in environment.")

supabase: Client = create_client(url, key) if url and key else None

async def save_user_emotion(user_id: str, emotion: str, timestamp: str) -> bool:
    """
    Saves the user emotion and timestamp to Supabase.
    """
    if not supabase:
        print("Supabase client not initialized. Cannot save data.")
        return False

    try:
        data = {
            "userId": user_id,
            "Emotion": emotion,
            "TimeStamp": timestamp
        }
        # execute() is synchronous in the current supabase-py client version usually, 
        # but we can wrap it or just call it. For high throughput, maybe async is better,
        # but for this worker, simple call is fine.
        response = supabase.table("user_emotion").insert(data).execute()
        
        # Check for success? The generic client raises exception on error usually 
        # or returns data.
        if response.data:
            print(f"Saved for userid {user_id}: {emotion}")
            return True
        else:
            print(f"Failed to save for {user_id}. Response: {response}")
            return False

    except Exception as e:
        print(f"Error saving to Supabase for {user_id}: {e}")
        return False
