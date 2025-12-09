# model_loader.py
from collections.abc import Callable
import io
import torch
import asyncio
import torchvision.transforms as transforms
from PIL import Image

infer_transform: Callable[[Image.Image], torch.Tensor] = transforms.Compose([
    transforms.Resize((48, 48)),
    transforms.Grayscale(num_output_channels=1),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5], std=[0.5])
])

EMOTIONS = [
"Angry",
"Disgust",
"Fear",
"Happy",
"Sad",
"Surprise",
"Neutral"
]

class EmotionRecognitionModel:
    def __init__(self, path, version:str=""):
        self.path = path
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.version = version
        self.model = None

    async def load(self):
        loop = asyncio.get_running_loop()

        def _load():
            from model_def import CNN
            model = CNN()
            state = torch.load(self.path, map_location="cpu")
            model.load_state_dict(state)
            model.to(self.device)
            model.eval()
            return model

        self.model = await loop.run_in_executor(None, _load)



    async def predict(self, data, showClassName:bool=False):
        if self.model is None:
            raise RuntimeError("Model not loaded")
        
        if isinstance(data, Image.Image):
            img = data

        elif isinstance(data, (bytes, bytearray)):
            img = Image.open(io.BytesIO(data))

        elif isinstance(data, str):
            img = Image.open(data)

        else:
            raise TypeError("data must be PIL.Image, bytes, or filepath string")


        tensor: torch.Tensor = infer_transform(img)
        tensor = tensor.unsqueeze(0).to(self.device)

        loop = asyncio.get_running_loop()

        def _predict():
            with torch.no_grad():
                if self.model is None:
                    raise RuntimeError("Model not loaded")
                output = self.model(tensor)
                return output.argmax(dim=1).item()

        if showClassName is True:
            class_id = await loop.run_in_executor(None, _predict)
            return self.toClassName(class_id)
        else:
            return await loop.run_in_executor(None, _predict)

    def toClassName(self, class_id: int) -> str:
        return EMOTIONS[class_id]

