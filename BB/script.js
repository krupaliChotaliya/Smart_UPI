const Web3 = require("web3");
const axios = require("axios");
require("dotenv").config();

const web3 = new Web3("https://sepolia.infura.io/v3/YOUR_INFURA_KEY");
const contract = new web3.eth.Contract(contractABI, contractAddress);

async function sendUPIPayment(upiId, amount) {
  try {
    const response = await axios.post(
      "https://api.razorpay.com/v1/payouts",
      {
        account_number: "YOUR_BUSINESS_ACCOUNT",
        amount: amount * 100, 
        mode: "UPI",
        purpose: "escrow_payment",
        fund_account: {
          account_type: "vpa",
          vpa: upiId,
        },
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY,
          password: process.env.RAZORPAY_SECRET,
        },
      }
    );
    console.log("UPI Payment successful:", response.data);
  } catch (err) {
    console.error("UPI Payment failed:", err.response.data);
  }
}

// Listen for PaymentReleased → send to seller
contract.events.PaymentReleased({}, async (err, event) => {
  if (err) return console.error(err);

  const sellerUPI = event.returnValues.sellerUPI;
  const amount = web3.utils.fromWei(event.returnValues.amount, "ether");
  console.log(`Release to seller UPI: ${sellerUPI}, Amount: ${amount} ETH`);
  await sendUPIPayment(sellerUPI, amount);
});

// Listen for Refunded → send to buyer
contract.events.Refunded({}, async (err, event) => {
  if (err) return console.error(err);

  const buyerUPI = event.returnValues.buyerUPI;
  const amount = web3.utils.fromWei(event.returnValues.amount, "ether");
  console.log(`Refund to buyer UPI: ${buyerUPI}, Amount: ${amount} ETH`);
  await sendUPIPayment(buyerUPI, amount);
});
