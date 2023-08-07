// eslint-disable-next-line no-unused-vars

require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
const fs = require('fs');
const httpErrors = require('http-errors');
const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const routes = require('./routes/index');
const activityRouter = require('./routes/activity');

const app = express();
const STACK = process.env.STACK || 's11';

// allow MC instance to whitelist app as iframe in the JB config page
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'", '*'], // Allow all sources for default content
        'frame-ancestors': ["'self'", `https://mc.${STACK}.exacttarget.com`, `https://jbinteractions.${STACK}.marketingcloudapps.com`, '*'], // Allow all sources for frame ancestors
      },
    },
  }),
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  bodyParser.raw({
    type: 'application/jwt',
  }),
);

app.use(express.static(path.join(__dirname, 'public')));

app.post('/login', async (req, res) => {
  const data1 = { username: req.body.username, password: req.body.password };
  const loggedData = req.body;
  const data = fs.readFileSync('db.json');
  const users = (Object.keys(JSON.parse(data)).length === 0 || JSON.parse(data)[req.body.MID] == 'undefined') ? [] : JSON.parse(data)[req.body.MID];
  const usernameVerify = users.filter((value) => value.username == data1.username).length > 0;
  const usernamePswdVerify = users.filter((value) => value.username == data1.username && value.password == data1.password).length > 0;
  if (JSON.parse(data)[req.body.MID] == undefined) {
    // MID not available in db

    await axios.post('https://indo.staging.bmp.ada-asia.com/v1/sfmc/token/generate', data1, { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
      .then((resp) => {
        const pushData1 = {
          username: req.body.username,
          password: req.body.password,
          accessToken: resp.data.accessToken,
        };
        const parseData = JSON.parse(data);
        parseData[req.body.MID] = [pushData1];
        fs.writeFile('db.json', JSON.stringify(parseData), async (err) => {
          if (err) {
            console.log(err);
          }
        });
        res.send({
          status: true,
          username: req.body.username,
          accessToken: resp.data.accessToken,
          redirect: true,
          url: '/dashboard',
        });
      }).catch((err) => {
        console.log(err)
        res.send({ status: false, redirect: false, message: err.response && err.response.data && err.response.data.message ? err.response.data.message : 'Please try again' });
      });
  } else if (usernameVerify && usernamePswdVerify) {
    // MID, username and password available in db
    console.log('elseif1');
    await axios.post('https://indo.staging.bmp.ada-asia.com/v1/sfmc/token/generate', data1, { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
      .then((resp) => {
        const parseData = JSON.parse(data);
        const midArray = parseData[req.body.MID];
        const dataIndex = midArray.findIndex((x) => x.username === req.body.username && x.password === req.body.password);
        midArray[dataIndex].accessToken = resp.data.accessToken;
        fs.writeFile('db.json', JSON.stringify(parseData), async (err) => {
          if (err) {
            console.log(err);
          }
        });
        res.send({
          status: true,
          username: req.body.username,
          accessToken: resp.data.accessToken,
          redirect: true,
          url: '/dashboard',
        });
      }).catch((err) => {
        res.send({ status: false, redirect: false, message: err.response && err.response.data && err.response.data.message ? err.response.data.message : 'Please try again' });
      });
  } else if (usernameVerify && !usernamePswdVerify) {
    // MID and username available in db and password wrong
    res.send({ status: false, redirect: false, message: 'Incorrect Username/Password' });
  } else {
    // MID available in db but username and password not registered
    await axios.post('https://indo.staging.bmp.ada-asia.com/v1/sfmc/token/generate', data1, { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
      .then((resp) => {
        const pushData2 = {
          username: req.body.username,
          password: req.body.password,
          accessToken: resp.data.accessToken,
        };
        const parseData = JSON.parse(data);
        const midArray = parseData[req.body.MID];
        midArray.push(pushData2);

        fs.writeFile('db.json', JSON.stringify(parseData), async (err) => {
          if (err) {
            console.log(err);
          }
        });
        res.send({
          status: true,
          username: req.body.username,
          accessToken: resp.data.accessToken,
          redirect: true,
          url: '/dashboard',
        });
      }).catch((err) => {
        res.send({ status: false, redirect: false, message: err.response && err.response.data && err.response.data.message ? err.response.data.message : 'Please try again' });
      });
  }
});

app.get('/dashboard', async (req, res) => {
  const urlData = require('url').parse(req.url, true).query;

  const data = fs.readFileSync('db.json');
  const dbDataArray = JSON.parse(data)[urlData.mid];
  const dbObj = dbDataArray.find((x) => x.username === urlData.u);

  await axios.get('https://indo.staging.bmp.ada-asia.com/v1/sfmc/list/template', { headers: { Authorization: `Bearer ${dbObj.accessToken}` } })
    .then((resp) => {
      res.render('dashboard', {
        title: 'Template',
        error: null,
        data: resp.data.templateData,
      });
    }).catch((err) => {
      console.log("err")
      res.render('dashboard', {
        title: 'Template',
        error: 'Please Login to Continue',
        data: [],
      });
    });
});

app.get('/accessDenied', (req, res) => {
  res.render('accessDenied', {
    status: false,
  });
});

app.get('/success', (req, res) => {
  res.render('success', {
    status: true,
  });
});
// serve config
app.use('/config.json', routes.config);

// custom activity routes
app.use('/journey/execute/', activityRouter.execute);
app.use('/journey/save/', activityRouter.save);
app.use('/journey/publish/', activityRouter.publish);
app.use('/journey/validate/', activityRouter.validate);

// serve UI
app.use('/', routes.ui);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(httpErrors(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
