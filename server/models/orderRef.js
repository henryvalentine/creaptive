/**
 * Created by Jack V on 8/21/2017.
 */

'use strict';

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let orderRef =
        {
            buyer: {type:mongoose.Schema.Types.ObjectId,ref:'User', required: true},
            code: {type: String, required: true},
            dateGenerated: {type: Date, required: true},
            dateUtilised: {type: Date},
            status: {type: Number, required: true} // used, UnUsed
        };

    //now compile and register the model
    mongoose.model('OrderRef', new mongoose.Schema(orderRef));
};