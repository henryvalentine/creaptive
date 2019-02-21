/**
 * Created by Jack V on 8/21/2017.
 */
import mongoose, {Schema} from 'mongoose';
let packageType =
{
    name: {type: String, required: true} , //Standard, Pro, Ultimate
    className: {type: String, required: true}
};
module.exports = mongoose.model('PackageType', new Schema(packageType));
