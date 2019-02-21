/**
 * Created by Jack V on 9/22/2017.
 */

let CreativeCategory = '';
const init = (app, mongoose) =>
{
    CreativeCategory = mongoose.model('CreativeCategory');
    app.post('/addCreativeCategory', addCreativeCategory);
    app.post('/editCreativeCategory', editCreativeCategory);
    app.post('/deleteCreativeCategory', deleteCreativeCategory);
    app.post('/getCreativeCategory', getCreativeCategory);
    app.get('/getAllCreativeCategories', getAllCreativeCategories);
    app.get('/getCreativeCategories', getCreativeCategories);
    app.get('/getCatrBySection', getCreativeCategoriesBySection);
    app.get('/getCreativeCategoriesBySection', getCreativeCategoriesBySection);
    app.get('/getCategoriesBySection', getCategoriesBySection);
};

function addCreativeCategory(req, res)
{
    let creativeCategory = req.body;
    if(creativeCategory === undefined || creativeCategory === null || creativeCategory.name.length < 1 || creativeCategory.creativeSection.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all fields and try again'});
    }
    else
    {
        CreativeCategory.findOne({name: creativeCategory.name}, (err, existingCreativeCategory) =>
        {
            if (!existingCreativeCategory)
            {
                const newCreativeCategory = new CreativeCategory(creativeCategory);
                return newCreativeCategory.save((err, savedCreativeCategory) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, creativeCategoryId: savedCreativeCategory.id, message: 'Creative Category was successfully added'});
                    }
                });

            }
            else {
                return res.json({code: 5, creativeCategoryId: existingCreativeCategory.id, message: 'Request was successfully executed'});
            }
        });
    }

}

function editCreativeCategory(req, res)
{
    let creativeCategory = req.body;
    if(creativeCategory === undefined || creativeCategory === null || creativeCategory.name.length < 1 || creativeCategory.creativeSection.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all required fields and try again'});
    }
    else
    {
        CreativeCategory.findOne({_id: creativeCategory._id}, (err, existingCreativeCategory) =>
        {
            if (!existingCreativeCategory)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                existingCreativeCategory.name = creativeCategory.name;
                existingCreativeCategory.iconType = creativeCategory.iconType;
                existingCreativeCategory.creativeSection = creativeCategory.creativeSection;
                return existingCreativeCategory.save((err, savedCreativeCategory) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, creativeCategoryId: savedCreativeCategory.id, message: 'Request was successfully executed'});
                    }
                });
            }
        });
    }

}

function deleteCreativeCategory(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
    else
    {
        CreativeCategory.remove({_id: id}).exec(err =>
        {
            if(err)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                return res.json({code: 5, creativeCategoryId: id, message: 'Request was successfully executed'});
            }
        });
    }
}

function getCreativeCategory(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'Invalid selection!'});
    }
    else
    {
        CreativeCategory.findOne({_id: id}).populate('CreativeSection').exec((err, creativeCategory) =>
        {
            if (!creativeCategory)
            {
                return res.json({code: -1, message: 'Creative Category was not found'});
            }
            else
            {
                return res.json({code: 5, creativeCategory: creativeCategory});
            }
        });
    }
}

function getCreativeCategories(req, res)
{
    let find = (req.query.searchText && req.query.searchText.length > 0)? { [req.query.sortField]: { "$regex": req.query.searchText, "$options": "i" } } : {};

    CreativeCategory.count(find).exec((err, num) =>
    {
        if(num === undefined || num < 1)
        {
            return res.json({totalItems: 0, items: []});
        }
        else
        {
            CreativeCategory.find(find).populate('creativeSection').sort({[req.query.sortField]: req.query.sortOrder}).skip((req.query.page - 1) * req.query.itemsPerPage).limit(parseInt(req.query.itemsPerPage)).exec((err, results) => {

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

const getAllCreativeCategories = (req, res) =>
{
    CreativeCategory.find({}).populate('CreativeSection').sort({name: 'asc'}).exec((error, creativeCategories) =>
    {
        return res.json(creativeCategories);
    });
};

const getCreativeCategoriesBySection = (req, res) =>
{
    let section = req.query.section;
    CreativeCategory.find({creativeSection: section}).populate('subCategories').populate('CreativeSection').sort({name: 'asc'}).exec((error, creativeCategories) =>
    {
        return res.json(creativeCategories);
    });
};

const getCategoriesBySection = (req, res) =>
{
    let section = req.query.section;
    CreativeCategory.find({creativeSection: section}).populate('subCategories').populate('CreativeSection').sort({name: 'asc'}).exec((error, creativeCategories) =>
    {
        return res.json(creativeCategories);
    });
};

module.exports = init;