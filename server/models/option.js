/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';

export default function(mongoose)
{
    // this initializes the schema for the model
    let option =
    {
        name: {type: String, required: true}
    };

    //now compile and register the model
    mongoose.model('Option', new mongoose.Schema(option));
};