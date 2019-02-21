/**
 * Created by Jack V on 9/22/2017.
 */

let CreativeMetadata = '';
let MetadataOption = '';
let ServiceMetadata = '';
let Option = '';
const init = (app, mongoose) =>
{
    CreativeMetadata = mongoose.model('CreativeMetadata');
    Option = mongoose.model('Option');
    MetadataOption = mongoose.model('MetadataOption');
    ServiceMetadata = mongoose.model('ServiceMetadata');

    app.post('/addCreativeMetadata', addCreativeMetadata);
    app.post('/addMetadataOption', addMetadataOption);
    app.post('/editCreativeMetadata', editCreativeMetadata);
    app.post('/editMetadataOption', editMetadataOption);
    app.post('/deleteCreativeMetadata', deleteCreativeMetadata);
    app.post('/getCreativeMetadata', getCreativeMetadata);
    app.get('/getCreativeMetadataBySubCategory', getCreativeMetadataBySubCategory);
    app.get('/getAllCreativeMetadata', getAllCreativeMetadata);
    app.get('/getAllCreativeMetadataOptions', getAllCreativeMetadataOptions);
    app.get('/getCreativeMetadataList', getCreativeMetadataList);
    app.get('/getMetadataOptions', getMetadataOptions);
    app.post('/populateMetadataOptions', populateMetadataOptions);
    app.post('/toggleMetadataOption', toggleMetadataOption);
};
 
function addCreativeMetadata(req, res)
{
    let creativeMetadata = req.body;
    if(creativeMetadata === undefined || creativeMetadata === null || creativeMetadata.title.length < 1 || creativeMetadata.questionCaption.length < 1 || creativeMetadata.dataType.length < 1  || creativeMetadata.creativeSubCategory.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all fields and try again'});
    }
    else
    {
        let finder = { $and: [ { title: creativeMetadata.title }, { creativeSubCategory: creativeMetadata.creativeSubCategory } ] };
        CreativeMetadata.findOne(finder, (err, existingCreativeMetadata) =>
        {
            if (!existingCreativeMetadata)
            {
                const newCreativeMetadata = new CreativeMetadata(creativeMetadata);
                return newCreativeMetadata.save((err, savedCreativeMetadata) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, creativeMetadataId: savedCreativeMetadata._id, message: 'Creative Metadata was successfully added'});
                    }
                });

            }
            else {
                return res.json({code: 5, creativeMetadataId: existingCreativeMetadata._id, message: 'Request was successfully executed'});
            }
        });
    }

}

function addMetadataOption(req, res)
{
    let metadataOption = req.body;
    if(metadataOption === undefined || metadataOption === null || metadataOption.creativeMetadata.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all required fields and try again'});
    }
    else
    {
        // let finder = { $and: [ { option: metadataOption.option }, { creativeMetadata: metadataOption.creativeMetadata } ] };
        MetadataOption.findOne({option: metadataOption.option, creativeMetadata: metadataOption.creativeMetadata}).exec((err, meta) =>
        {
            if (!meta)
            {
                const newMetadataOption = new MetadataOption(metadataOption);
                newMetadataOption.save((err, savedMetadataOption) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        CreativeMetadata.findOne({_id: metadataOption.creativeMetadata}).exec((err, creativeMetadata) =>
                        {
                            if (!err && creativeMetadata !== null)
                            {
                                let mtOpts = creativeMetadata.metadataOptions.filter((m) => {
                                    return m === savedMetadataOption._id;
                                });
                                if(mtOpts.length < 1)
                                {
                                    creativeMetadata.metadataOptions.push(savedMetadataOption._id);
                                    creativeMetadata.save((err, mt) => {});
                                }

                                MetadataOption.find({creativeMetadata: metadataOption.creativeMetadata}).populate('option').exec((error, metadataOptions) =>
                                {
                                    if (err)
                                    {
                                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                    }
                                    else
                                    {
                                        return res.json({
                                            code: 5,
                                            metadataOptions: metadataOptions,
                                            metadataOptionId: savedMetadataOption._id,
                                            message: 'Request was successfully executed'
                                        });
                                    }
                                });
                            }
                            else{
                                return res.json({code: -1, message: 'An error was encountered. Please try again'});
                            }
                        });
                    }
                })
            }
            else
            {
                MetadataOption.find({creativeMetadata: metadataOption.creativeMetadata}).populate('option').exec((error, metadataOptions) =>
                {
                    return res.json({
                        code: 5,
                        metadataOptions: metadataOptions,
                        metadataOptionId: meta._id,
                        message: 'Request was successfully executed'
                    });

                });
            }
        });
    }
}

