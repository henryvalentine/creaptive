/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';
module.exports = function(mongoose)
{
  // this initializes the schema for the model
  let suggestedServiceMetadata =
  {
    name: {type: String, required: true},
    serviceId: {type: mongoose.Schema.Types.ObjectId,ref:'Service'},
    addedBy: {type: mongoose.Schema.Types.ObjectId,ref:'User'},
    dateAdded: {type: Date, required: true},
    approvalStatus: {type: Boolean, default: false, required: true},
    approvedBy: {type: mongoose.Schema.Types.ObjectId,ref:'User'}
  };

  //now compile and register the model
  mongoose.model('SuggestedServiceMetadata', new mongoose.Schema(suggestedServiceMetadata));
};