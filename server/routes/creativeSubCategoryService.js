/**
 * Created by Jack V on 9/22/2017.
 */

let CreativeSubCategory = '';
let CreativeCategory = '';
const init = (app, mongoose) =>
{
    CreativeSubCategory = mongoose.model('CreativeSubCategory');
    CreativeCategory = mongoose.model('CreativeCategory');
    app.post('/addCreativeSubCategory', addCreativeSubCategory);
    app.post('/editCreativeSubCategory', editCreativeSubCategory);
    app.post('/deleteCreativeSubCategory', deleteCreativeSubCategory);
    app.post('/getCreativeSubCategory', getCreativeSubCategory);
    app.get('/getAllCreativeSubCategories', getAllCreativeSubCategories);
    app.get('/getCreativeSubCategories', getCreativeSubCategories);
    app.get('/getSctrsByCtr', getCreativeSubCategoriesByCategory);
};

function addCreativeSubCategory(req, res)
{
    let creativeSubCategory = req.body;
    if(creativeSubCategory === undefined || creativeSubCategory === null || creativeSubCategory.name.length < 1 || creativeSubCategory.creativeCategory.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all fields and try again'});
    }
    else
    {
        CreativeCategory.findOne({_id: creativeSubCategory.creativeCategory}).exec((err, category) =>
        {
            if (!category || category === null)
            {
               return res.json({code: -1, message: 'An error was encountered. Please try again'});    
            }
            else
            {
                CreativeSubCategory.findOne({name: creativeSubCategory.name}).exec((err, existingCreativeSubCategory) =>
                {
                    if (!existingCreativeSubCategory)
                    {
                        const newCreativeSubCategory = new CreativeSubCategory(creativeSubCategory);
                        return newCreativeSubCategory.save((error, savedCreativeSubCategory) =>
                        {
                            console.log(error);
                            if (error)
                            {
                                return res.json({code: -1, message: 'An error was encountered. Please try again'});
                            }
                            else
                            {
                                if(!category.subCategories || category.subCategories === null || category.subCategories.length < 1)
                                {
                                    category.subCategories.push(savedCreativeSubCategory._id);
                                }
                                else
                                {
                                    let y = category.subCategories.find(cs => cs === savedCreativeSubCategory._id);
                                    if(!y || y === null)
                                    {
                                        category.subCategories.push(savedCreativeSubCategory._id);
                                    }
                                }
                                
                                return category.save((err, sv) =>
                                {
                                    if (err)
                                    {
                                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                    }
                                    else
                                    {
                                        return res.json({code: 5, creativeSubCategoryId: savedCreativeSubCategory._id, message: 'Request was successfully executed'});
                                    }
                                });                               
                            }
                        });
        
                    }
                    else
                    {
                        existingCreativeSubCategory.creativeCategory = creativeSubCategory.creativeCategory;
                        return existingCreativeSubCategory.save((err, savedCreativeSubCategory) =>
                        {
                            if(!category.subCategories || category.subCategories === null || category.subCategories.length < 1)
                            {
                                category.subCategories.push(savedCreativeSubCategory._id);
                            }
                            else
                            {
                                let y = category.subCategories.find(cs => cs === savedCreativeSubCategory._id);
                                if(!y || y === null)
                                {
                                    category.subCategories.push(savedCreativeSubCategory._id);
                                }
                            }
                            
                            return category.save((err, sv) =>
                            {
                                if (err)
                                {
                                    return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                }
                                else
                                {
                                    return res.json({code: 5, creativeSubCategoryId: savedCreativeSubCategory._id, message: 'Request was successfully executed'});
                                }
                            });  
                        });
                    }
                });
            }
        });
    }

}

function editCreativeSubCategory(req, res)
{
    let creativeSubCategory = req.body;
    if(creativeSubCategory === undefined || creativeSubCategory === null || creativeSubCategory.name.length < 1 || creativeSubCategory.creativeCategory.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all required fields and try again'});
    }
    else
    {
        CreativeCategory.findOne({_id: creativeSubCategory.creativeCategory}).exec((err, category) =>
        {
            if (!category || category === null)
            {
               return res.json({code: -1, message: 'An error was encountered. Please try again'});    
            }
            else
            {
                CreativeSubCategory.findOne({_id: creativeSubCategory._id}, (err, existingCreativeSubCategory) =>
                {
                    if (!existingCreativeSubCategory)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        existingCreativeSubCategory.name = creativeSubCategory.name;
                        existingCreativeSubCategory.creativeCategory = creativeSubCategory.creativeCategory;
                        return existingCreativeSubCategory.save((err, savedCreativeSubCategory) =>
                        {
                            if(!category.subCategories || category.subCategories === null || category.subCategories.length < 1)
                            {
                                category.subCategories.push(savedCreativeSubCategory._id);
                            }
                            else
                            {
                                let y = category.subCategories.find(cs => cs === savedCreativeSubCategory._id);
                                if(!y || y === null)
                                {
                                    category.subCategories.push(savedCreativeSubCategory._id);
                                }
                            }
                            
                            return category.save((err, sv) =>
                            {
                                if (err)
                                {
                                    return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                }
                                else
                                {
                                    return res.json({code: 5, creativeSubCategoryId: savedCreativeSubCategory._id, message: 'Request was successfully executed'});
                                }
                            });  
                        });
                    }
                });
            }
        });        
    }

}

function deleteCreativeSubCategory(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
    else
    {
        CreativeSubCategory.remove({_id: id}).exec(err =>
        {
            if(err)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                return res.json({code: 5, creativeSubCategoryId: id, message: 'Request was successfully executed'});
            }
        });
    }
}

function getCreativeSubCategory(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'Invalid selection!'});
    }
    else
    {
        CreativeSubCategory.findOne({_id: id}).populate('CreativeCategory').exec((err, creativeSubCategory) =>
        {
            if (!creativeSubCategory)
            {
                return res.json({code: -1, message: 'Creative SubCategory was not found'});
            }
            else
            {
                return res.json({code: 5, creativeSubCategory: creativeSubCategory});
            }
        });
    }
}

function getCreativeSubCategories(req, res)
{
    var find = (req.query.searchText && req.query.searchText.length > 0)? { name: { "$regex": req.query.searchText, "$options": "i" } } : {};

    CreativeSubCategory.count(find).exec((err, num) =>
    {
        if(num === undefined || num < 1)
        {
            return res.json({totalItems: 0, items: []});
        }
        else
        {
            CreativeSubCategory.find(find).populate({path: 'creativeCategory', populate: {path: 'creativeSection', select: 'name'}}).sort({name: req.query.sortOrder}).skip((req.query.page - 1) * req.query.itemsPerPage).limit(parseInt(req.query.itemsPerPage)).exec((err, results) => {

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

function getCreativeSubCategoriesByCategory(req, res)
{
    let category = req.query.ctr;
    CreativeSubCategory.find({creativeCategory: category}).populate({path: 'creativeCategory'}).exec((err, results) => {

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

const getAllCreativeSubCategories = (req, res) =>
{
    CreativeSubCategory.find({}).populate({path: 'creativeCategory', populate: {path: 'creativeSection'}}).sort({name: 'asc'}).exec((error, creativeSubCategories) =>
    {
        return res.json(creativeSubCategories);
    });
};

module.exports = init;