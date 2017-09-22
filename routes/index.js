let multiparty = require('multiparty');
let fs = require('fs');

let UserSchema = require('./../models/userInfo.js');
let ProblemSchema = require('./../models/problemInfo.js');

class_num = 26;

module.exports = (app, passport) => {
  app.get('/', (req, res) => {
    res.render('index.html');
  });

  app.get('/users/zeniuus7329', (req, res) => {
    // let currentdate = new Date();
    // let datetime = "Last Sync: " + currentdate.getDate() + "/"
    //                 + (currentdate.getMonth()+1)  + "/"
    //                 + currentdate.getFullYear() + " @ "
    //                 + currentdate.getHours() + ":"
    //                 + currentdate.getMinutes() + ":"
    //                 + currentdate.getSeconds();
    for (let i = 1; i <= class_num; i += 1) {
      let userInfo = new UserSchema();
      userInfo.id = `class${i}`;
      userInfo.password = `class${i}`;
      userInfo.name = `class${i}`;
      userInfo.progress = 0;
      userInfo.last_success = new Date();
      userInfo.save((err) => {
        if (err) return res.status(500).end('database error');
        res.end('success!');
      });
    }

    let userInfo = new UserSchema();
    userInfo.id = 'admin';
    userInfo.password = 'admin';
    userInfo.name = 'admin';
    userInfo.progress = 1000;
    userInfo.last_success = new Date();
    userInfo.save((err) => {
      if (err) return res.status(500).end('database error');
      res.end('success!');
    });
  });

  app.post('/login', passport.authenticate('local'), (req, res) => {
    console.log(req.user);
    res.json(req.user);
  });

  app.get('/admin', (req, res) => {
    res.render('admin.html');
  });

  app.get('/admin/problems', (req, res) => {
    ProblemSchema.find({}, (err, problemInfos) => {
      if (err) return res.status(500);
      res.json(problemInfos);
    });
  });

  app.post('/admin/problems/detail', (req, res) => {
    let problemInfo = new ProblemSchema();
    problemInfo.title = req.body.title;
    problemInfo.number = req.body.number;
    problemInfo.photoName = req.body.photoName;
    problemInfo.solution = req.body.solution;
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

  app.post('/admin/problems/photo', (req, res) => {
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
      let writeStream = fs.createWriteStream(__dirname + '/../static/problems/' + filename);
      writeStream.filename = filename;
      part.pipe(writeStream);

      part.on('data', function(chunk) {
        console.log(filename + ' read ' + chunk.length + 'bytes');
      });

      part.on('end', function() {
        console.log(filename + ' Part read complete');
        ProblemSchema.findOne({ photoName: filename }, (err, problemInfo) => {
          // if (err) return res.status(500);
          res.json({ success: true });
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
}
