// eslint-disable-next-line no-unused-vars

require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const httpErrors = require('http-errors');
const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const Datastore = require('nedb');
const routes = require('./routes/index');
const activityRouter = require('./routes/activity');
// const { users } = require('./db.json');
const users = new Datastore({ filename: 'users.db', autoload: true });

const marketingCloudConfig = {
  clientId: process.env.SFMC_CLIENT_ID,
  clientSecret: process.env.SFMC_CLIENT_SECRET,
  subdomain: process.env.SFMC_SUBDOMAIN,
  testApiUrl: process.env.TEST_API_URL,
  dataExtensionKey: process.env.DATA_EXTENSION_EXTERNAL_KEY,
};

const app = express();
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'frame-ancestors': ["'self'", `https://mc.${process.env.STACK}.exacttarget.com`, `https://jbinteractions.${process.env.STACK}.marketingcloudapps.com`],
      },
    },
  }),
);
// app.use(helmet({ contentSecurityPolicy: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));

// app.engine('html', require('ejs').renderFile);

app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.raw({
  type: 'application/jwt',
}));

app.use(express.static(path.join(__dirname, 'public')));
// const mainDomain = 'marketingcloudapps.com'; // Replace 'example.com' with your main domain
// app.use((req, res, next) => {
//   const { referer } = req.headers;
//   console.log(referer)
//   if (referer) {
//     const refererURL = new URL(referer);
//     const refererDomain = refererURL.hostname;
//     if (refererDomain === mainDomain || refererDomain.endsWith(`.${mainDomain}`)) {
//       // Request comes from the main domain or its subdomains
//       return next();
//     }

//     return res.status(403).send('Access forbidden.');
//   }
//   return res.status(403).send('Access forbidden.');
// });

// app.get('*', async (req, res, next) => {
//    console.log("all***")
//    const { referer } = req.headers;
//   console.log(referer)
//   next()
// });


app.post('/login', (req, res) => {
  // retrieveDataFromExtension()
  console.log('/login', req.body);

  if (req.body.username === 'admin' && req.body.password === 'admin') {
    // users.find({ MID: req.body.MID }, (err, doc) => {
    //   console.log("doc.length", doc.length)
    //   if (doc.length === 0) {
    //     users.insert(req.body, (err, doc) => {
    //       res.send({ status: true, redirect: true, url: '/dashboard' });
    //     });
    //   } else {
    //     res.send({ status: true, redirect: true, url: '/dashboard' });
    //   }
    // });

    const data = fs.readFileSync('db.json');
    const myArray = Object.keys(JSON.parse(data)).length === 0 ? [] : JSON.parse(data).users;

    if (myArray.filter((x) => x.MID == req.body.MID).length === 0) {
      // Adding the new data to our object
      myArray.push(req.body);
      // Writing to our JSON file
      const newData2 = JSON.stringify({ users: myArray });
      fs.writeFile('db.json', newData2, (err) => {
        if (err) throw err;
      });
    }

    res.send({ status: true, redirect: true, url: '/dashboard' });
    // res.redirect('/dashboard');
  } else {
    console.log('Incorrect Username/Password !');
    res.send({ status: false, redirect: false });
    // res.json({redirected: false})
    // res.render('/', {
    //   title: 'Login',
    //   error: 'Incorrect Username/Password !',
    //   dropdownOptions: [
    //     {
    //       name: 'Journey Entry',
    //       value: 'journeyEntry',
    //     },
    //     {
    //       name: 'Journey Exit',
    //       value: 'journeyExit',
    //     },
    //   ],
    // });
  }
});

app.get('/dashboard', async (req, res) => {
  // const {
  //   clientId, clientSecret, subdomain, testApiUrl,
  // } = marketingCloudConfig;
  // // Get access token
  // const tokenResponse = await axios.post(
  //   `https://${subdomain}.auth.marketingcloudapis.com/v2/token`,
  //   `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  // );
  // const accessToken = tokenResponse.data.access_token;
  // console.log('/accessToken', accessToken);
  // Retrieve data from the data extension
  // const response = await axios.get(
  //   `${testApiUrl}/template`
  // );
  // console.log(response.data);

  res.render('dashboard', {
    title: 'Template',
    data: [
      {
        wabaId: 1,
        content: 'Thank you for your attention!',
      },
      {
        wabaId: 2,
        content: 'Dear {{1}}, Thank You for joining the {{2}} community.',
      },
      {
        wabaId: 3,
        content: 'Dear {{1}}, Thank You for joining the GITAM community.',
      },
      {
        wabaId: 4,
        content: 'Dear {{1}}, Thank You for joining the GITAM community.',
      },
      {
        wabaId: 5,
        content: 'Dear {{1}}, Thank You for joining the GITAM community.',
      },
      {
        wabaId: 6,
        content: 'Dear {{1}}, Thank You for joining the GITAM community.',
      },
      {
        wabaId: 7,
        content: 'Dear {{1}}, Thank You for joining the GITAM community.',
      },
      {
        wabaId: 8,
        content: 'Dear {{1}}, Thank You for joining the GITAM community.',
      },
      {
        wabaId: 9,
        content: 'Dear {{1}}, Thank You for joining the GITAM community.',
      },
      {
        wabaId: 10,
        content: 'Dear {{1}}, Thank You for joining the GITAM community.',
      },
      {
        wabaId: 11,
        content: 'Dear {{1}}, Thank You for joining the GITAM community.',
      },
    ],
    // data: response.data.data
  });
});

