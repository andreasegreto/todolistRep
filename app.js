//jshint esversion:6 alias mongod="/c/Program\ Files/MongoDB/Server/6.0/bin/mongod.exe"
// alias mongosh="/c/Program\ Files/MongoDB/Server/6.0/bin/mongosh.exe"

const { name } = require("ejs");
const express = require("express");
const mongoose= require("mongoose")
const _=require("lodash")
const dotenv = require("dotenv").config({path:"vars/env"})

const app = express();
const PORT = process.env.PORT || 3000

const uri = process.env.MONGO_CONNECTION_STRING;

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    process.exit(1);
  }
}
  

const itemsSchema = new mongoose.Schema({
  
  name:  String
});

const Item=mongoose.model("item",itemsSchema)

 const uno=new Item({name:"yo"})
 const due=new Item({name:"pino"})
 const tre= new Item({name:"gino"})

const defaultItems=[uno,due,tre] 

 // Item.insertMany(defaultItems).then( docs => {});

app.get("/", function(req, res) {


  Item.find({}).then(foundItems =>{
    if (foundItems.length===0){Item.insertMany(defaultItems).then( docs => {})
    res.redirect("/");}
    else { res.render("list", {listTitle: "today", newListItems:foundItems})}}
  
  );

  
});


const listSchema = new mongoose.Schema({
  
  name:  String,
  items : [itemsSchema]
});
app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

 if(listName === "today"){
   Item.deleteOne({_id: checkedItem}).then(function () {
       console.log("Successfully deleted");
       res.redirect("/");
    })
    .catch(function (err) {
       console.log(err);
     });
 }else{
   let doc =  List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItem}}}, {
       new: true
     }).then(function (foundList)
     {
       res.redirect("/" + listName);
     }).catch( err => console.log(err));
 }
})



const List=mongoose.model("list",listSchema)

app.get("/:what", function(req,res){
  const customListName= _.capitalize(req.params.what) 

  List.findOne({name: customListName}) 
  .then((foundList)=> 
  {
     if(!foundList)
     {
       //Creating a new list 
       const list = new List({
         name: customListName,
         items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
     }
     else
     {
      
       res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
     }
  })
  .catch((err)=>{
    console.log(err);
  })
 }); 


 app.post("/", async(req, res)=>{

  const item = req.body.newItem;
  
  let listName = req.body.list

  const newItem= new Item({name:item})
  
  if (listName==="today"){
    newItem.save()
    res.redirect("/")
  }
  else{
     List.findOne({ name: listName }).exec().then(foundList => {
      
      console.log(  foundList )
     foundList.items.push(newItem)
     foundList.save()
      res.redirect("/" + listName)
   
  }).catch(err => { 
      console.log(err);
  });
  }
  
});



app.get("/about", function(req, res){
  res.render("about");
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("listening for requests");
    })
})


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started");
});