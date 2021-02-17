require('dotenv').config();
import request from 'request';

const postWebhook = (req, res) => {
  let body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
};

const getWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.MY_VERIFY_FB_TOKEN;
    
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
    
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);      
    }
  }
};

function handleMessage(sender_psid, received_message) {
  let response;

  if (received_message.text === "Comment vas-tu ?") {
    response = {
      "text": "Très bien et vous ?",
      "quick_replies":[
        {
          "content_type":"text",
          "title":"Je vais bien, merci.",
          "payload":"oui"
        },{
          "content_type":"text",
          "title":"Non, ça ne va pas.",
          "payload":"non"
        }
      ],
    }
  } else if (received_message.text === "Je vais bien, merci.") {
    return
  } else if (received_message.text === "Non, ça ne va pas.") {
    return
  } else if (received_message.text !== "Comment vas-tu ?") {
    response = {
      "text": `${received_message.text}`
    }
  } else if (received_message.text === "undefined") {
    response = {
      "text": "Je ne sais pas traiter ce type de demande."
    }
  }
  callSendAPI(sender_psid, response); 
}

function callSendAPI(sender_psid, response) {
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }
  request({
    "uri": "https://graph.facebook.com/v6.0/me/messages",
    "qs": { "access_token": process.env.FB_PAGE_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

module.exports = {
  postWebhook: postWebhook,
  getWebhook: getWebhook
};