'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const dateUtils = require(`${__dirname}/dateUtils.js`);

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

let listItems = [];
let workItems = [];

let currentDate = dateUtils.getDayName();
getList('/', currentDate, listItems);
getList('/work', 'Work list', workItems);

app.post('/', (req, res) => {
    let item = String(req.body.newItem).slice(0, 25);
    if (req.body.submitButton === 'Work') {
        workItems.push(item);
        res.redirect('/work');
    } else {
        listItems.push(item);
        res.redirect('/');
    }
});

app.listen(3000, () => {
    console.log('Server started');
});

function getList(path, title, items) {
    app.get(path, (req, res) => {
        res.render('list', {listTitle: title, listItems: items});
    }); 
}

function postItemToList(path, title, list) {
    app.post('/', (req, res) => {
        if (title.includes(req.body.submitButton)) {
            let item = String(req.body.newItem).slice(0, 25);
            list.push(item);
            res.redirect(path);
        }
    });
}