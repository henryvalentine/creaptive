/**
 * Created by Jack V on 8/21/2017.
 */

import bCrypt from 'bcrypt';
'use strict';
module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let user = new mongoose.Schema({
        firstName: {type: String},
        middleName: {type: String},
        geekName: {type: String},
        geekNameUpper: {type: String},
        lastName: {type: String},
        email: {type: String, required: true},
        emailConfirmed: {type: Boolean, required: true, default: false},
        phoneNumber: {type: String},
        phoneCode: {type: String},
        phoneCodeGeneratedAt: {type: Date},
        phoneNumberConfirmed: {type: Boolean, default: false},
        datePhoneConfirmed: {type: Date},
        password: {type: String, required: true},
        issueCount: {type: Number},
        gender: {type: String},
        languages: [{name: {type: String}, proficiency: {type: String}}],
        onlineStatus: {type: Boolean, default: false},
        securityStamp: {type: String, required: true},
        dob: {type: Date},
        lastSeen: {type: Date},
        dateRegistered: {type: Date, required: true},
        profileLastUpdated: {type: Date, default: Date.now, required: true},
        rating: {type: Number},
        status: {type: Number},
        summary: {type: String},
        professionalCaption: {type: String},
        successfulDealsDelivered: {type: Number},
        numberOfRequestsPosted: {type: Number},
        numberOfJobsPosted: {type: Number},
        profileImagePath: {type: String},
        topSpecialties: [{skill: {type: mongoose.Schema.Types.ObjectId, ref:'Skill'}, level: {type: String}}],
        services: [{type: mongoose.Schema.Types.ObjectId, ref:'Service'}],
        crafts: [{type: mongoose.Schema.Types.ObjectId, ref:'Craft'}],
        friends: [{user: {type: mongoose.Schema.Types.ObjectId, ref:'User'}, isMentor: {type: Boolean}}],
        recommendedServices: [{recommendedBy: {type: mongoose.Schema.Types.ObjectId, ref:'User'}, service: {type: mongoose.Schema.Types.ObjectId, ref:'Service'}, dateRecommended: {type: Date}, isClicked: {type: Boolean}, dateClicked: {type: Date}}],
        recommendedCrafts: [{recommendedBy: {type: mongoose.Schema.Types.ObjectId, ref:'User'}, craft: {type: mongoose.Schema.Types.ObjectId, ref:'Craft'}, dateRecommended: {type: Date}, isClicked: {type: Boolean}, dateClicked: {type: Date}}],
        role: {type: String},
        academics: [{type: mongoose.Schema.Types.ObjectId,ref:'Academic'}],
        location: {country: {type: String}, ip: {type: String}, city: {type: String}}
    });
    
    user.statics.authenticate = function (email, password, callback)
    {
        user.findOne({ email: email })
            .exec(function (err, user)
            {
                if (err)
                {
                    return callback(err)
                } else if (!user)
                {
                    let error = new Error('User not found.');
                    error.status = 401;
                    return callback(error);
                }
                bCrypt.compare(password, user.password, function (err, result)
                {
                    if (result === true)
                    {
                        return callback(null, user);
                    } else {
                        return callback();
                    }
                })
            });
    };

    //now compile and register the model
    mongoose.model('User', user);
};
