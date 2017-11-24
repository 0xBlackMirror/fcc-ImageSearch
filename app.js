// Node Basic Requires
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const GoogleImages = require('google-images');
const client = new GoogleImages('007733815140463231320:i_fnlkxqon0', process.env.API_KEY);
// Connection To The Database
mongoose.connect('mongodb://localhost/imagesearch' || process.env.DB);
const db = mongoose.connection;
// Express Middleware
const app = express();
// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// Logs Database Schema
const LogSchema = mongoose.Schema({
    search: String,
    date: String
});
// Compiling The Schema Into A Model
const Logs = mongoose.model('Logs', LogSchema);
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
app.listen(process.env.PORT || 3000, () => {
    console.log('Server is on.');
});