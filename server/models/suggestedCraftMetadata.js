/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';
module.exports = function(mongoose)
{
  // this initializes the schema for the model
  let suggestedCraftMetadata =
  {
    name: {type: String, required: true},
    craftId: {type: mongoose.Schema.Types.ObjectId,ref:'Craft'},
    addedBy: {type: mongoose.Schema.Types.ObjectId,ref:'User'},
    dateAdded: {type: Date, required: true},
    approvalStatus: {type: Boolean, default: false, required: true},
    approvedBy: {type: mongoose.Schema.Types.ObjectId,ref:'User'}
  };

  //now compile and register the model
  mongoose.model('SuggestedCraftMetadata', new mongoose.Schema(suggestedCraftMetadata));
};