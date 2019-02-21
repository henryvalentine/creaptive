/**
 * Created by Jack V on 8/21/2017.
 */
import mongoose, {Schema} from 'mongoose';
let serviceResource =
{
  title: {type: String, required: true},
  description: {type: String, required: true},
  dateAdded: {type: Date, required: true},
  lastModified: {type: Date, required: true, default: Date.now},
  resourceType: {type:mongoose.Schema.Types.ObjectId,ref:'ResourceType'},
  service: {type:mongoose.Schema.Types.ObjectId,ref:'Service'},
  location: {type: String},
};

module.exports = mongoose.model('ServiceResource', new Schema(serviceResource));