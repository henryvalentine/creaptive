/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let chat =
    {
        to: {type: mongoose.Schema.Types.ObjectId,ref:'User', required: true},
        sender: {type: mongoose.Schema.Types.ObjectId,ref:'User', required: true},
        msg: {type: String, required: true},
        room: {type: String, required: true},
        read: {type: Boolean},
        received: {type: Date},
        sent: {type: Date, required: true},
        files: [{label: {type: String, required: true}, path: {type: String, required: true}, uploadedBy: {type: mongoose.Schema.Types.ObjectId,ref:'User', require: true}}]
    };

    //now compile and register the model
    mongoose.model('Chat', new mongoose.Schema(chat));
};