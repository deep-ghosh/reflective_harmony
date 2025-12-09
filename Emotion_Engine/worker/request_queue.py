import asyncio
from rich.console import Console
from rich.panel import Panel
from storage import KeyStorage
from decryption import decrypt_image
from model_loader import EmotionRecognitionModel
# from .external_client import send_result # Circular import risk? No, external_client is separate.
import datetime

class RequestQueue:
    def __init__(self, model: EmotionRecognitionModel, storage: KeyStorage):
        self.console = Console()
        self.queue = asyncio.Queue()
        self.model = model
        self.storage = storage
        self.running = False

    async def enqueue(self, uid: str, encrypted_image: bytes):
        await self.queue.put((uid, encrypted_image))

    async def start_worker(self):
        self.running = True
        print("Worker started")
        while self.running:
            try:
                uid, encrypted_image = await self.queue.get()
                await self.process_request(uid, encrypted_image)
                self.queue.task_done()
            except Exception as e:
                print(f"Worker error: {e}")

    async def process_request(self, uid: str, encrypted_image: bytes):
        print(f"Processing request for {uid}")
        
        # 1. Get Key
        key = self.storage.get_key(uid)
        if not key:
            print(f"Key not found for {uid}")
            return

        # 2. Decrypt
        try:
            image = decrypt_image(encrypted_image, key)
        except Exception as e:
            print(f"Decryption failed for {uid}: {e}")
            return

        # 3. Predict
        try:
            # model.predict is async
            # model.predict is async
            class_name = await self.model.predict(image, showClassName=True)
            self.console.print(Panel(f"[bold green]EMOTION DETECTED: {class_name}[/bold green]", title=f"Prediction for {uid}", expand=False))
        except Exception as e:
            print(f"Prediction failed for {uid}: {e}")
            return

        # 4. Send Result
        try:
            from supabase_client import save_user_emotion
            timestamp = datetime.datetime.now().isoformat()
            await save_user_emotion(uid, class_name, timestamp)
        except Exception as e:
            print(f"Failed to send result for {uid}: {e}")
