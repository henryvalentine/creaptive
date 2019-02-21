/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let keyword =
    {
        name: {type: String, required: true},
        creativeSection: {type: mongoose.Schema.Types.ObjectId,ref:'CreativeSection'},
        nameUpper: {type: String, required: true}
    };

    //now compile and register the model
    mongoose.model('Keyword', new mongoose.Schema(keyword));
};