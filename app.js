// Node Basic Requires
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const GoogleImages = require('google-images');
const client = new GoogleImages('007733815140463231320:i_fnlkxqon0', 'AIzaSyA7pWcsUjrkQSDHQNukXJH79djUuAGiEHo');
// "49EB4B94127F7C7836C96DEB3F2CD8A6D12BDB71"
// Google API Key "AIzaSyA7pWcsUjrkQSDHQNukXJH79djUuAGiEHo"
// Connection To The Database
mongoose.connect('mongodb://localhost/imagesearch');
// Express Middleware
const app = express();
// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// Search Proccess
app.get('/search/imagesearch/:searchTerm/:offset?', (req, res, next) => {
    var searchTerm = req.params.searchTerm;
    var offset = req.params.offset;
    (offset == undefined) ? offset = 1 : offset ;
    // Search With The Google API
    client.search(searchTerm, {page: offset})
    .then(images => {
        let display = [];
        for(var i=0;i<images.length;i++){
            display.push({"url": images[i].url, "snippet": images[i].description, "thumbnail": images[i].thumbnail, "context": images[i].parentPage});
        }
        res.json(display);
    });
    });
// Server Start
app.listen(3000, () => {
    console.log('Server is on.');
});