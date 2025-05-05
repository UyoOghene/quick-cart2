require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/items');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/quick-cart';

async function migrateDates() {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        const items = await Item.find({ createdAt: { $exists: false } });
        let count = 0;
        
        for (const item of items) {
            item.createdAt = item.dateAdded || new Date();
            await item.save();
            count++;
        }
        
        console.log(`Successfully migrated ${count} items`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrateDates();