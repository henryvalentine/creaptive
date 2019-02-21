/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';
module.exports = function(mongoose)
{
  // this initializes the schema for the model
  let creativeType =
  {
    name: {type: String, required: true},
    creativeSubCategory: {type: mongoose.Schema.Types.ObjectId,ref:'CreativeSubCategory'}
  };

  //now compile and register the model
  mongoose.model('CreativeType', new mongoose.Schema(creativeType));
};