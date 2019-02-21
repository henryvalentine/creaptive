/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';
module.exports = function(mongoose)
{
  // this initializes the schema for the model
  let creativeMetadata  =
  {
    title: {type: String, required: true},
    questionCaption: {type: String, required: true},
    dataType: {type: String, required: true},   
    minimumNumberOfOptionsToChoose: {type: Number, default: 0},
    metadataOptions: [{type: mongoose.Schema.Types.ObjectId,ref:'MetadataOption'}],
    creativeSubCategory: {type: mongoose.Schema.Types.ObjectId,ref:'CreativeSubCategory'}
  };
  
  //now compile and register the model
  mongoose.model('CreativeMetadata', new mongoose.Schema(creativeMetadata));
};

// hasOptions: {type: String, required: true},
// numberOfOptionLevels: {type: Number, required: true, default: 0},