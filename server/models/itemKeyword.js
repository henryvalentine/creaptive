/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';
module.exports = function(mongoose)
{
  // this initializes the schema for the model
  let itemKeyword =
  {
    service: {type: mongoose.Schema.Types.ObjectId,ref:'Service'},
    craft: {type: mongoose.Schema.Types.ObjectId,ref:'Craft'},
    keyword: {type: mongoose.Schema.Types.ObjectId,ref:'Keyword'}
  };

  //now compile and register the model
  mongoose.model('ItemKeyword', new mongoose.Schema(itemKeyword));
};