require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
const port = process.env.port || 3000;
mongoose.set('strictQuery', false); 

let ref = "jobs";
let jobs = "Find Job";


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


mongoose.connect(process.env.LOCAL_DATABASE + "/jobhunt", {useNewUrlParser: true});

const userSchema =new mongoose.Schema({
    name: String,
    email: String,
    userType: String,
    password: String,
});

const jobSchema =new mongoose.Schema({
    logo: String,
    companyName: String,
    jobTitle: String,
    location: String,
    salary: Number,
    shift: String,
    flexible_shifts: String,
    dateOfPost: Date,
    gender: String,
    education: String,
    experience: String,
    jobDescription: String,
    numberOfEmployees: Number
});

userSchema.plugin(passportLocalMongoose, {usernameField : "email"});

const User = new mongoose.model("User", userSchema);
const Job = new mongoose.model("Job", jobSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
  done(null, user);
});




app.get('/', (req, res)=>{

    if(req.isAuthenticated()){
        console.log('authenticated')
        User.findById({_id: req.user._id}).then((user, err)=>{
          if(err){
            console.log(err);
          }else{
            User.findById({_id: req.user._id}).select("_id, userType").then((user, err)=>{
                if(user.userType === "employer"){
                    ref = "postjob";
                    jobs = "Post Job";
                    res.render('home', {textButton: jobs, ref: ref});
                }else if(user.userType === "employee"){
                    res.render('home', {textButton: jobs, ref:ref});
                }
            });
          }
        })
      }else{
        res.render('home', {textButton: jobs, ref:ref});
      }
})

app.get('/about', (req, res)=>{
    res.render('about', {textButton: jobs, ref:ref});
})

app.get('/jobs', (req, res)=>{
    res.render('jobs', {textButton: jobs, ref:ref});
})

app.get('/contact', (req, res)=>{
    res.render('contact', {textButton: jobs, ref:ref});
})

app.get('/login', (req, res)=>{
    res.render('login', {textButton: jobs, ref:ref});
})


app.post('/login', (req, res)=>{
    const user = new User({
        username: req.body.email,
        password: req.body.password
      });
    
      req.login(user, (err)=>{
        if(err){
          console.log(err);
          res.redirect('/login');
        }else{
          passport.authenticate('local')(req, res, ()=>{
            console.log('logged in')
            res.redirect('/');
          });
        }
      });
})


app.get('/register', (req, res)=>{
    res.render('register', {textButton: jobs, ref:ref});
})


app.post('/register', (req, res)=>{
    User.register({
        name: req.body.name,
        userType: req.body.userType,
        email: req.body.email,
    }, req.body.password, (err, user)=>{
        if(err){
          console.log(err);
          res.redirect('/register');
        }else{
          passport.authenticate('local')(req, res, ()=>{
            console.log("signed up");
            res.redirect('/');
          });
        }
      });
});


app.get('/postjob', (req, res)=>{
    res.render('postjob', {textButton: jobs, ref:ref});
})

app.post('/postjob', (req, res)=>{
    const jobTitle = req.body.jobTitle;
    const jobLoc = req.body.jobLoc;
    const Salary = req.body.Salary;
    const shift = req.body.shift;
    const gender = req.body.gender;
    const education = req.body.education;
    const experience = req.body.experience;
    const jobDescription = req.body.jobDescription;
    const numberOfEmployees = req.body.numberOfEmployees;


    Job.insertMany([{

        jobTitle: jobTitle,
        jobLocation: jobLoc,
        Salary: Salary,
        shift: shift,
        gender: gender,
        education: education,
        experience: experience,
        jobDescription: jobDescription,
        numberOfEmployees: numberOfEmployees

    }]).then((data, err)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/jobs");
        }
    });
})

app.get('/viewjob', (req, res)=>{
    res.render('viewjob', {textButton: jobs, ref:ref});
})

app.listen(port, ()=>{
    console.log("server started...");
})