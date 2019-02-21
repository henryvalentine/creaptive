/**
 * Created by Jack V on 8/21/2017.
 */
'use strict';

export default function(mongoose)
{
    // this initializes the schema for the model
    let service =
    {
        title: {type: String, required: true},
        description: {type: String, required: true},
        bannerImage: {type: String},
        secondImage: {type: String},
        thirdImage: {type: String},
        addedBy: {type: mongoose.Schema.Types.ObjectId,ref:'User'},
        dateProfiled: {type: Date, required: true},
        lastModified: {type: Date, required: true},
        lastViewed: {type: Date},
        creativeType: {type: mongoose.Schema.Types.ObjectId,ref:'CreativeType'},
        creativeSubCategory: {type: mongoose.Schema.Types.ObjectId,ref:'CreativeSubCategory'},
        creativeCategory: {type: mongoose.Schema.Types.ObjectId,ref:'CreativeCategory'},
        numberOfTimesViewed: {type: Number},
        techStacks: [{type: mongoose.Schema.Types.ObjectId,ref:'TechnologyStack'}],
        pdfResource: {name: {type: String}, path: {type: String}},
        videoResource: {name: {type: String}, path: {type: String}},
        packages: [{type: mongoose.Schema.Types.ObjectId,ref:'ServicePackage'}],
        keywords: [{type: mongoose.Schema.Types.ObjectId,ref:'Keyword'}],
        metadata: [{type: mongoose.Schema.Types.ObjectId,ref:'ServiceMetadata'}],
        ratings: [{type: mongoose.Schema.Types.ObjectId, ref:'OrderRating'}],
        serviceStatus: {type: Number}
    };

    //now compile and register the model
    mongoose.model('Service', new mongoose.Schema(service));
};
