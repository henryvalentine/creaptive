/**
 * Created by Jack V on 8/21/2017.
 */

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let advert =
    {
        label: {type: String, required: true},
        description: {type: String, required: true},
        addedBy: {type: mongoose.Schema.Types.ObjectId,ref:'user'},
        budget: {type: Number, required: true},
        dateProfiled: {type: Date, required: true},
        expectedDeliveryPeriod: {type: Number, required: true},
        advertResources:
            [{
                label: {type: String, required: true},
                description: {type: String, required: true},
                resourceTypeId: {type: mongoose.Schema.Types.ObjectId,ref:'resourceType'},
                filePath: {type: String, required: true}
            }]
    };

    //now compile and register the model
    mongoose.model('Advert', new mongoose.Schema(advert));
};