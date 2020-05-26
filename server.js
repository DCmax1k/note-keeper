const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

// DB CONNECTION
mongoose.connect(
  process.env.DB_CONNECTION,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log('Connected to DB!');
  }
);

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));

// Import routes
const signupRoute = require('./routes/signup');
app.use('/signup', signupRoute);

const accountRoute = require('./routes/account');
app.use('/account', accountRoute);

const loginRoute = require('./routes/login');
app.use('/login', loginRoute);

const settingsRoute = require('./routes/settings');
app.use('/settings', settingsRoute);

// View engine
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(process.env.PORT || 3000);
