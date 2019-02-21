/**
 * Created by Jack V on 9/22/2017.
 */

const hostKind = 'http', port = global.appPort || 80, host = 'localhost';

module.exports =
{
    appName: 'creaptive',
    port: port,
    hostKind: hostKind,
    host: host,
    email:
    {
        appPasswordResetRequestMailName: 'accounts',
        appSuccessfulPasswordResetMailName: 'accounts',
        passwordResetSubject: 'Reset your Password',
        successfulPasswordResetSubject: 'You have changed your Password',
        passwordResetRequestLink : hostKind + "://" + host + ":" + port + "/auth?tkn=",
        passwordResetLink : hostKind + "://" + host + ":" + port + "/changePassword",
        verificationLink: hostKind + "://" + host + ":" + port + "/verifyAccount?auth=",
        appVerificationMailName: 'accounts',
        verifyEmailSubject: 'Verify your account',
        smtp: 'smtp.gmail.com',
        mailPort: 465,
        mailSecure: true,
        userMail: 'gmail_address',
        userPassword: 'gmail_password'
    },
    key:
     {
        privateKey: 'private_key',
        tokenExpiry: '1d'
    },
    rave:
        {
            testSecKey: "FLWSECK-698940ecae658ad7bae3da571d4aef66-X",
            testRaveUrl: "https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/v2/verify",
            SecKey: 'rave_secrete_key',
            raveUrl: ' rave_url'
        },
    twilio: {accountSid: "accountSid", authToken: "authToken"},
    ipInfoDb:{apiKey: 'ipInfoDb_key', api: 'ipInfoDb_city_query'}
};