/**
 * Created by Jack V on 8/21/2017.
 */
import mongoose, {Schema} from 'mongoose';
let paymentType =
{
    name: {type: String, required: true} //Bank Transfer, Credit/Debit card
};
module.exports = mongoose.model('paymentType', new Schema(paymentType));
