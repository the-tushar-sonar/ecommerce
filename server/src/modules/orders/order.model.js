import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  quantity: Number,
  price: Number
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [orderItemSchema],

    totalAmount: {
      type: Number,
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING"
    },

    orderStatus: {
      type: String,
      enum: ["CREATED", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "CREATED"
    },

    address: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
