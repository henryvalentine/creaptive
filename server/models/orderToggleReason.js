/**
 * Created by Jack V on 8/21/2017.
 */


'use strict';

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let orderToggleReason =
        {
            name: {type: String, required: true} //Repackaging needed, Modifications needed, damaged in transit, No longer interested,
        };

    //now compile and register the model
    mongoose.model('OrderToggleReason', new mongoose.Schema(orderToggleReason));
};