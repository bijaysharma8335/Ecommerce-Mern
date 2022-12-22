const router = require("express").Router();
const Order = require("../models/Order");
const user = require("../models/User");
const Schema = require("mongoose");

//creating orders
router.post("/", async (req, res) => {
    const io = req.app.get("socketio");
    const { userId, cart, country, address } = req.body;
    try {
        const user = await User.findById(userId);

        const order = await Order.create({
            owner: user._id,
            products: cart,
            country,
            address,
        });
        order.count = cart.count;
        order.total = cart.total;
        await order.save();
        user.cart = {
            total: 0,
            count: 0,
        };
        user.orders.push(order);
        io.socket.emit("orderCreated");
        const notification = {
            status: "unread",
            message: `Ne worder from ${user.name}`,
            time: new Date(),
        };
        io.sockets.emit("new-order", notification);
        user.markModified("orders");
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json(error.message);
    }
});

//getting all orders
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find().populate("owner", ["email", "name"]);
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).json(error.message);
    }
});

//shipping order
router.patch("/:id/mark-shipped", async (req, res) => {
    const io = req.app.get("socketio");
    const { ownerId } = req.body;
    const id = req.params;
    try {
        const user = await User.findById(ownerId);
        await Order.findByIdAndUpdate(id, { status: "shipped" });
        const orders = await Order.find().populate("owner", ["email", "name"]);
        const notification = {
            status: "unread",
            message: `Order ${id} shipped with success `,
            time: new Date(),
        };
        io.sockets.emit("notification", notification, ownerId);
        user.notification.unshift(notification);
        await user.save();
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).json(error.message);
    }
});

module.exports = router;