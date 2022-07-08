require('dotenv').config();

const fs = require('fs');
const mongoose = require('mongoose');
const File = require('./models/file');

const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error"));
db.once("open", () => {
    console.log("Database Connected");
});

async function deleteData() {
    const files = await File.find({ createdAt: { $lt: new Date(Date.now() - (24 * 60 * 60 * 1000)) }});

    if(files.length) {
        for(const file of files) {
            try {
                fs.unlinkSync(file.path);
                await file.remove();
                console.log(`Successfully deleted ${file.filename}`);
            }
            catch(err){
                console.log("Error", err);
            }
        }
    }

    console.log("No files older than 24 hours are there!!");
}

deleteData().then(process.exit);

// Run this script in Heroku Scheduler using "node delete_data_script.js"