function editCreativeMetadata(req, res)
{
    let creativeMetadata = req.body;
    if(creativeMetadata === undefined || creativeMetadata === null || creativeMetadata.title.length < 1 || creativeMetadata.questionCaption.length < 1 || creativeMetadata.dataType.length < 1  || creativeMetadata.creativeSubCategory.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all required fields and try again'});
    }
    else
    {
        CreativeMetadata.findOne({_id: creativeMetadata._id}, (err, existingCreativeMetadata) =>
        {
            if (!existingCreativeMetadata)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            if (existingCreativeMetadata === null)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                existingCreativeMetadata.title = creativeMetadata.title;
                existingCreativeMetadata.questionCaption = creativeMetadata.questionCaption;
                existingCreativeMetadata.dataType = creativeMetadata.dataType;
                existingCreativeMetadata.hasOptions = creativeMetadata.hasOptions;
                existingCreativeMetadata.numberOfOptionLevels = creativeMetadata.numberOfOptionLevels;
                existingCreativeMetadata.creativeSubCategory = creativeMetadata.creativeSubCategory;
                existingCreativeMetadata.minimumNumberOfOptionsToChoose = creativeMetadata.minimumNumberOfOptionsToChoose;

                return existingCreativeMetadata.save((err, savedCreativeMetadata) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, creativeMetadataId: savedCreativeMetadata.id, message: 'Request was successfully executed'});
                    }
                });
            }
        });
    }

}

function editMetadataOption(req, res)
{
    let metadataOption = req.body;
    if(metadataOption === undefined || metadataOption === null || metadataOption.creativeMetadata.length < 1 || metadataOption.level.length < 1 || metadataOption.option.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all required fields and try again'});
    }
    else
    {
        //option && met => check
        MetadataOption.findOne({_id: metadataOption._id}).exec((err, meta) =>
        {
            if(err || meta === null)
            {
                return res.json({code: -1, message: 'An unknown error was encountered. Please and try again'});
            }
            else
            {
                meta.creativeMetadata = metadataOption.creativeMetadata;
                meta.status = metadataOption.status;
                meta.option = metadataOption.option;

                meta.save((err, savedMetadataOption) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        MetadataOption.find({creativeMetadata: metadataOption.creativeMetadata}).populate('option').exec((error, metadataOptions) =>
                        {
                            if (err)
                            {
                                return res.json({code: -1, message: 'An error was encountered. Please try again'});
                            }
                            else
                            {
                                return res.json({
                                    code: 5,
                                    metadataOptions: metadataOptions,
                                    metadataOptionId: savedMetadataOption._id,
                                    message: 'Request was successfully executed'
                                });
                            }
                        });
                    }
                })
            }
        });
    }
}

function deleteCreativeMetadata(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
    else
    {
        CreativeMetadata.remove({_id: id}).exec(err =>
        {
            if(err)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                return res.json({code: 5, creativeMetadataId: id, message: 'Request was successfully executed'});
            }
        });
    }
}

function getCreativeMetadataBySubCategory(req, res)
{
    try{
        let subcategory = req.query.subcategory;

        if(subcategory === undefined || subcategory === null || subcategory.length < 1)
        {
            return res.json([]);
        }
        else
        {
            CreativeMetadata.find({creativeSubCategory: subcategory}).populate({path: 'metadataOptions', populate: {path: 'option'}}).exec((err, creativeMetadata) =>
            {
                if (err || !creativeMetadata)
                {
                    console.log('\nERR\n');
                    console.log(err);
                    return res.json([]);
                }
                else
                {
                    return res.json(creativeMetadata);
                }
            });
        }
    }
    catch(e)
    {
        console.log('\nMeta ERR\n');
        console.log(e);
        return res.json([]);
    }
}

