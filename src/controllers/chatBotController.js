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
      "message":{
        "text": "Très bien et vous ?",
        "quick_replies":[
          {
            "content_type":"text",
            "title":"Je vais bien, merci.",
            "payload":"oui",
          },{
            "content_type":"text",
            "title":"Non, ça ne va pas.",
            "payload":"non",
          }
        ]
      }
    }
  } else if (received_message.attachments) {
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  }
  callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
  let response;
  let payload = received_postback.payload;

  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
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

// function firstTrait(nlp, name) {
//   return nlp && nlp.entities && nlp.traits[name] && nlp.traits[name][0];
// }

// function handleMessage(sender_psid, message) {
//   // check greeting is here and is confident
//   const greeting = firstTrait(message.nlp, 'wit$greetings');
//   if (greeting && greeting.confidence > 0.8) {
//     callSendAPI(sender_psid, 'Hi there!');
//   } else { 
//     callSendAPI(sender_psid, 'Default')
//   }
// }

module.exports = {
  postWebhook: postWebhook,
  getWebhook: getWebhook
};