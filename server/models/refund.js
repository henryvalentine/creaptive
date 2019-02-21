/**
 * Created by Jack V on 8/21/2017.
 */
import mongoose, {Schema} from 'mongoose';
let refund =
{
  orderId: {type:mongoose.Schema.Types.ObjectId,ref:'craftOrder'},
  dateProfiled: {type: Date, required: true},
  addedBy: {type:mongoose.Schema.Types.ObjectId,ref:'user'},
  totalAmountPaid: {type: Number},
  totalAmountRefunded: {type: Number},
  dateRefunded: {type: Date}
};
module.exports = mongoose.model('refund', new Schema(refund));
