//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const port = 3000;
const mongoose = require('mongoose');
const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
}

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home");
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/register", (req, res) => {
        res.render("register");
    });

app.post("/register", (req,res) => {

        bcrypt.hash(req.body.password, saltRounds, function(err, hash){
            const newUser = new User({
                email: req.body.username,
                password: hash
            });
    
            newUser.save()
            .then(function(){
                res.render("secrets");
            })
            .catch(function(err){
                console.log(err);
            })
        });
});

app.post("/login", (req,res) =>{
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username})
        .then(function(foundUser){
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if (result === true) {
                        res.render("secrets");
                    }
                });
            }
        })
        .catch(function(err) {
            console.log(err);
        })
})

app.listen(port, () => {
    console.log('Example app listening on port ($port)')
})