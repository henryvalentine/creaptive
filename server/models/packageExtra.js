/**
 * Created by Jack V on 8/21/2017.
 */

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let packageExtra =
        {
            title: {type: String, required: true},
            price: {type: Number, required: true},
            description: {type: String, required: true},
            approved: {type: Boolean, required: true},
            addedDays: {type: Number, required: true}
        };

    //now compile and register the model
    mongoose.model('PackageExtra', new mongoose.Schema(packageExtra));
};