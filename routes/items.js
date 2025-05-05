// const express = require('express');
// const router = express.Router();
// const Item = require('../models/items');
// const { isLoggedIn } = require('../middleware');

// router.get('/', isLoggedIn, async (req, res) => {
//     const items = await Item.find({ author: req.user._id });
//     res.render('items/index', { items });
// });

// router.post('/', isLoggedIn, async (req, res) => {
//     const { name, price } = req.body;
//     const item = new Item({ name, price, author: req.user._id });
//     await item.save();
//     req.user.shoppingList.push(item);
//     await req.user.save();
//     res.redirect('/items');
// });

// router.put('/:id', isLoggedIn, async (req, res) => {
//     const { id } = req.params;
//     const item = await Item.findByIdAndUpdate(id, { ...req.body });
//     res.redirect('/items');
// });

// router.delete('/:id', isLoggedIn, async (req, res) => {
//     const { id } = req.params;
//     await Item.findByIdAndDelete(id);
//     res.redirect('/items');
// });

// module.exports = router;