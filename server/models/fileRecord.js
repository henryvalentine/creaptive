/**
 * Created by Jack V on 8/21/2017.
 */
import mongoose, {Schema} from 'mongoose';

let file =
{
    name: {type: String, required: true},
    absolutePath: {type: String, required: true},
    relativePath: {type: String, required: true},
    dateCreated: {type: Date, required: true},
    lastModified: {type: Date, default: Date.now, required: true},
    size: {type: Number, required: true}
};
let fileSchema = new Schema(file);
module.exports = mongoose.model('file', fileSchema);