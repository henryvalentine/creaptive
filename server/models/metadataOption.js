/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';
module.exports = function(mongoose)
{
  let metadataOption  =
  {
    option: {type: mongoose.Schema.Types.ObjectId,ref:'Option'},
    creativeMetadata: {type: mongoose.Schema.Types.ObjectId,ref:'CreativeMetadata'},
    status: {type: Boolean, default: true}
  };
  mongoose.model('MetadataOption', new mongoose.Schema(metadataOption));
};

