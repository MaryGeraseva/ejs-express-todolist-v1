'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/todoListDB', {
    useNewUrlParser: true
});

const itemSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'DB record should contains itemContent']
    }
});

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
    content: 'Hit + button to add'
});

const item2 = new Item({
    content: '<= Tick checkbox to delete'
});

const defaultList = [item1, item2];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model('List', listSchema);

app.get('/', (req, res) => {
    Item.find({}, (err, foundItems) => {
        if (foundItems.length === 0) {
            Item.insertMany(defaultList, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("successfully added")
                }
            });
        } else {
            res.render('list', {
                listTitle: 'Today',
                listItems: foundItems
            });
        }
    });
});

app.get('/:customListName', (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultList
                });
                list.save();
                res.redirect(`/${customListName}`);
            } else {
                res.render('list', {
                    listTitle: foundList.name,
                    listItems: foundList.items
                });
            }   
        }
    });
});

app.post('/', (req, res) => {
    const itemContent = String(req.body.newItem).slice(0, 25);
    const currentListName = req.body.submitButton;
    console.log(currentListName);
    const item = new Item({
        content: itemContent
    });
    if(currentListName === 'Today') {
        item.save();
        res.redirect('/');
    } else {
        List.findOne({name: currentListName}, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect(`/${currentListName}`);
        });
    }
});

app.post('/delete', (req, res) => {
    const itemId = req.body.checkbox;
    const currentListName = req.body.listName;
    if(currentListName === 'Today') {
        Item.findByIdAndRemove(itemId, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log(`${itemId} successfully deleted`)
            }
        });
        res.redirect('/');
    } else {
        List.findOneAndUpdate({name: currentListName}, {$pull: {items: {_id: itemId}}} , (err, foundList) => {
            if(!err) {
                res.redirect(`/${foundList.name}`);
            }
        });
    }
});

app.listen(3000, () => {
    console.log('Server started');
});