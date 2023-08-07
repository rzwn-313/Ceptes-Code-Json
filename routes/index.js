const path = require('path');
const fs = require('fs');
const users = require('../db.json');

/**
 * Render Config
 * @param req
 * @param res
 */
exports.config = (req, res) => {
  const domain = req.headers.host || req.headers.origin;
  const file = path.join(__dirname, '..', 'public', 'config-template.json');

  const configTemplate = fs.readFileSync(file, 'utf-8');
  const config = JSON.parse(configTemplate.replace(/\$DOMAIN/g, domain));
  res.json(config);
  // console.log('config',config);
};

/**
 * Render UI
 * @param req
 * @param res
 */
exports.ui = (req, res) => {
  // console.log("*******",req)
  res.render('index', {
    title: 'Login',
    users: JSON.stringify(users),
    error: '',
  });
};
