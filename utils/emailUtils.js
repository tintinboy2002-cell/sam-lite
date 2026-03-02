const nodemailer = require("nodemailer");

function obj() {
  this.sendEmail = async function (
    email,
    subject,
    message,
    attachmentBuffer = null,
    attachmentName = null
  ) {
    let mailConfig = {
      host: "smtp.gmail.com",
      secureConnection: true,
      port: 465,
      auth: {
        user: "alerts.messages.nubaxdatalabs@gmail.com",
        pass: "lhju mkqu kuvz daxn",
      },
    };

    let transporter = nodemailer.createTransport(mailConfig);

    let mailOptions = {
      from: `"SΛM LĪTΞ" <sam.nubaxdatalabs2014@gmail.com>`,
      to: email,
      subject: subject,
      html: message,
      attachments: attachmentBuffer
        ? [
            {
              filename: attachmentBuffer.originalname,
              content: attachmentBuffer.buffer,
              contentType: attachmentBuffer.mimetype,
            },
          ]
        : [],
    };
    // console.log('mailOptions:', mailOptions);
    if (attachmentBuffer && attachmentName) {
      mailOptions.attachments = [
        {
          filename: attachmentName,
          content: attachmentBuffer.toString("base64"),
          encoding: "base64",
          contentType: "application/pdf",
        },
      ];
    }

    transporter.sendMail(mailOptions, function (error) {
      if (error) {
        console.log("error:", error);
      } else {
        console.log("sent");
      }
    });
  };
}

var self = (module.exports = new obj());

