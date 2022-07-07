require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const dbUrl = process.env.DB_URL;// || 'mongodb://localhost:27017/fileshare';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const app = express();
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const fileRoutes = require('./routes/files');
app.use('/api/files', fileRoutes);

const showRoutes = require('./routes/show');
app.use('/files/M_14', showRoutes);

const downloadRoutes = require('./routes/download');
app.use('/files/download', downloadRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})