function getCreativeMetadata(req, res)
{
    let id = req.query.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'Invalid selection!'});
    }
    else
    {
        CreativeMetadata.findOne({_id: id}).populate({path: 'creativeSubCategory', populate: {path: 'creativeCategory', populate: {path: 'creativeSection'}}}).exec((err, creativeMetadata) =>
        {
            if (!creativeMetadata)
            {
                return res.json({code: -1, message: 'Creative Metadata was not found'});
            }
            else
            {
                if(creativeMetadata.hasOptions === true)
                {
                    MetadataOption.find({creativeMetadata: creativeMetadata._id}).populate('Option').exec((err, options) =>
                    {
                        if (!options)
                        {
                            return res.json({code: -1, message: 'Creative Metadata was not found'});
                        }
                        else
                        {
                            creativeMetadata.options = options;
                            return res.json({code: 5, creativeMetadata: creativeMetadata});
                        }
                    });
                }
                else
                {
                    return res.json({code: 5, creativeMetadata: creativeMetadata});
                }

            }
        });
    }
}

function getMetadataOptions(req, res)
{
    let id = req.query.metadataId;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'Invalid selection!'});
    }
    else
    {
        MetadataOption.find({creativeMetadata: id}).populate('option').exec((err, options) =>
        {
            if (!options)
            {
                return res.json({code: -1, message: 'Creative Metadata was not found'});
            }
            else
            {
                return res.json({code: 5, options: options});
            }
        });
    }
}

function getCreativeMetadataList(req, res)
{
    var find = (req.query.searchText && req.query.searchText.length > 0)? { name: { "$regex": req.query.searchText, "$options": "i" } } : {};

    CreativeMetadata.count(find).exec((err, num) =>
    {
        if(num === undefined || num < 1)
        {
            return res.json({totalItems: 0, items: []});
        }
        else
        {
            CreativeMetadata.find(find).populate({path: 'creativeSubCategory'}).sort({name: req.query.sortOrder}).skip((req.query.page - 1) * req.query.itemsPerPage).limit(parseInt(req.query.itemsPerPage)).exec((err, results) => {

                if(results !== null)
                {
                    return res.json({totalItems: num, items: results});
                }
                else
                {
                    return res.json({totalItems: 0, items: []});
                }
            });
        }
    });
}

const getAllCreativeMetadata = (req, res) =>
{
    CreativeMetadata.find({}).populate({path: 'metadataOptions', populate: {path: 'option'}}).populate({path: 'creativeSubCategory', populate: {path: 'creativeCategory', populate: {path: 'creativeSection'}}}).exec((error, creativeMetadatas) =>
    {
        return res.json(creativeMetadatas);
    });
};

const getAllCreativeMetadataOptions = (req, res) =>
{
    Option.find({}).exec((error, creativeMetadataOptions) =>
    {
        return res.json(creativeMetadataOptions);
    });
};

function populateMetadataOptions(req, res)
{
    MetadataOption.find({}).populate('creativeMetadata').exec((err, options) =>
    {
        if (!options)
        {
            return res.json({code: -1, message: 'Creative Metadata was not found'});
        }
        else
        {
            console.log(options);
            options.forEach((o) =>
            {
                if(o.creativeMetadata.metadataOptions === undefined || o.creativeMetadata.metadataOptions === null)
                {
                    o.creativeMetadata.metadataOptions = [];
                    o.creativeMetadata.metadataOptions.push(o._id);
                }
                else{
                    let es = o.creativeMetadata.metadataOptions.filter((p) =>
                    {
                        return p === o._id;
                    });
                    if(es.length < 1)
                    {
                        o.creativeMetadata.metadataOptions.push(o._id);
                    }
                }
                o.creativeMetadata.save();
            });
            return res.json({code: 5, options: options});
        }
    });
}

function toggleMetadataOption(req, res)
{
    let query = req.query;
    let id = query.id;
    let status = query.status;
    if(query === undefined || id === undefined || status === undefined)
    {
        return res.json({code: -1, message: 'Invalid selection'});
    }
    else
    {
        MetadataOption.findOne({_id: id}).exec((err, meta) =>
        {
            if(err !== null || meta === null)
            {
                return res.json({code: -1, message: 'An unknown error was encountered. Please and try again'});
            }
            else
            {
                meta.status = status;
                meta.save((error, savedOption) =>
                {
                    if (error !== null)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({
                            code: 5,
                            message: 'Request was successfully executed'
                        });
                    }
                })
            }
        });
    }
}

module.exports = init;
