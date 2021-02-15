const express = require('express');
// const { SERVER_PORT } = require('./env');
require('dotenv').config();

import viewEngine from './config/viewEngine';
import initWebRoutes from './routes/web';
import bodyParser from 'body-parser';

const app = express();

// config view engine
viewEngine(app);

// use body-parser to post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));

// init all web routes
initWebRoutes(app);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`App is running at the port ${port}`);
});
