// Node Basic Requires
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const GoogleImages = require('google-images');
const client = new GoogleImages('007733815140463231320:i_fnlkxqon0', process.env.GOOGLE_API);
// Connection To The Database
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
// Express Middleware
const app = express();
// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// Setting Public Folder
app.use("/public", express.static(path.join(__dirname, 'public')));
// Logs Database Schema
const LogSchema = mongoose.Schema({
    search: String,
    date: String
});
// Compiling The Schema Into A Model
const Logs = mongoose.model('Logs', LogSchema);
// Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'index.html'));
});
// Search Proccess
app.get('/imagesearch/:searchTerm/:offset?', (req, res, next) => {
    var searchTerm = req.params.searchTerm;
    var offset = req.params.offset;
    (offset == undefined) ? offset = 1 : offset ;
    // Search With The Google API
    client.search(searchTerm, {page: offset})
    .then(images => {
        var d = new Date();
        let time = d.toLocaleDateString() + " " + d.toLocaleTimeString(); 
        let display = [];
        let log = new Logs({"search": searchTerm, "date": time});
        db.collection('recentSearches').insert(log);
        for(var i=0;i<images.length;i++){
            display.push({"url": images[i].url, "snippet": images[i].description, "thumbnail": images[i].thumbnail, "context": images[i].parentPage});
        }
        res.json(display);
    });
});
// Search History
app.get('/recent', (req, res) => {
    db.collection('recentSearches').find({}).toArray((err, doc) => {
        let display = [];
        for(var i=0;i<doc.length;i++){
            display.push({"term": doc[i].search, "when": doc[i].date});
        }
        res.json(display.reverse());
    });
});
// Server Start
app.listen(process.env.PORT || 80, () => {
    console.log('Server is on. I Hope');
});
