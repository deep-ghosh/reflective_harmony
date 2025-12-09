import grpc
from concurrent import futures
import asyncio
import sys
import os

# Add proto directory to path to import generated files
sys.path.append(os.path.join(os.path.dirname(__file__), '../proto'))

import interface_pb2
import interface_pb2_grpc

from storage import KeyStorage
from request_queue import RequestQueue
from model_loader import EmotionRecognitionModel

class EmotionService(interface_pb2_grpc.EmotionServiceServicer):
    def __init__(self, queue: RequestQueue, storage: KeyStorage):
        self.queue = queue
        self.storage = storage

    async def SendDecryptionKey(self, request, context):
        uid = request.uid
        key = request.key
        print(f"Received key for {uid}")
        success = self.storage.save_key(uid, key)
        return interface_pb2.StatusResponse(
            success=success,
            message="Key saved successfully" if success else "Failed to save key"
        )

    async def SendEncryptedImage(self, request, context):
        uid = request.uid
        encrypted_image = request.encrypted_image
        print(f"Received encrypted image for {uid}")
        
        await self.queue.enqueue(uid, encrypted_image)
        
        return interface_pb2.StatusResponse(
            success=True,
            message="Image queued for processing"
        )

    # Keeping original Predict for compatibility/testing
    async def Predict(self, request, context):
        # This might need to be adapted or removed if strictly following the new flow
        # For now, I'll leave it but it won't use the queue/decryption flow unless modified.
        # Given the requirements, the new flow is SendDecryptionKey -> SendEncryptedImage.
        return interface_pb2.EmotionResponse(uid=request.uid, class_name="Deprecated: Use SendEncryptedImage")

async def serve():
    # Initialize components
    storage = KeyStorage()
    model = EmotionRecognitionModel(path="models/model_v1.pth") # Adjust path as needed
    # We need to load the model. Since model.load is async, we do it here.
    
    print("Loading model...")
    try:
        await model.load()
        print("Model loaded.")
    except Exception as e:
        print(f"Failed to load model: {e}")
        print("Continuing anyway - model will fail predictions until loaded")

    queue = RequestQueue(model, storage)
    
    # Start queue worker
    worker_task = asyncio.create_task(queue.start_worker())

    server = grpc.aio.server()
    interface_pb2_grpc.add_EmotionServiceServicer_to_server(
        EmotionService(queue, storage), server
    )
    server.add_insecure_port("[::]:50051")
    print("gRPC server running on port 50051")
    
    await server.start()
    
    try:
        await server.wait_for_termination()
    finally:
        queue.running = False
        await worker_task

if __name__ == "__main__":
    asyncio.run(serve())