app.post('/template', (req, res) => {
  console.log('/template', req.body);
  console.log((JSON.parse(req.body.template)).content.match(/{{/g));
  // if(req.body.template && JSON.parse(req.body.template).value.match(/{{/g)){
  //   res.render('/templateEdit', {

  //   })
  // }
});

app.post('/viewMessage', async (req, res) => {
  console.log('/viewMessage', req.body, req.body.mid);
  let newTemp = req.body.content;
  if (req.body && Object.keys(req.body).length && Object.keys(req.body).length > 2) {
    for (let i = 2; i < Object.keys(req.body).length; i++) {
      newTemp = newTemp.replace(Object.keys(req.body)[i], Object.values(req.body)[i]);
    }
  }
  console.log(newTemp);

  // const messageTemplate = {
  //   wabaId: req.body.wabaId,
  //   content: req.body.content,
  //   variables: (({
  //     wabaId, content, mid, ...rest
  //   }) => rest)(req.body),
  //   finalMessage: newTemp,
  // };
  // const data = fs.readFileSync('db.json');
  // const myArray = JSON.parse(data).users;
  // console.log('myArray1', myArray);
  // const objIndex = myArray.findIndex((obj) => obj.MID == req.body.mid);
  // myArray[objIndex].messageTemplate = messageTemplate;
  // console.log('myArray2', myArray);
  // // Writing to our JSON file
  // const newData2 = JSON.stringify({ users: myArray });
  // console.log('newData2', newData2);
  // const messageTemplate = {
  //   keys: {
  //     MID: req.body.mid,
  //   },
  //   values: {
  //     templateId: req.body.wabaId,
  //     mergedValues: JSON.stringify((({
  //       wabaId, content, mid, ...rest
  //     }) => rest)(req.body)),
  //     templateContent: req.body.content,
  //     finalMessage: newTemp,

  //   },
  // };

  // const {
  //   clientId, clientSecret, subdomain, dataExtensionKey,
  // } = marketingCloudConfig;
  // // Get access token
  // const tokenResponse = await axios.post(
  //   `https://${subdomain}.auth.marketingcloudapis.com/v2/token`,
  //   `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  // );
  // const accessToken = tokenResponse.data.access_token;
  // console.log('/accessToken', accessToken);

  // await axios.post(
  //   `https://${subdomain}.rest.marketingcloudapis.com/hub/v1/dataevents/key:${dataExtensionKey}/rowset`,
  //   [messageTemplate],
  //   { headers: { Authorization: `Bearer ${accessToken}` } },
  // );

  await axios.post(
    'https://indo.staging.bmp.ada-asia.com/v1/messages/sfmc/sendmessage',
    {
      platform: 'WA',
      msgId: 'hola',
      isTemplate: false,
      wabaNumber: '94720290996',
      to: '919578968981',
      type: 'text',
      text: {
        body: newTemp,
      },
      url: 'https://bizmsgapi.ada-asia.com/prod/message',
    },
    { headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IkFEQSIsImNvdW50cnlDb2RlIjoiIiwiZW1haWwiOiJtb2hhbW1hZC5hZ3VzdGlhcjJAYWRhLWFzaWEuY29tIiwiZXhwIjoyMzE2ODI1NzQ2LCJpYXQiOjE2ODU2NzM3NDYsIm5hbWUiOiJBZ3VzdGlhciIsInJvbGVDb2RlIjoiT1dORVIiLCJyb2xlSWQiOiJPV05FUiIsInNpZCI6ImFwaWtleSIsInN0eXBlIjoidXNlciIsInVpZCI6IjA4NDJlNGI3LWJlMTctNDBhOS1hZmU3LWIwNGIxNjk3NTAwOCJ9.OMWnFbBpb3s7YdNlsRc6C1s-PQUv99mSXeGNufB-2eY' } },
  ).then((resp) => {
    console.log('success');

    // fs.writeFileSync('db.json', newData2);
    res.render('success', {
      status: true,
      message: newTemp,
    });
  });

  // res.render('success', {
  //   status: 'Success',
  //   message: newTemp,
  // });
  // retrieveDataFromExtension();
});

async function retrieveDataFromExtension() {
  try {
    const { clientId, clientSecret, subdomain } = marketingCloudConfig;
    // Get access token
    const tokenResponse = await axios.post(
      `https://${subdomain}.auth.marketingcloudapis.com/v2/token`,
      `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    );
    const accessToken = tokenResponse.data.access_token;
    console.log('/accessToken', accessToken);
    // Retrieve data from the data extension
    const response = await axios.get(
      `https://${subdomain}.rest.marketingcloudapis.com/data/v1/customobjectdata/key/${process.env.DATA_EXTENSION_EXTERNAL_KEY}/rowset`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    console.log('retrieveDataFromExtension', response.data.items);
    // return response.data;
    console.log('****SUCCESS');
  } catch (error) {
    console.log('****FAILURE');
    console.error('Error retrieving data extension:', error.response.data);
    throw error;
  }
}

app.get('/accessDenied', (req,res)=>{
  res.render('accessDenied', {
    status: false,
  });
})
// serve config
app.use('/config.json', routes.config);

// custom activity routes
app.use('/journey/execute/', activityRouter.execute);
app.use('/journey/save/', activityRouter.save);
app.use('/journey/publish/', activityRouter.publish);
app.use('/journey/validate/', activityRouter.validate);

// serve UI
app.use('/', routes.ui);
// app.use('/dashboard', routes.dashboard);

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
