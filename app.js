require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const port = process.env.port || 3000;
mongoose.set('strictQuery', false); 

let ref = "jobs";
let jobs = "Find Job";
const logoutHtml = 'style="display: inline;"';
const deleteBtnDsip = logoutHtml;

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

const favoriteSchema = new mongoose.Schema({
    jobId: String,
})

const userSchema =new mongoose.Schema({
    name: String,
    email: String,
    userType: String,
    password: String,
    googleId: String,
    favorites: [favoriteSchema],
});

const jobSchema =new mongoose.Schema({
    logo: String,
    companyName: String,
    jobTitle: String,
    location: String,
    salary: String,
    shift: String,
    dateOfPost: String,
    gender: String,
    education: String,
    experience: String,
    jobDescription: String,
    numberOfEmployees: Number
});

userSchema.plugin(passportLocalMongoose, {usernameField : "email"});
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Job = new mongoose.model("Job", jobSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Google oauth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.callbackURL
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id,
                        userType: "employee",
                        name: profile.displayName,
                        email: profile._json.email,
                        }, function (err, user) {
      return cb(err, user);
    });
  }
  ));



app.get('/', (req, res)=>{

    if(req.isAuthenticated()){
        console.log('authenticated')
        User.findById({_id: req.user._id}).then((user, err)=>{
          if(err){
            console.log(err);
          }else{
            User.findById({_id: req.user._id}).select("_id, userType").then((user, err)=>{
                if(user.userType === "admin"){
                    ref = "postjob";
                    jobs = "Post Job";
                    Job.find().limit(6).then((lastJobs, err)=>{
                        if(err){
                            console.log(err);
                        }else{
                            res.render('home', {textButton: jobs, ref: ref, lastJobs: lastJobs, logoutHtml:logoutHtml});
                        }
                    });
                }else if(user.userType === "employee"){
                    Job.find().limit(6).then((lastJobs, err)=>{
                        if(err){
                            console.log(err);
                        }else{
                            res.render('home', {textButton: jobs, ref: ref, lastJobs: lastJobs, logoutHtml:logoutHtml});
                        }
                    });
                }
            });
          }
        })
      }else{
        Job.find().limit(6).then((lastJobs, err)=>{
            if(err){
                console.log(err);
            }else{
                res.render('home', {textButton: jobs, ref: ref, lastJobs: lastJobs, logoutHtml:""});
            }
        });
      }
})

app.get('/about', (req, res)=>{
    if(req.isAuthenticated()){
        console.log('authenticated')
        User.findById({_id: req.user._id}).then((user, err)=>{
          if(err){
            console.log(err);
          }else{
            res.render('about', {textButton: jobs, ref:ref, logoutHtml:logoutHtml});
          }
        })
      }else{
        res.render('about', {textButton: jobs, ref:ref, logoutHtml:""});
      }
})

app.get('/jobs', (req, res)=>{

    if(req.isAuthenticated()){
        console.log('authenticated')
        User.findById({_id: req.user._id}).then((user, err)=>{
          if(err){
            console.log(err);
          }else{
            if(user.userType === "admin"){
                Job.find().exec().then((allJobs, err)=>{
                    if(err){
                        console.log(err);
                    }else{
                        res.render('jobs', {textButton: jobs, ref:ref, allJobs: allJobs, logoutHtml:logoutHtml, deleteBtnDsip: deleteBtnDsip, userType: user.userType});
                    }
                });
            }else{
                Job.find().exec().then((allJobs, err)=>{
                    if(err){
                        console.log(err);
                    }else{
                        res.render('jobs', {textButton: jobs, ref:ref, allJobs: allJobs, logoutHtml:logoutHtml, deleteBtnDsip: "", userType: ""});
                    }
                });
            }
          }
        })
      }else{
        Job.find().exec().then((allJobs, err)=>{
            if(err){
                console.log(err);
            }else{
                res.render('jobs', {textButton: jobs, ref:ref, allJobs: allJobs, logoutHtml:"", deleteBtnDsip: "", userType: ""});
            }
        });
      }
})

app.post('/jobs', (req, res)=>{
    const job = {
        jobId: req.body.jobId
    }
    User.findById({_id: req.user._id}).then((foundUser, err)=>{
        if(err){
          console.log(err);
        }else{
            foundUser.favorites.push(job);
            foundUser.save().then(()=>{
                res.redirect("/jobs");
            }).catch((err)=>{
                console.log(err);
            })
        }
      })
})

app.get('/jobs/:id', (req, res)=>{
    const id = req.params.id;
    if(req.isAuthenticated()){
        console.log('authenticated')
        User.findById({_id: req.user._id}).then((user, err)=>{
          if(err){
            console.log(err);
          }else{
            Job.findById({_id: id}).exec().then((job, err)=>{
                if(err){
                    console.log(err);
                }else{
                    res.render("viewjob", {textButton: jobs, ref:ref, job: job, logoutHtml:logoutHtml});
                }
            })
          }
        })
      }else{
        res.render('viewjob', {textButton: jobs, ref:ref, logoutHtml:"", logoutHtml:""});
      }
})

