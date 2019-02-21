/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let craftRegion =
    {
        name: {type: String, required: true}
    };

    //now compile and register the model
    mongoose.model('CraftRegion', new mongoose.Schema(craftRegion));
};

// South Africa, East Africa, West Africa, North Africa, South-East Asia, Western Europe, Middle East, Far East, etc