/**
 * Created by Jack V on 8/21/2017.
 */
import mongoose, {Schema} from 'mongoose';
let assetType =
{
  name: {type: String, required: true}
};
module.exports = mongoose.model('AssetType', new Schema(assetType));
