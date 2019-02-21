/**
 * Created by Jack V on 8/21/2017.
 */
import mongoose, {Schema} from 'mongoose';
let orderItems =
{
    addedBy: {type:mongoose.Schema.Types.ObjectId,ref:'user'},
    orderId: {type:mongoose.Schema.Types.ObjectId,ref:'order'},
    dateUploaded: {type: Date, required: true},
    lastDateAccessed: {type: Date},
    lastDateAccessedBy: {type:mongoose.Schema.Types.ObjectId,ref:'user'},
    name: {type: String, required: true},
    absolutePath: {type: String, required: true},
    relativePath: {type: String, required: true},
    lastModified: {type: Date, default: Date.now, required: true},
    size: {type: Number, required: true},
    itemType: {type:mongoose.Schema.Types.ObjectId,ref:'resourceType'}
};

module.exports = mongoose.model('orderItems', new Schema(orderItems));