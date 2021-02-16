const express = require('express');
import chatBotController from '../controllers/chatBotController';
import homepageController from '../controllers/homepageController';

const router = express.Router();

const initWebRoutes = (app) => {
  router.get('/', homepageController.getHomepage);
  router.get('/webhook', chatBotController.getWebhook);
  router.post('/webhook', chatBotController.postWebhook);

  return app.use('/', router);
};

module.exports = initWebRoutes;