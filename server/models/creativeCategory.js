/**
 * Created by Jack V on 8/21/2017.
 */

module.exports = function(mongoose)
{
  // this initializes the schema for the model
  let creativeCategory =
  {
    name: {type: String, required: true},
    creativeSection: {type:mongoose.Schema.Types.ObjectId,ref:'CreativeSection'},
    iconType: {type: String},
    subCategories: [{type:mongoose.Schema.Types.ObjectId,ref:'CreativeSubCategory'}],
    defaultImg: {type: String}
  };

  //now compile and register the model
  mongoose.model('CreativeCategory', new mongoose.Schema(creativeCategory));
};