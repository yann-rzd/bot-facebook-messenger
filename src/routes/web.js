const express = require('express');
import homepageController from '../controllers/homepageController';

const router = express.Router();

const initWebRoutes = (app) => {
  router.get('/', homepageController.getHomepage);

  return app.use('/', router);
};

module.exports = initWebRoutes;