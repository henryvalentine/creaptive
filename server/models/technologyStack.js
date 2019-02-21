/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let technologyStack =
    {
        name: {type: String, required: true}
    };

    //now compile and register the model
    mongoose.model('TechnologyStack', new mongoose.Schema(technologyStack));
};