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
let problemList = [];
db.on('error', console.error);
db.once('open', () => {
  console.log('connected to mongod server');
  require('./models/problemInfo.js').find({}, (err, problemInfos) => {
    if (err) {
      console.log(err);
      return;
    }
    problemList = problemInfos.sort((p1, p2) => {
      if (p1.number < p2.number) return -1;
      if (p1.number == p2.number) return 0;
      return 1;
    });
  });
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
app.use('/static/problemImages', (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
  } else {
    next();
  }
});
app.use('/static/problemImages/:imgName', (req, res, next) => {
  if (!req.user) {
    res.redirect('/login');
  } else {
    const imgName = req.params.imgName;
    const progress = req.user.progress;
    for (let i = 0; i < problemList.length; i++) {
      if (problemList[i].imageName === imgName) {
        if (progress + 1 < problemList[i].number) {
          res.end('Go away, Anna!');
          return;
        } else {
          next();
        }
        break;
      }
    }
  }
});
app.use('/admin', (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
  } else {
    if (req.user.id !== 'admin') {
      res.redirect('/main')  // TODO: "권한이 없습니다." page로 이동
    } else {
      next();
    }
  }
});
// TODO: /admin route는 admin 계정만 접근 가능하게 하기
// TODO: /problemImages route는 문제 푼 놈들만 접근 가능하게 하기
// TODO: /problems/:problemNum/hints/:hintNum은 시간 지난 놈들만 접근 가능하게 하기
// TODO: 로그인 안한 유저는 /login 이외의 페이지는 접근 불가능하게 하기
app.use('/static', express.static(__dirname + '/static'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

let router = require('./routes')(app, passport);

let server = app.listen(port, () => {
  console.log('Server running at http://127.0.0.1:' + port);
});
