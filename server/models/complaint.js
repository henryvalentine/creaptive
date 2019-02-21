/**
 * Created by Jack V on 8/21/2017.
 */
export default function(mongoose)
{
  // this initializes the schema for the model
   let complaint =
    {
        caption: {type: String, required: true},
        note: {type: String, required: true},
        complaintType: {type:mongoose.Schema.Types.ObjectId,ref:'ComplaintType', required: true},
        addedBy: {type:mongoose.Schema.Types.ObjectId,ref:'User'},
        order: {type:mongoose.Schema.Types.ObjectId,ref:'Order'},
        dateAdded: {type: Date, required: true},
        status: {type: Number},
        dateResolved: {type: Date},
        complainerFeedback: {type: String}
    };

  //now compile and register the model
  mongoose.model('Complaint', new mongoose.Schema(complaint));
};
