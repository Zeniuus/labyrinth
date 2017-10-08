let express = require('express');
let app = express()

let port = 3000;
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let mongoose = require('mongoose');
let passport = require('passport');
let passportStrategy = require('passport-local').Strategy;

passport.use(new passportStrategy({
  usernameField: 'id',
  passwordField: 'password',
  passReqToCallback: true,
}, (req, id, password, done) => {
  require('./models/userInfo.js').findOne({ id: id, password: password }, (err, userInfo) => {
    if (err) return done(null, false);
    if (!userInfo) return done(null, false);
    return done(null, userInfo);
  });
}));
passport.serializeUser((user, done) => {
  done(null, user.id);
})

passport.deserializeUser((id, done) => {
  require('./models/userInfo.js').findOne({ id: id}, (err, userInfo) => {
    return done(err, userInfo);
  });
});

let db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
  console.log('connected to mongod server');
});
mongoose.connect('mongodb://localhost/labyrinth');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'I love apple!',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', (req, res, next) => {
  let urlTokens = req.originalUrl.split('/');
  if (!req.user && !(urlTokens[1] === 'static' && urlTokens[2] === 'javascript') && req.originalUrl !== '/login') {
    res.redirect('/login')
  } else {
    next();
  }
});
app.use('/static/problemImages/:imgName', (req, res, next) => {
  const imgName = req.params.imgName;
  const progress = req.user.progress;
  require('./models/problemInfo.js').find({}, (err, problemInfos) => {
    if (err) {
      console.log(err);
      return;
    }
    problemInfos.sort((p1, p2) => {
      if (p1.number < p2.number) return -1;
      if (p1.number == p2.number) return 0;
      return 1;
    });
    
    for (let i = 0; i < problemInfos.length; i++) {
      if (problemInfos[i].imageName === imgName) {
        if (progress + 1 < problemInfos[i].number) {
          res.end('Go away, Anna!');
          return;
        } else {
          next();
        }
        break;
      }
    }
  });
});
app.use('/admin', (req, res, next) => {
  if (req.user.id !== 'admin') {
    res.redirect('/not_allowed');
  } else {
    next();
  }
});
app.use('/static', express.static(__dirname + '/static'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

let router = require('./routes')(app, passport);

let server = app.listen(port, () => {
  console.log('Server running at http://127.0.0.1:' + port);
});
