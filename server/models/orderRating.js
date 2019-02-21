/**
 * Created by Jack V on 8/21/2017.
 */

export default function(mongoose)
{
    // this initializes the schema for the model
    let orderRating =
    {
        caption: {type: String, required: true},
        note: {type: String},    
        addedBy: {type:mongoose.Schema.Types.ObjectId,ref:'User'},
        rating: {type: Number},
        order: {type:mongoose.Schema.Types.ObjectId,ref:'Order'},
        dateAdded: {type: Date, required: true},        
        service: {type:mongoose.Schema.Types.ObjectId,ref:'Service'},
        craft: {type:mongoose.Schema.Types.ObjectId,ref:'Craft'},
    };

    //now compile and register the model
    mongoose.model('OrderRating', new mongoose.Schema(orderRating));
};