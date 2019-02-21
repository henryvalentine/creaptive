/**
 * Created by Jack V on 8/21/2017.
 */

'use strict';
module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let order =
        {
            service: {type:mongoose.Schema.Types.ObjectId,ref:'Service'},
            craft: {type:mongoose.Schema.Types.ObjectId,ref:'Craft'},
            orderedBy: {type:mongoose.Schema.Types.ObjectId,ref:'User', required: true},
            orderPayments: [{type:mongoose.Schema.Types.ObjectId,ref:'OrderPayment'}],
            geek: {type:mongoose.Schema.Types.ObjectId,ref:'User', required: true},
            dateOrdered: {type: Date, required: true},
            orderRef: {type: String, required: true},
            lastModified: {type: Date, required: true},
            expectedDeliveryDate: {type: Date, required: true},
            sellerDeliveryDate: {type: Date},
            sellerMarkedDelivery:  {type: Boolean, default: false},
            sellerDeliveryNote: {type: String},
            actualDeliveryDate: {type: Date},
            status: {type: Number},
            orderedServicePackage: {type:mongoose.Schema.Types.ObjectId,ref:'ServicePackage'},
            // orderedCraftPackage: {type:mongoose.Schema.Types.ObjectId,ref:'CraftPackage'},
            dateShipped: {type: Date},
            dateReceived: {type: Date},
            providedResources: [{resourceType: {type: mongoose.Schema.Types.ObjectId,ref:'ResourceType'}, location: {type: String, required: true},}]
        };
        
    //now compile and register the model
    mongoose.model('Order', new mongoose.Schema(order));
};