/**
 * Created by Jack V on 8/21/2017.
 */

module.exports = function(mongoose)
{
    // this initializes the schema for the model
    let creativeSection =
    {
        name: {type: String, required: true}
    };

    //now compile and register the model
    mongoose.model('CreativeSection', new mongoose.Schema(creativeSection));
};
