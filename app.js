//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const port = 3000;
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

app.set('trust proxy', 1) // trust first proxy

app.use(session({
  secret: 'I believe in the future of agriculture.',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
}

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.serializeUser((user,done) => {
    process.nextTick(() => {
        done(null, {id: user._id, username: user.username});
    });
});

passport.deserializeUser((user,done) =>{
    process.nextTick(() => {
        return done(null, user);
    });
});

app.get("/", (req, res) => {
    res.render("home");
})

app.get("/login", (req, res, next) => {
    res.render("login");
});

app.get("/register", (req, res) => {
        res.render("register");
    });

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login")
    }
});

app.get("/logout", (req, res, next) => {
    req.logout(function(err){
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});


app.post("/register", async (req,res) => {
    try {
        const registerUser = await User.register(
            {username: req.body.username}, req.body.password
        );

        if (registerUser) {
            passport.authenticate("local") (req, res, function() {
                res.redirect("/secrets");
            });
        } else {
            res.redirect("/register");
        }
    } catch (err) {
        res.send(err);
    }
});

app.post("/login", (req,res) =>{
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
}); 



app.listen(port, () => {
    console.log('Example app listening on port ($port)')
})