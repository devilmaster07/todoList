const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://guru:guru3168@cluster0.jtvq4xm.mongodb.net/todolistDB");

const itemSchema = {
  name: String
}

const Item = mongoose.model('Item', itemSchema);

const  item1 = new Item({name : 'Buy_Food'});

const  item2 = new Item({name : 'Cook_Food'});

const  item3 = new Item({name : 'Eat_Food'});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  item: [itemSchema]
}

const List = mongoose.model('List', listSchema);

app.get("/", function(req, res) {

  Item.find({})
  .then(function(foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItems)
      .catch(function (err) {
        console.log(err);
      });
    res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
  .catch(function(err){
    console.log(err);
  })
});

app.post("/", (req, res) => {

  const item = new Item({name: req.body.newItem});
  
  const listName = req.body.list.trim();

  if (listName === "Today") {
    item.save();
    res.redirect('/');
  } else {
      List.findOne({ name: listName }).exec().then(foundList => {
        foundList.item.push(item);
          foundList.save();
          res.redirect('/' + listName);
      }).catch(err => {
          console.log(err);
      });
  }
})

app.post("/delete", function(req, res){

  const checkedId =  req.body.checkBox;

  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedId)
      .catch(function(err){
        console.log(err);
      })
    res.redirect("/");
  } else {
      List.findOneAndUpdate({name: listName}, {$pull: {item: {_id: checkedId}}})
      .then(function(){
        res.redirect("/"+listName);
      }).catch((err) => {
        console.log(err);
      });
  }   
});
app.get("/:customListName", function(req,res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName})
  .then(function(foundList){
    if (!foundList){
    const list = new List({
      name:customListName,
      item:defaultItems
    });
    list.save();
    console.log("saved");
    res.redirect("/"+customListName);
  } else {
      res.render("list",{listTitle:foundList.name, newListItems:foundList.item});
    }
  }).catch (function (err){
    console.log(err);
  })
});


app.listen(3000, function() {
  console.log("Server started...");
});
