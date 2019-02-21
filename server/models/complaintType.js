/**
 * Created by Jack V on 8/21/2017.
 */
export default function(mongoose)
{
    // this initializes the schema for the model
    let complaintType =
    {
        name: {type: String, required: true},
        complaintTypeFor: {type: Number, required: true}
    }

    //now compile and register the model
    mongoose.model('ComplaintType', new mongoose.Schema(complaintType));
};