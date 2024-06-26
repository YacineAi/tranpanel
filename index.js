const express = require('express');
const app = express();
const request = require("request");
const Botly = require("botly");
const botly = new Botly({
  accessToken: "مش لازمة",
  verifyToken: process.env.VERIFY_TOKEN,
  webHookPath: process.env.WB_PATH,
  notificationType: Botly.CONST.REGULAR,
  FB_URL: "https://graph.facebook.com/v13.0/",
});
const pageData = require('./pages.json');
app.use(express.static('views'));
app.set('view engine', 'ejs');
app.use(express.json({ verify: botly.getVerifySignature(process.env.APP_SECRET) }));
app.use(express.urlencoded({ extended: false }));
app.use("/webhook", botly.router());
app.get('/', (req, res) => {
  res.render('index', { pages: pageData.pages });
});
app.get('/pages', (req, res) => {
  res.json(pageData)
});


botly.on("message", (senderId, message, data) => {
  for (const page of pageData.pages) {
    if (message.recipient.id === page.id) {
      const options = {
        url: page.webhook,
        method: 'POST',
        json: { message: message },
      };
      request(options, (error, response, body) => {
        if (error) {
          console.error('Error forwarding message:', error);
        } else {
          console.log('Message forwarded successfully:', body);
        }
      });
      break;
    }
  }
});

botly.on("postback", async (senderId, message, postback) => {
  for (const page of pageData.pages) {
    if (message.recipient.id === page.id) {
      const options = {
        url: page.webhook,
        method: 'POST',
        json: { postback: { postback, message } },
      };
      request(options, (error, response, body) => {
        if (error) {
          console.error('Error forwarding postback:', error);
        } else {
          console.log('Postback forwarded successfully:', body);
        }
      });
      break;
    }
  }
});

app.listen(3000, () => { console.log(`App listening on port 3000`); });