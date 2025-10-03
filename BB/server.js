const express = require("express");
const path = require("path");
const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Ensure your .env file is loaded and keys are correct
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

app.post("/create-order", async (req, res) => {
  const { amount, currency } = req.body;
  
  // NOTE: Razorpay amount must be in the smallest unit (Paise).
  const amountInPaise = amount * 100;

  try {
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency || "INR",
      receipt: "receipt_" + Date.now(),
      payment_capture: 1,
    });
    res.json({ order });
  } catch (err) {
    // CRITICAL: Log the actual error details from Razorpay/API
    console.error("Razorpay Order Creation Failed:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create order via Razorpay API.",
      details: err.error || err.message || "Unknown error" 
    });
  }
});

// The rest of the server code remains the same
// ... (The commented-out /trigger-payout is left commented)
app.post("/payment-webhook", async (req, res) => {
  console.log(req.body);
  res.status(200).send("OK");
});

app.use(express.static(path.join(__dirname, '')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '', 'index.html'));
// });

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

