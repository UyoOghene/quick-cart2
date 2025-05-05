if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo');
const User = require('./models/user');
const ExpressError = require('./utils/ExpressError');
const Item = require('./models/items');
const { isLoggedIn } = require('./middleware');

const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/quick-cart';

// Database connection
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000
})
.then(() => console.log("Database connected successfully"))
.catch(err => console.log("Database connection error:", err));

// Express configuration
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: mongoURI,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash messages and current user middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Routes
// const itemRoutes = require('./routes/items');
const authRoutes = require('./routes/auth');

// app.use('/items', itemRoutes);
// console.log('Routes mounted: /items, /');

app.use('/', authRoutes);


// Home route
// app.get('/', async (req, res) => {
//            res.render('home');

// });
app.get('/', async (req, res) => {
    try {
        let items = [];
        if (req.user) {
            items = await Item.find({ author: req.user._id })
                            .sort({ dateAdded: -1 })
                            .limit(3);
        }
        res.render('home', { items });
    } catch (e) {
        req.flash('error', 'Failed to load recent items');
        res.render('home', { items: [] });
    }
});


app.get('/items', isLoggedIn, async (req, res) => {
    const items = await Item.find({ author: req.user._id })
                          .populate('author')
                          .sort({ createdAt: -1 });
    
    // Add fallback for items without createdAt
    const itemsWithDates = items.map(item => {
        if (!item.createdAt) {
            item.createdAt = new Date(); // Set to current date if missing
        }
        return item;
    });

    res.render('items/index', { items: itemsWithDates });
});
app.post('/items', isLoggedIn, async (req, res) => {
    const { name, price } = req.body;
    const item = new Item({ name, price, author: req.user._id });
    await item.save();
    req.user.shoppingList.push(item);
    await req.user.save();
    res.redirect('/items');
});

// Edit Form
app.get('/items/:id/edit', isLoggedIn, async (req, res) => {
    const item = await Item.findById(req.params.id);
    res.render('items/edit', { item });
});

// Update Item
app.put('/items/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const item = await Item.findByIdAndUpdate(id, { ...req.body });
    res.redirect('/items');
});

app.delete('/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await Item.findByIdAndDelete(id);
    res.redirect('/items');
});

// // 404 handlerac
// app.all('*', (req, res, next) => {
//     next(new ExpressError('Page Not Found', 404));
// });

// // Error handler
// app.use((err, req, res, next) => {
//     const { statusCode = 500, message = 'Something went wrong' } = err;
//     res.status(statusCode).render('error', { err });
// });

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});