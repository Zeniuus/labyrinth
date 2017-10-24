let multiparty = require('multiparty');
let fs = require('fs');

let UserSchema = require('./../models/userInfo.js');
let ProblemSchema = require('./../models/problemInfo.js');
let StorySchema = require('./../models/storyInfo.js');
let LogSchema = require('./../models/logInfo.js');

class_num = 26;

module.exports = (app, passport) => {
  let problemList = [];
  let storyList = [];

  ProblemSchema.find({}, (err, problemInfos) => {
    if (err) return;
    problemList = problemInfos.sort((p1, p2) => {
      if (p1.number < p2.number) return -1;
      if (p1.number == p2.number) {
        if (p1.title < p2.title) return -1;
        if (p1.title > p2.title) return 1;
        return 0;
      }
      return 1;
    });
  });

  StorySchema.find({}, (err, storyInfos) => {
    if (err) return;
    storyList = storyInfos.sort((p1, p2) => {
      if (p1.number < p2.number) return -1;
      if (p1.number == p2.number) {
        if (p1.title < p2.title) return -1;
        if (p1.title > p2.title) return 1;
        return 0;
      }
      return 1;
    });
  });

  app.get('/', (req, res) => {
    res.redirect('/main');
  });

  app.get('/users/create', (req, res) => {
    for (let i = 1; i <= class_num; i += 1) {
      let userInfo = new UserSchema();
      userInfo.id = `class${i}`;
      userInfo.password = `class${i}`;
      userInfo.name = `class${i}`;
      userInfo.progress = 0;
      userInfo.last_success = new Date();
      userInfo.timer_start = null;
      userInfo.save((err) => {
        if (err) return res.status(500).end('database error');
        let logInfo = new LogSchema();
        logInfo.id = userInfo.id;
        logInfo.log_start = [];
        logInfo.log_end = [];
        logInfo.save((err) => {
          if (err) return res.status(500).end('database error');
          res.end('success!');
        });
      });
    }

    let userInfo = new UserSchema();
    userInfo.id = 'admin';
    userInfo.password = 'admin';
    userInfo.name = 'admin';
    userInfo.progress = 1000;
    userInfo.last_success = new Date();
    userInfo.timer_start = null;
    userInfo.save((err) => {
      if (err) return res.status(500).end('database error');
      let logInfo = new LogSchema();
      logInfo.id = userInfo.id;
      logInfo.log_start = [];
      logInfo.log_end = [];
      logInfo.save((err) => {
        if (err) return res.status(500).end('database error');
        res.end('success!');
      });
    });
  });

  app.get('/users/delete', (req, res) => {
    UserSchema.remove({}, (err) => {
      if (err) return res.status(500);
      LogSchema.remove({}, (err) => {
        if (err) return res.status(500);
        res.end('success!');
      });
    });
  });

  app.get('/user', (req, res) => {
    res.json({
      user: req.user,
      pastTime: new Date() - new Date(req.user.timer_start),
    });
  });

  app.get('/login', (req, res) => {
    res.render('login.html');
  });

  app.post('/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
  });

  app.get('/main', (req, res) => {
    let url = '';
    if (req.user.progress === problemList.length) url = '/congratulations';
    else if (req.user.timer_start === null) url = `/stories/${req.user.progress}`;
    else url = `problems/${req.user.progress + 1}`;
    res.render('main.ejs', {
      problems: problemList.slice(0, req.user.progress),
      stories: storyList.slice(0, req.user.progress + 1),
      currProblemUrl: url,
    });
  });

  app.get('/problems/:number', (req, res) => {
    if (req.user.progress + 1 < req.params.number) return res.redirect('/not_allowed');
    if (req.params.number > problemList.length) return res.redirect('/congratulations');
    ProblemSchema.findOne({ number: req.params.number }, (err, problemInfo) => {
      if (err) return res.status(500);
      if (req.user.progress >= req.params.number || req.user.timer_start != null) return res.render('problem.ejs', { problem: problemInfo });
      UserSchema.findOne({ id: req.user.id }, (err, userInfo) => {
        if (err) return res.status(500);
        if (!userInfo) return res.status(500);
        userInfo.timer_start = new Date();
        userInfo.save((err) => {
          if (err) return res.status(500);
          LogSchema.findOne({ id: req.user.id }, (err, logInfo) => {
            if (err) return res.status(500);
            if (logInfo.log_start.length >= req.params.number) return res.render('problem.ejs', { problem: problemInfo });
            logInfo.log_start.push(userInfo.timer_start);
            logInfo.save((err) => {
              if (err) return res.status(500);
              res.render('problem.ejs', { problem: problemInfo });
            });
          });
        });
      });
    });
  });

  app.post('/problems/:number/answer', (req, res) => {
    if (req.params.number > req.user.progress + 1) return res.json({ correct: false });
    ProblemSchema.findOne({ number: req.params.number, answer: req.body.answer }, (err, problemInfo) => {
      if (err) return res.status(500);
      if (!problemInfo) return res.json({ correct: false });
      if (req.params.number <= req.user.progress) return res.json({ correct: true });
      UserSchema.findOne({ id: req.user.id }, (err, userInfo) => {
        if (err) return res.status(500);
        if (!userInfo) return res.status(500);
        userInfo.progress = req.params.number;
        userInfo.timer_start = null;
        userInfo.save((err) => {
          if (err) return res.status(500);
          LogSchema.findOne({ id: req.user.id }, (err, logInfo) => {
            if (err) return res.status(500);
            if (logInfo.log_end.length >= req.params.number) return res.json({ correct: true });
            logInfo.log_end.push(new Date());
            logInfo.save((err) => {
              if (err) return res.status(500);
              return res.json({ correct: true });
            });
          });
        });
      });
    });
  });

  app.get('/problems/:problemNum/hints', (req, res) => {
    ProblemSchema.findOne({ number: req.params.problemNum }, (err, problemInfo) => {
      if (err) return res.status(500);
      if (!problemInfo) return res.status(500);
      if (req.params.problemNum != req.user.progress + 1) return res.json({ hints: [] });

      let pastTime = new Date() - new Date(req.user.timer_start);
      if (pastTime >= 30000) return res.json({ hints: problemInfo.hint });
      if (pastTime >= 20000) return res.json({ hints: problemInfo.hint.slice(0, 2)});
      if (pastTime >= 10000) return res.json({ hints: problemInfo.hint.slice(0, 1)});
      return res.json({ hints: [] });
    });
  });

  app.get('/stories/:number', (req, res) => {
    if (req.user.progress < req.params.number) return res.redirect('/not_allowed');
    StorySchema.findOne({ number: req.params.number }, (err, storyInfo) => {
      if (err) return res.status(500);
      res.render('story.ejs', { story: storyInfo });
    });
  });

  app.get('/congratulations', (req, res) => {
    if (req.user.progress != problemList.length) return res.redirect('/not_allowed');
    res.render('ending.html');
  });

  app.get('/not_allowed', (req, res) => {
    res.render('not_allowed.html');
  });

  app.get('/admin/log', (req, res) => {
    res.render('admin_log.ejs', { problems: problemList });
  });

  app.get('/admin/logs', (req, res) => {
    LogSchema.find({}, (err, logInfos) => {
      if (err) return res.status(500);
      res.json(logInfos);
    });
  });

  app.get('/admin/problem', (req, res) => {
    res.render('admin_problem.html');
  });

  app.get('/admin/problems', (req, res) => {
    res.json(problemList);
  });

  app.post('/admin/problems/detail', (req, res) => {
    let problemInfo = new ProblemSchema();
    problemInfo.title = req.body.title;
    problemInfo.number = req.body.number;
    problemInfo.imageName = req.body.imageName;
    problemInfo.answer = req.body.answer;
    problemInfo.hint = [
      req.body.hint1,
      req.body.hint2,
      req.body.hint3,
    ],
    problemInfo.save((err) => {
      if (err) return res.status(500);
      res.end(null);
    });
  });

  app.post('/admin/problems/image', (req, res) => {
    let form = new multiparty.Form();
    // get field name & value
    form.on('field', function(name, value) {
      console.log('normal field / name = ' + name + ' , value = ' + value);
    });

    // file upload handling
    form.on('part', function(part) {
      let filename;
      let size;
      if (part.filename) {
        filename = part.filename;
        size = part.byteCount;
      } else {
        part.resume();
      }

      console.log("Write Streaming file :" + filename);
      let writeStream = fs.createWriteStream(__dirname + '/../static/problemImages/' + filename);
      writeStream.filename = filename;
      part.pipe(writeStream);

      part.on('data', function(chunk) {
        console.log(filename + ' read ' + chunk.length + 'bytes');
      });

      part.on('end', function() {
        console.log(filename + ' Part read complete');
        ProblemSchema.findOne({ imageName: filename }, (err, problemInfo) => {
          if (err) return res.status(500);
          if (!problemInfo) return res.json({ success: false });
          updateProblemList(res);
        });
        writeStream.end();
      });
    });

    // all uploads are completed
    form.on('close', function() {
      console.log('Upload complete');
    });

    // track progress
    form.on('progress', function(byteRead,byteExpected) {
      console.log(' Reading total  ' + byteRead + '/' + byteExpected);
    });

    form.parse(req);
  });

  app.delete('/admin/problems/:title', (req, res) => {
    ProblemSchema.findOne({ title: req.params.title }, (err, problemInfo) => {
      if (err) return res.status(500);
      if (!problemInfo) return res.json({ success: false });
      ProblemSchema.remove({ title: req.params.title }, (err) => {
        if (err) return res.status(500);
        fs.unlink(__dirname + `/../static/problemImages/${problemInfo.imageName}`, (err) => {
          if (err) console.log(err);
          updateProblemList(res);
        });
      });
    });
  });

  function updateProblemList(res) {
    ProblemSchema.find({}, (err, problemInfos) => {
      if (err) return res.status(500);
      problemList = problemInfos.sort((p1, p2) => {
        if (p1.number < p2.number) return -1;
        if (p1.number == p2.number) {
          if (p1.title < p2.title) return -1;
          if (p1.title > p2.title) return 1;
          return 0;
        }
        return 1;
      });
      res.json({ success: true });
    });
  }

  app.get('/admin/story', (req, res) => {
    res.render('admin_story.html');
  });

  app.get('/admin/stories', (req, res) => {
    res.json(storyList);
  });

  app.post('/admin/stories/detail', (req, res) => {
    let storyInfo = new StorySchema();
    storyInfo.title = req.body.title;
    storyInfo.number = req.body.number;
    storyInfo.imageName = req.body.imageName;
    storyInfo.save((err) => {
      if (err) return res.status(500);
      res.end(null);
    });
  });

  app.post('/admin/stories/image', (req, res) => {
    let form = new multiparty.Form();
    // get field name & value
    form.on('field', function(name, value) {
      console.log('normal field / name = ' + name + ' , value = ' + value);
    });

    // file upload handling
    form.on('part', function(part) {
      let filename;
      let size;
      if (part.filename) {
        filename = part.filename;
        size = part.byteCount;
      } else {
        part.resume();
      }

      console.log("Write Streaming file :" + filename);
      let writeStream = fs.createWriteStream(__dirname + '/../static/storyImages/' + filename);
      writeStream.filename = filename;
      part.pipe(writeStream);

      part.on('data', function(chunk) {
        console.log(filename + ' read ' + chunk.length + 'bytes');
      });

      part.on('end', function() {
        console.log(filename + ' Part read complete');
        StorySchema.findOne({ imageName: filename }, (err, storyInfo) => {
          if (err) return res.status(500);
          if (!storyInfo) return res.json({ success: false });
          updateStoryList(res);
        });
        writeStream.end();
      });
    });

    // all uploads are completed
    form.on('close', function() {
      console.log('Upload complete');
    });

    // track progress
    form.on('progress', function(byteRead,byteExpected) {
      console.log(' Reading total  ' + byteRead + '/' + byteExpected);
    });

    form.parse(req);
  });

  app.delete('/admin/stories/:title', (req, res) => {
    StorySchema.findOne({ title: req.params.title }, (err, storyInfo) => {
      if (err) return res.status(500);
      if (!storyInfo) return res.json({ success: false });
      StorySchema.remove({ title: req.params.title }, (err) => {
        if (err) return res.status(500);
        fs.unlink(__dirname + `/../static/storyImages/${storyInfo.imageName}`, (err) => {
          if (err) console.log(err);
          updateStoryList(res);
        });
      });
    });
  });

  function updateStoryList(res) {
    StorySchema.find({}, (err, storyInfos) => {
      if (err) return res.status(500);
      storyList = storyInfos.sort((p1, p2) => {
        if (p1.number < p2.number) return -1;
        if (p1.number == p2.number) {
          if (p1.title < p2.title) return -1;
          if (p1.title > p2.title) return 1;
          return 0;
        }
        return 1;
      });
      res.json({ success: true });
    });
  }
}
