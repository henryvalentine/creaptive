/**
 * Created by Jack V on 8/21/2017.
 */
import mongoose, {Schema} from 'mongoose';
let reviewResponse =
{
    reviewId: {type:mongoose.Schema.Types.ObjectId,ref:'review', required: true},
    addedBy: {type:mongoose.Schema.Types.ObjectId,ref:'user'},
    dateAdded: {type: Date, required: true}
};

module.exports = mongoose.model('reviewResponse', new Schema(reviewResponse));