/**
 * Created by Jack V on 8/21/2017.
 */

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let pricePackage =
        {
            creativeSubCategory: {type: mongoose.Schema.Types.ObjectId,ref:'CreativeSubCategory', required: true},
            section: {type: mongoose.Schema.Types.ObjectId,ref:'CreativeSection', required: true},
            dateProfiled: {type: Date, required: true},
            packageFeatures: [{type:mongoose.Schema.Types.ObjectId,ref:'PackageFeature'}]
        };

    //now compile and register the model
    mongoose.model('PricePackage', new mongoose.Schema(pricePackage));
};