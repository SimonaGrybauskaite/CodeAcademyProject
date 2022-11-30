const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();
const User = require("../Models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "namangargisaboy";
var fetchuser = require("../Middleware/fetchuser");

router.post(
  "/createuser",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Enter a valid password").isLength({ min: 5 }),
    body("mobileno", "Enter A valid 10 digit Mobile no").isLength({
      min: 10,
      max: 10,
    }),
  ],
  async (req, res) => {
    let success = false;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "Sorry user with this email already exist" });
      }
      user = await User.findOne({ mobileno: req.body.mobileno });
      if (user) {
        return res.status(400).json({
          success,
          error: "Sorry user with this mobile no already exist",
        });
      }
      
      const salt = await bcrypt.genSalt(10);
      const securepass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securepass,
        mobileno: req.body.mobileno,
      });
      
      const data = {
        user: {
          id: user.id,
        },
      };
      const jwttoken = jwt.sign(data, JWT_SECRET);
      console.log(jwttoken);
      success = true;
      res.json({ success, jwttoken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Some error occured");
    }
  }
);

router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success, error: "Please Enter correct Login credentials" });
      }
      if (user) {
        console.log("user exists");
        const Checkpassword = await bcrypt.compare(password, user.password);
        if (!Checkpassword) {
          success = false;
          return res.status(400).json({ success, error: "Incorrect Password" });
        }
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const jwttoken = jwt.sign(data, JWT_SECRET);
      success = true;
      console.log(jwttoken);
      res.json({ success, jwttoken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Some error occured");
    }
  }
);
router.get("/fetchuser", fetchuser, async (req, res) => {
  try {
    const notes = await User.findOne({ _id: req.user.id });
    res.json(notes);
  } catch {
    console.log(error.message);
    res.status(500).send("some error occured");
  }
});
router.get("/fetchalluser", async (req, res) => {
  try {
    const users = await User.find();

    return res.json(users);
  } catch {
    res.status(500).send("some error occured");
  }
});
router.post("/addfriend", fetchuser, async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { friend } = req.body;
  console.log(friend);
  try {
    const user = await User.findOne({ name: friend });

    if (!user) {
      return res
        .status(400)
        .json({ success, error: `No account exist with username ${friend}` });
    } else {
      success = true;
      const name = await User.findOne({ _id: req.user.id });
      name.friends.push(user.name);
      const namef = await User.findByIdAndUpdate(
        { _id: req.user.id },
        { $set: name },
        { new: false }
      );
      const name1 = await User.findOne({ _id: req.user.id });

      return res.json({ success, user, name1, friend });
    }
  } catch {
    res.status(500).send("some error occured");
  }
});
router.post("/addexpense", fetchuser, async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { balance, expenses, owe, owed } = req.body;
  try {
    success = true;
    const user = await User.findOne({ _id: req.user.id });
    user.balance = balance;
    user.expenses = expenses;
    user.owe = owe;
    user.owed = owed;
    const userf = await User.findByIdAndUpdate(
      { _id: req.user.id },
      { $set: user },
      { new: false }
    );
    const user3 = await User.findOne({ _id: req.user.id });
    return res.json({ success, user3 });
  } catch {
    res.status(500).send("some error occured please Check");
  }
});
router.post("/payment", async (req, res) => {
  console.log(process.env.RAZORPAY_KEY_ID);

  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
    console.log(req.body.amount);
    const options = {
      amount: req.body.amount * 100, 
      currency: "INR",
      receipt: "receipt_order_74394",
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");
    console.log(order);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});
router.post("/success", async (req, res) => {
  try {
    
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;
    console.log(req.body);
    
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);

    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

    const digest = shasum.digest("hex");

    
    console.log(digest, razorpaySignature);
    if (digest !== razorpaySignature) {
      console.log(res, "response");
      return res.status(400).json({ msg: "Transaction not legit!" });
    }

   

    res.json({
      msg: "success",
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
    });
    console.log(res.json);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});
router.get("/naman", (req, res) => {
  res.send("namna is brave");
});
module.exports = router;
