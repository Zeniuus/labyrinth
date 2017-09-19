let express = require('express');
let app = express()

let port = 3000;
let bodyParser = require('body-parser');
let mongoose = require('mongoose');

let db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
  console.log('connected to mongod server');
});
mongoose.connect('mongodb://localhost/labyrinth');

app.use(express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

let router = require('./routes')(app);

let server = app.listen(port, () => {
  console.log('Server running at http://127.0.0.1:' + port);
});
