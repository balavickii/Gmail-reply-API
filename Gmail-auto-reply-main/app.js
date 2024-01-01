/*1.googleapis: This package is imported from the googleapis module and provides the necessary functionality to interact with various Google APIs, including the Gmail API.

  2.OAuth2: The OAuth2 class from the google.auth module is used to authenticate the application and obtain an access token for making requests to the Gmail API. It handles token refresh and retrying requests if necessary.*/


const { google } = require("googleapis");


const CLIENT_ID = '780831366700-gio6fn2i2vs886asqqit3pj6dchrlq8o.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04vFB47skgTqtCgYIARAAGAQSNwF-L9IrVcEtgvugfbqz5MVFKHuKKJPhXQWY5xy6TBNbWFbd3-pDoYRJ_Te4W08YouabunUgSYk';



/*1.This id , secret and redirected uri obtained from the Google Cloud Console.
      https://console.developers.google.com by creating project there and setting up project.
   
    2.This refreshtoken is generated from the redirected uri https://developers.google.com/  oauthplayground
      and here authorized this https://mail.google.com scope api by email and in setting of scope api by putting client id and client secret then when authorizes done this generate 
      authorization code .
  
    3.Exchange authorization code for refresh token by clicking on exchange text. 
  */

    //implemented the “Login with google” API here.
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

/*here using new set() taken care of no double replies are sent to any email at any point. Every email that qualifies the criterion should be replied back with one and only one auto reply
  */

const repliedUsers = new Set();

// check for new emails and sends replies .
async function checkEmailsAndSendReplies() {
  try {

     // Get the list of unread messages.
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const res = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
    });
    const messages = res.data.messages;

    if (messages && messages.length > 0) {
      for (const message of messages) {
        const email = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });

        //who sends,gets email extracted

        const from = email.data.payload.headers.find(
          (header) => header.name === "From"
        );
        const toHeader = email.data.payload.headers.find(
          (header) => header.name === "To"
        );
        //subject of unread messages
        const Subject = email.data.payload.headers.find(
          (header) => header.name === "Subject"
        );

        const From = from.value;
        const toEmail = toHeader.value;
        const subject = Subject.value;
        //check if the user already replied or not
        if (repliedUsers.has(From)) {
          console.log("Already replied to:", From);
          continue;
        }
        // Check if the email has any replies.
        const thread = await gmail.users.threads.get({
          userId: "me",
          id: message.threadId,
        });

        const replies = thread.data.messages.slice(1);

        if (replies.length === 0) {
          // Reply to the email.
          await gmail.users.messages.send({
            userId: "me",
            requestBody: {
              raw: await createReplyRaw(toEmail, From, subject.value),
            },
          });
           // Add a label to the email.
          const labelName = "onVacation";
          await gmail.users.messages.modify({
            userId: "me",
            id: message.id,
            requestBody: {
              addLabelIds: [await createLabelIfNeeded(labelName)],
            },
          });

          console.log("Sent reply to email:", From);

           //Add the user to replied users set
          repliedUsers.add(From);
        }
      }
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
}
// This fuction is convert to base64encoded email format
async function createReplyRaw(from, to, subject) {
  const emailContent = `From: ${from}\nTo: ${to}\nSubject: ${subject}\n\nThank you for your message. I am unavailable right now, but will respond as soon as possible...`;
  const base64EncodedEmail = Buffer.from(emailContent)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return base64EncodedEmail;
}
// 3.add a Label to the email and move the email to the label
async function createLabelIfNeeded(labelName) {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  const res = await gmail.users.labels.list({ userId: "me" });
  const labels = res.data.labels;
  // Check if the label already exists.
  const existingLabel = labels.find((label) => label.name === labelName);
  if (existingLabel) {
    return existingLabel.id;
  }

    // Create the label if it doesn't exist.
  const newLabel = await gmail.users.labels.create({
    userId: "me",
    requestBody: {
      name: labelName,
      labelListVisibility: "labelShow",
      messageListVisibility: "show",
    },
  });

  return newLabel.data.id;
}


/*repeat this sequence of steps 1-3 in random intervals of 45 to 120 seconds*/
function getRandomInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}


  //Setting Interval and calling main function in every interval
setInterval(checkEmailsAndSendReplies, getRandomInterval(45, 120) * 1000);
