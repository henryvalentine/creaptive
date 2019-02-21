/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';
module.exports = function(mongoose)
{
  // this initializes the schema for the model
  let advertResource =
  {
    label: {type: String, required: true},
    description: {type: String, required: true},
    dateAdded: {type: Date, required: true},
    lastModified: {type: Date, required: true, default: Date.now},
    resourceTypeId: {type: mongoose.Schema.Types.ObjectId,ref:'resourceType'},
    filePath: {type: String, required: true},
    advert: {type: mongoose.Schema.Types.ObjectId,ref:'advert'}
  };

  //now compile and register the model
  mongoose.model('AdvertResource', new mongoose.Schema(advertResource));
};