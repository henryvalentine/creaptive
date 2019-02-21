/**
 * Created by Jack V on 8/21/2017.
 */
import mongoose, {Schema} from 'mongoose';
let resolution =
{
  name: {type: String, required: true} //Repackaging done, Replaced, Modified, Refunded, etc
};
module.exports = mongoose.model('resolution', new Schema(resolution));
