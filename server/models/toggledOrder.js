/**
 * Created by Jack V on 8/21/2017.
 */

'use strict';

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let toggledOrder =
        {
            note: {type: String, required: true},
            order: {type:mongoose.Schema.Types.ObjectId,ref:'Order', required: true},
            orderToggleReason: {type:mongoose.Schema.Types.ObjectId,ref:'OrderToggleReason', required: true},
            dateProfiled: {type: Date, required: true},
            addedBy: {type:mongoose.Schema.Types.ObjectId,ref:'user'},
            resolution: {type:mongoose.Schema.Types.ObjectId,ref:'Resolution'},
            resolutionInitiated: {type: Boolean},
            resolutionStatus: {type: Number}
        };

    //now compile and register the model
    mongoose.model('ToggledOrder', new mongoose.Schema(toggledOrder));
};