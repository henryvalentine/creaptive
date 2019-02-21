/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';
module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let craft =
    {
        label: {type: String, required: true},
        description: {type: String, required: true},
        bannerImage: {type: String, required: true},
        creativeType: {type: mongoose.Schema.Types.ObjectId,ref:'CreativeType', required: true},
        craftRegion: {type: mongoose.Schema.Types.ObjectId,ref:'CraftRegion', required: true},
        addedBy: {type: mongoose.Schema.Types.ObjectId,ref:'User'},
        priceTag: {type: Number, required: true},
        dateProfiled: {type: Date, required: true},
        frontViewImagePath: {type: String},
        leftViewImage: {type: String},
        rightViewImagePath: {type: String},
        rearViewImagePath: {type: String},
        topViewImagePath: {type: String},
        bottomViewImagePath: {type: String},
        ratings: [{type: mongoose.Schema.Types.ObjectId,ref:'OrderRating'}],
        details: [{label: {type: String, required: true}, description: {type: String, required: true}, priceTag: {type: Number}}]
    };

    //now compile and register the model
    mongoose.model('Craft', new mongoose.Schema(craft));
};