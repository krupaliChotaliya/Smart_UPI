# dl_service.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib  # to load trained model (or use tensorflow/torch)

app = FastAPI()

# Example trained ML/DL model (replace with real one)
model = joblib.load("seller_safety_model.h5")

class Transaction(BaseModel):
    user_id: str
    product_id: str
    amount: float
    timestamp: str

@app.post("/predict")
def predict(transaction: Transaction):
    data = [[transaction.amount]]  
    prediction = model.predict(data)[0]

    if prediction == 0:  # 0 = safe, 1 = fraud
        return {"status": "safe"}
    else:
        return {"status": "fraud"}
