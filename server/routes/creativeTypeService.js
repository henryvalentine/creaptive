/**
 * Created by Jack V on 9/22/2017.
 */

let CreativeType = '';
const init = (app, mongoose) =>
{
    CreativeType = mongoose.model('CreativeType');
    app.post('/addCreativeType', addCreativeType);
    app.post('/editCreativeType', editCreativeType);
    app.post('/deleteCreativeType', deleteCreativeType);
    app.post('/getCreativeType', getCreativeType);
    app.get('/getAllCreativeTypes', getAllCreativeTypes);
    app.get('/getCreativeTypes', getCreativeTypes);
    app.get('/getCreativeTypesBySubCategory', getCreativeTypesBySubCategory);
};

function addCreativeType(req, res)
{
    let creativeType = req.body;
    if(creativeType === undefined || creativeType === null || creativeType.name.length < 1 || creativeType.creativeSubCategory.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all fields and try again'});
    }
    else
    {
        CreativeType.findOne({name: creativeType.name}, (err, existingCreativeType) =>
        {
            if (!existingCreativeType)
            {
                const newCreativeType = new CreativeType(creativeType);
                return newCreativeType.save((err, savedCreativeType) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, creativeTypeId: savedCreativeType._id, message: 'Creative Type was successfully added'});
                    }
                });

            }
            else
            {
                existingCreativeType.creativeSubCategory = creativeType.creativeSubCategory;
                return existingCreativeType.save((err, savedExiStingCreativeType) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, creativeTypeId: savedExiStingCreativeType._id, message: 'Creative Type was successfully added'});
                    }
                });
            }
        });
    }

}

function editCreativeType(req, res)
{
    let creativeType = req.body;
    if(creativeType === undefined || creativeType === null || creativeType.name.length < 1 || creativeType._id.length < 1 || creativeType.creativeSubCategory.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all required inputs and try again'});
    }
    else
    {
        CreativeType.findOne({_id: creativeType._id}, (err, existingCreativeType) =>
        {
            if (!existingCreativeType)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                existingCreativeType.name = creativeType.name;
                existingCreativeType.creativeSubCategory = creativeType.creativeSubCategory;
                return existingCreativeType.save((err, savedCreativeType) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, creativeTypeId: savedCreativeType._id, message: 'Request was successfully executed'});
                    }
                });
            }
        });
    }

}

function deleteCreativeType(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
    else
    {
        CreativeType.remove({_id: id}).exec(err =>
        {
            if(err)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                return res.json({code: 5, creativeTypeId: id, message: 'Request was successfully executed'});
            }
        });
    }
}

function getCreativeType(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'Invalid selection!'});
    }
    else
    {
        CreativeType.findOne({_id: id}).populate({path: 'creativeSubCategory', populate: {path: 'creativeCategory'}}).exec((err, creativeType) =>
        {
            if (!creativeType)
            {
                return res.json({code: -1, message: 'Creative Type was not found'});
            }
            else
            {
                return res.json({code: 5, creativeType: creativeType});
            }
        });
    }
}

function getCreativeTypes(req, res)
{
    var find = (req.query.searchText && req.query.searchText.length > 0)? { name: { "$regex": req.query.searchText, "$options": "i" } } : {};

    CreativeType.count(find).exec((err, num) =>
    {
        if(num === undefined || num < 1)
        {
            return res.json({totalItems: 0, items: []});
        }
        else
        {
            CreativeType.find(find).populate({path: 'creativeSubCategory', populate: {path: 'creativeCategory', populate: {path: 'creativeSection'}}}).sort({name: req.query.sortOrder}).skip((req.query.page - 1) * req.query.itemsPerPage).limit(parseInt(req.query.itemsPerPage)).exec((err, results) => {

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

function getCreativeTypesBySubCategory(req, res)
{
    let subcategory = req.query.subcategory;
    CreativeType.find({creativeSubCategory: subcategory}).populate('CreativeSubCategory').exec((err, results) => {

        if(results !== null)
        {
            return res.json(results);
        }
        else
        {
            return res.json([]);
        }
    });
}

const getAllCreativeTypes = (req, res) =>
{
    CreativeType.find({}).populate({path: 'creativeSubCategory', populate: {path: 'creativeCategory'}}).exec((error, creativeTypes) =>
    {
        return res.json(creativeTypes);
    });
};

module.exports = init;