/**
 * Created by Jack V on 8/21/2017.
 */
import mongoose, {Schema} from 'mongoose';
let advertBid =
{
    label: {type: String, required: true},
    note: {type: String, required: true},
    advertId: {type:mongoose.Schema.Types.ObjectId,ref:'advert'},
    bidder: {type:mongoose.Schema.Types.ObjectId,ref:'user'},
    askingPrice: {type: Number}
};

module.exports = mongoose.model('advertBid', new Schema(advertBid));