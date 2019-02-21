/**
 * Created by Jack V on 8/21/2017.
 */
import mongoose, {Schema} from 'mongoose';
let userSuggestion =
{
    caption: {type: String, required: true},
    note: {type: String},
    addedBy: {type:mongoose.Schema.Types.ObjectId,ref:'user'},
    dateAdded: {type: Date, required: true},
    attended: {type: Boolean}
};

module.exports = mongoose.model('userSuggestion', new Schema(userSuggestion));