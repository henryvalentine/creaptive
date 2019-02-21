/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';
module.exports = function(mongoose)
{
  let serviceMetadata  =
  {
     textValue: {type: String, required: false},
     metadata: {type: mongoose.Schema.Types.ObjectId,ref:'CreativeMetadata', required: true},
     service: {type: mongoose.Schema.Types.ObjectId,ref:'Service', required: true},
     metadataOption: {type: mongoose.Schema.Types.ObjectId,ref:'MetadataOption', required: false},
     metadataOptionRange: {fromOption: {type: mongoose.Schema.Types.ObjectId,ref:'MetadataOption', required: false}, toOption: {type: mongoose.Schema.Types.ObjectId,ref:'MetadataOption', required: false}},
     providedDate: {type: Date, required: false},
     providedDateRange: {startDate: {type: Date, required: false}, endDate: {type: Date, required: false}},
     checkedOptions: [{type: mongoose.Schema.Types.ObjectId,ref:'MetadataOption', required: false}]
  };
  mongoose.model('ServiceMetadata', new mongoose.Schema(serviceMetadata));
};