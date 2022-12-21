const router = require("express").Router();
const User = require("../models/User");
const Order = require("../models/Order");

//signup user
router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = await User.create({ name, email, password });
        res.json(user);
    } catch (e) {
        if (e.code === 11000)
            return res.status(400).send("Email already exists");
        res.status(400).send(e.message);
    }
});

//login user
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByCredentials(email, password);

        res.json(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

//get users
router.get("/", async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false }).populate("orders");
        res.json(users);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

//get user orders
router.get("/:id/orders", async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).populate("orders");
        res.status(200).json(user.orders);
    } catch (error) {
        res.status(400).json(error.message);
    }
});
module.exports = router;
