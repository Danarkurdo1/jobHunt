require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const port = process.env.port || 3000;
mongoose.set('strictQuery', false); 

// serve static Folder
const path = require('path');
app.use(express.static(__dirname + '/public'));


// serve views folder ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// mongo connection
mongoose.connect('mongodb://127.0.0.1/jobhunt', {useNewUrlParser: true});


app.get('/', (req, res)=>{
    res.render('home');
})

app.get('/about', (req, res)=>{
    res.render('about');
})

app.get('/jobs', (req, res)=>{
    res.render('jobs');
})

app.get('/contact', (req, res)=>{
    res.render('contact');
})

app.get('/login', (req, res)=>{
    res.render('login');
})


app.post('/login', (req, res)=>{
    
})


app.get('/register', (req, res)=>{
    res.render('register');
})


app.post('/register', (req, res)=>{
   
  });


app.get('/postjob', (req, res)=>{
    res.render('postjob');
})

app.listen(port, ()=>{
    console.log("server started...");
})