/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';
module.exports = function(mongoose)
{
  // this initializes the schema for the model
  let city =
  {
    name: {type: String, required: true},
    state: {type: mongoose.Schema.Types.ObjectId,ref:'State'}
  };

  //now compile and register the model
  mongoose.model('City', new mongoose.Schema(city));
};