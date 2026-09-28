import Razorpay from "razorpay";

import { env } from "./env.js";

const razorpay = new Razorpay({
  key_id: env.razorpay.keyId,
  key_secret: env.razorpay.keySecret,
});

export default razorpay;
