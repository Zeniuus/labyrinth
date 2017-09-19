let UserSchema = require('./../models/userInfo.js');
class_num = 26;

module.exports = (app) => {
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
  });

  app.post('/login', (req, res) => {
    let idVal = req.body.id;
    let pwVal = req.body.pw;
    UserSchema.findOne({ id: idVal, password: pwVal }, (err, userInfo) => {
      if (err) return res.status(500).end('database error');
      if (!userInfo) return res.json({ success: false });
      res.json({ success: true });
    });
  });
}
