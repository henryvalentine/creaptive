/**
 * Created by Jack V on 8/21/2017.
 */
import mongoose, {Schema} from 'mongoose';
let serviceOrderExtra =
{
    label: {type: String, required: true},
    description: {type: String, required: true},
    priceTag: {type: Number, required: true},
    serviceOrderId: {type:mongoose.Schema.Types.ObjectId,ref:'serviceOrder'}
};

module.exports = mongoose.model('serviceOrderExtra', new Schema(serviceOrderExtra));