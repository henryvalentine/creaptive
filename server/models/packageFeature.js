/**
 * Created by Jack V on 8/21/2017.
 */

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let packageFeature =
        {
            title: {type: String, required: true},
            featureType: {type: String, required: true}, // checkbox, numberOption, priceOption
            featureOptions: [{name: {type: String, required: true}, value: {type: Number, required: true}}]
        };

    //now compile and register the model
    mongoose.model('PackageFeature', new mongoose.Schema(packageFeature));
};