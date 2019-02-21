/**
 * Created by Jack V on 8/21/2017.
 */
import mongoose, {Schema} from 'mongoose';
let userSkill =
{
  skilled: {type:mongoose.Schema.Types.ObjectId,ref:'Skill'},
  userId: {type:mongoose.Schema.Types.ObjectId,ref:'User'}
};
module.exports = mongoose.model('UserSkill', new Schema(userSkill));
