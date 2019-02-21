/**
 * Created by Jack V on 8/21/2017.
 */
import mongoose, {Schema} from 'mongoose';
let currency =
{
    name: {type: String, required: true},
    symbol: {type: String, required: true},
    countryId: {type:mongoose.Schema.Types.ObjectId,ref:'country'}
};
module.exports = mongoose.model('currency', new Schema(currency));
