/**
 * Created by Jack V on 8/21/2017.
 */
import mongoose, {Schema} from 'mongoose';
let resourceType =
{
    name: {type: String, required: true},
    extension: {type: String, required: true}
};

module.exports = mongoose.model('resourceType', new Schema(resourceType));