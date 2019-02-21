/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';

module.exports = function(mongoose)
{
  // this initializes the schema for the model
  let state =
  {
    name: {type: String, required: true},
    countryId: {type: mongoose.Schema.Types.ObjectId,ref:'Country'}
  };

  //now compile and register the model
  mongoose.model('State', new mongoose.Schema(state));
};