app.post('/jobs/filteredjobs', (req, res)=>{
    const location = req.body.location;
    const jobTitle = req.body.jobTitle;

    if(req.isAuthenticated()){
        console.log('authenticated')
        User.findById({_id: req.user._id}).then((user, err)=>{
          if(err){
            console.log(err);
          }else{
            Job.find({location: location, jobTitle: jobTitle}).exec().then((filterJobs, err)=>{
                if(err){
                    console.log(err);
                }else{
                    res.render("filteredjobs", {textButton: jobs, ref:ref, filterJobs: filterJobs, logoutHtml:logoutHtml});
                }
            });
          }
        })
      }else{
        res.render("filteredjobs", {textButton: jobs, ref:ref, filterJobs: filterJobs, logoutHtml:""});
    }
    
})

app.post('/delete', (req, res)=>{
    console.log(req.body.deleteJobId);
    const id = req.body.deleteJobId;
    Job.findByIdAndRemove(id).then((result, err)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect('/jobs');
        }
    })
})

app.get('/favorite', (req, res)=>{
    if(req.isAuthenticated()){
        console.log('authenticated')
        User.findById({_id: req.user._id}).then((user, err)=>{
          if(err){
            console.log(err);
          }else{
            const favJobs = user.favorites;
            const ids = [];
            favJobs.map((job)=>{
                ids.push(job.jobId);
            })
            Job.find({'_id': { $in: ids}}).then((foundJobs, err)=>{
                if(err){
                    console.log(err);
                }else{
                    res.render('favorite', {textButton: jobs, ref:ref, logoutHtml:logoutHtml, favJobs: foundJobs});
                }
            });
          }
        })
      }else{
        res.render('favorite', {textButton: jobs, ref:ref, logoutHtml:""});
      }
})


app.get('/contact', (req, res)=>{

    if(req.isAuthenticated()){
        console.log('authenticated')
        User.findById({_id: req.user._id}).then((user, err)=>{
          if(err){
            console.log(err);
          }else{
            res.render('contact', {textButton: jobs, ref:ref, logoutHtml:logoutHtml});
          }
        })
      }else{
        res.render('contact', {textButton: jobs, ref:ref, logoutHtml:""});
      }
})

app.get('/login', (req, res)=>{

    if(req.isAuthenticated()){
        console.log('authenticated')
        User.findById({_id: req.user._id}).then((user, err)=>{
          if(err){
            console.log(err);
          }else{
            res.redirect('/');
          }
        })
      }else{
        res.render('login', {textButton: jobs, ref:ref, logoutHtml:""});
      }
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

app.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }));

app.get('/auth/google/jobs', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/jobs');
  });


app.get('/register', (req, res)=>{

    if(req.isAuthenticated()){
        console.log('authenticated')
        User.findById({_id: req.user._id}).then((user, err)=>{
          if(err){
            console.log(err);
          }else{
            res.redirect('/');
          }
        })
      }else{
        res.render('register', {textButton: jobs, ref:ref, errText: req.session.errText, logoutHtml:""});
        }
})


app.post('/register', (req, res)=>{
    User.register({
        name: req.body.name,
        userType: "employee",
        email: req.body.email,
    }, req.body.password, (err, user)=>{
        if(err){
          console.log(err);
          req.session.errText = "This User Is All ready Exist, please try another email."
          res.redirect('/register');
        }else{
          passport.authenticate('local')(req, res, ()=>{
            console.log("signed up");
            res.redirect('/');
          });
        }
      });
});

app.post('/logout', (req, res)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        console.log("loged out");
        res.redirect('/login');
      });
})


app.get('/postjob', (req, res)=>{
    if(req.isAuthenticated()){
        console.log('authenticated')
        User.findById({_id: req.user._id}).then((user, err)=>{
          if(err){
            console.log(err);
          }else{
            res.render('postjob', {textButton: jobs, ref:ref, logoutHtml:"logoutHtml"});
          }
        })
      }else{
        res.redirect('/login')
    }
})

app.post('/postjob', (req, res)=>{
    const companyName = req.body.companyName;
    const jobTitle = req.body.jobTitle;
    const jobLoc = req.body.jobLoc;
    const salary = req.body.salary;
    const shift = req.body.shift;
    const gender = req.body.gender;
    const education = req.body.education;
    const experience = req.body.experience;
    const jobDescription = req.body.jobDescription;
    const numberOfEmployees = req.body.numberOfEmployees;
    var todayDate = new Date().toISOString().slice(0, 10);


    Job.insertMany([{

        logo:"icon-9.png",
        companyName: companyName,
        jobTitle: jobTitle,
        location: jobLoc,
        salary: salary,
        shift: shift,
        gender: gender,
        education: education,
        experience: experience,
        jobDescription: jobDescription,
        numberOfEmployees: numberOfEmployees,
        dateOfPost: todayDate

    }]).then((data, err)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/jobs");
        }
    });
})



app.listen(port, ()=>{
    console.log("server started...");
})