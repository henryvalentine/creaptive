/**
 * Created by Jack V on 8/21/2017.
 */

'use strict';

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let coupon =
        {
            label: {type: String, required: true},
            description: {type: String, required: true},
            code: {type: String, required: true},
            dateAdded: {type: Date, required: true},
            expiryDate: {type: Date, required: true},
            status: {type: Number, required: true} // Active, Expired, Used
        };

    //now compile and register the model
    mongoose.model('Coupon', new mongoose.Schema(coupon));
};