require("dotenv").config();
const mongoose = require("mongoose");
const Order    = require("../models/Order");
const User     = require("../models/User");

async function backfill() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const orders = await Order.find({
    $or: [
      { customerPhone: { $exists: false } },
      { customerPhone: "No contact"       },
      { customerPhone: "undefined"        },
      { customerPhone: null               },
    ]
  });

  console.log(`Found ${orders.length} orders to backfill`);

  let updated = 0;

  for (const order of orders) {
    const user = await User.findById(order.customerId).select("name phoneNumber");
    if (!user) { console.log(`✗ No user found for order ${order._id}`); continue; }

    await Order.findByIdAndUpdate(order._id, {
      customerName:  user.name        || order.customerName,
      customerPhone: user.phoneNumber || "No contact",
    });

    updated++;
    console.log(`✔ ${user.name} — ${user.phoneNumber}`);
  }

  console.log(`\nDone. Updated ${updated}/${orders.length} orders.`);
  mongoose.disconnect();
}

backfill().catch(console.error);