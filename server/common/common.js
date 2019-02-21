/**
 * Created by Jack V on 9/22/2017.
 */

'use strict';
import nodeMailer from "nodemailer";
import config from './config';
import logger from '../logger';

let transporter = nodeMailer.createTransport({
    host: config.email.smtp,
    port: config.email.mailPort,
    secure: true,
    auth:
    {
        user: config.email.userMail,
        pass: config.email.userPassword
    }
});

exports.sendVerificationMail = (recipients, token) =>
{
    return new Promise(function(resolve, reject)
    {
        let mailBody = `<p><br/>Thanks for signing up at creaptive.com</p><p>Please verify your email by clicking on the verification link below within the next 24 hours.<br/><br/>
        <a style="background-color:#21ba45;border-collapse:separate!important;border-top:10px solid #21ba45;border-bottom:10px solid #21ba45;border-right:45px solid #21ba45;border-left:45px solid #21ba45;border-radius:4px;color:#ffffff;display:inline-block;font-family:'Open+Sans','Open Sans',Helvetica,Arial,sans-serif;font-size:13px;font-weight:bold;text-align:center;text-decoration:none;letter-spacing:2px" href=${config.email.verificationLink + token.toString()}>Verify your Email now!</a><br/><br/>creaptive Team</p>`;

        let mail =
        {
            from: config.appName + ' ' + '<' + config.email.appVerificationMailName + '@creaptive.com>',
            recipients: recipients,
            subject: config.email.verifyEmailSubject,
            body: mailBody
        };
        sendMail(mail, (error, success) =>
        {
            resolve({error: error, success: success});
        });
    });
};

exports.sendForgotPasswordMail = (recipient, token, callback) =>
{
    return new Promise(function(resolve, reject)
    {
        let mailBody = `<p><b>Password Reset Request</b> <br/><br/>Hi, Someone requested for a change of your password at creaptive.com and we needed to be sure you are aware of that. <br/>If you originated the request, please click on the link below to proceed.<br/><br/><a style="background-color:#fb8c00;border-collapse:separate!important;border-top:10px solid #fb8c00;border-bottom:10px solid #fb8c00;border-right:45px solid #fb8c00;border-left:45px solid #fb8c00;border-radius:4px;color:#ffffff;display:inline-block;font-family:'Open+Sans','Open Sans',Helvetica,Arial,sans-serif;font-size:13px;font-weight:bold;text-align:center;text-decoration:none;letter-spacing:2px" href=${config.email.passwordResetRequestLink + token.toString()}>Reset your Password</a>
        <br/><br/>creaptive Team</p>`;
        let mail =
        {
            from: config.appName + ' ' + '<' + config.email.appPasswordResetRequestMailName + '@creaptive.com>',
            recipients: recipient,
            subject: config.email.passwordResetSubject,
            body: mailBody
        };
        sendMail(mail, function(error, success)
        {
            resolve({error: error, success: success})
        });
    });

};

exports.sendPasswordResetMail = (recipient, callback) =>
{
    return new Promise(function(resolve, reject)
    {
        let mailBody = `<p>Hi, you have successfully changed your password. If this action wasn't invoked by you<br/>please contact our support team ASAP!<br/>
        <br/><br/>creaptive Team</p>`;
        let mail =
        {
            from: config.appName + ' ' + '<' + config.email.appSuccessfulPasswordResetMailName + '@creaptive.com>',
            recipients: recipient,
            subject: config.email.successfulPasswordResetSubject,
            body: mailBody
        };
        sendMail(mail, function(error, success)
        {
            resolve({error: error, success: success})
        });
    });
};

const sendMail = (mail, callback) =>
{
    // setup email data with unicode symbols
    let mailOptions =
    {
        from: mail.from, // sender address
        to: mail.recipients, //'abc@ywc.com, def@xyz.com' => list of receivers
        subject: mail.subject, // Subject line
        // text: mail.text, // plain text body
        html: mail.body // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, response) =>
    {
        if (error)
        {
            logger.error(error);
            callback(error, null)
        }
        else
        {
            callback(null, response)
        }
        transporter.close(); // shut down the connection pool, no more messages
    });
};