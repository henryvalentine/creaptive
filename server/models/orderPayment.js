/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';
module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let orderPayment =
        {
            order: {type:mongoose.Schema.Types.ObjectId,ref:'Order', index: true},
            coupon: {type:mongoose.Schema.Types.ObjectId,ref:'Coupon'},
            flwRef: {type: String, required: true},
            subTotal: {type: Number, required: true},
            grossAmount: {type: Number, required: true},
            vat: {type: Number},
            netAmount: {type: Number, required: true},
            creaptive: {type: Number, required: true},
            amountPaid: {type: Number, required: true},
            couponValue: {type: Number},
            datePaid: {type: Date, required: true},
            appFee: {type: Number},//Gateway charges
            amountSettledForTransaction: {type: Number},
            paymentType: {type: String},
            currency: {type: String}
        };

    //now compile and register the model
    mongoose.model('OrderPayment', new mongoose.Schema(orderPayment));
};