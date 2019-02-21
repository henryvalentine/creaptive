/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let academic =
    {
        geek: {type: mongoose.Schema.Types.ObjectId,ref:'User'},
        institution: {type: String, required: true},
        degree: {type: String, required: true},
        course: {type: String, required: true},
        graduationYear: {type: String, required: true},
        country: {type: mongoose.Schema.Types.ObjectId,ref:'Country'}
    };

    //now compile and register the model
    mongoose.model('Academic', new mongoose.Schema(academic));
};