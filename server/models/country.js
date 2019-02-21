/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let country =
    {
        name: {type: String, required: true},
        countryCode: {type: String, required: true},
        currency: {type: String, required: true},
        currencyCode: {type: String, required: true}
    };

    //now compile and register the model
    mongoose.model('Country', new mongoose.Schema(country));
};