//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const port = 3000;
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

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

const secret = "Thisismylittlesecretdonotshareever";

userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']});

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
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });

        newUser.save()
        .then(function(){
            res.render("secrets");
        })
        .catch(function(err){
            console.log(err);
        })
});

app.post("/login", (req,res) =>{
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username})
        .then(function(foundUser){
            if (foundUser.password === password) {
                res.render("secrets");
            }
        })
        .catch(function(err) {
            console.log(err);
        })
})

app.listen(port, () => {
    console.log('Example app listening on port ($port)')
})