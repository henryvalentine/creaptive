/**
 * Created by Jack V on 8/21/2017.
 */

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let servicePackage =
        {
            // title: {type: String, required: true},
            service: {type:mongoose.Schema.Types.ObjectId,ref:'Service', required: true},
            description: {type: String},
            package: {type:mongoose.Schema.Types.ObjectId,ref:'PricePackage', required: true},
            packageType: {type:mongoose.Schema.Types.ObjectId,ref:'PackageType', required: true},
            delivery: {type: Number, required: true},
            price: {type: Number, required: true},
            selectedFeatures: [{feature: {type:mongoose.Schema.Types.ObjectId,ref:'PackageFeature'}, value: {type: String}}],
            packageExtras: [{feature: {type:mongoose.Schema.Types.ObjectId,ref:'PackageFeature'}, value: {type: String}, selectedOption: {type: String}}]
        };

    //now compile and register the model
    mongoose.model('ServicePackage', new mongoose.Schema(servicePackage));
};