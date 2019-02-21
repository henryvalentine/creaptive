/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let review =
    {
        note: {type: String, required: true},
        providerId: {type:mongoose.Schema.Types.ObjectId,ref:'User', required: true},
        addedBy: {type: mongoose.Schema.Types.ObjectId,ref:'User'},
        dateAdded: {type: Date, required: true},
        recommendable: {type: Boolean},
        attentionToDetails: {type: Number},
        communication: {type: Number}
    };

    //now compile and register the model
    mongoose.model('Review', new mongoose.Schema(review));
};