/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';
module.exports = function(mongoose)
{
  // this initializes the schema for the model
  let creativeSubCategory =
  {
    name: {type: String, required: true},
    creativeCategory: {type: mongoose.Schema.Types.ObjectId,ref:'CreativeCategory'},
    defaultImg: {type: String}
  };

  //now compile and register the model
  mongoose.model('CreativeSubCategory', new mongoose.Schema(creativeSubCategory));
};