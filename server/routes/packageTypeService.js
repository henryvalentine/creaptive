/**
 * Created by Jack V on 9/22/2017.
 */

let PackageType = '';
let CreativeSection = '';
const init = (app, mongoose) =>
{
    PackageType = mongoose.model('PackageType');
    CreativeSection = mongoose.model('CreativeSection');
    app.post('/addPackageType', addPackageType);
    app.post('/editPackageType', editPackageType);
    app.post('/deletePackageType', deletePackageType);
    app.post('/getPackageType', getPackageType);
    app.get('/getAllPackageTypes', getAllPackageTypes);
    app.get('/getPackageTypes', getPackageTypes);
    app.get('/getSectionsAndPackageTypes', getSectionsAndPackageTypes);
};

function addPackageType(req, res)
{
    let packageType = req.body;
    if(packageType === undefined || packageType === null || packageType.name.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all fields and try again'});
    }
    else
    {
        PackageType.findOne({name: packageType.name}, (err, existingPackageType) =>
        {
            if (!existingPackageType)
            {
                const newPackageType = new PackageType(packageType);
                return newPackageType.save((err, savedPackageType) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, packageTypeId: savedPackageType._id, message: 'Package Type was successfully added'});
                    }
                });
            }
            else
            {
                existingPackageType.creativeSubCategory = packageType.creativeSubCategory;
                return existingPackageType.save((err, savedExiStingPackageType) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, packageTypeId: savedExiStingPackageType._id, message: 'Package Type was successfully added'});
                    }
                });
            }
        });
    }
}

function editPackageType(req, res)
{
    let packageType = req.body;
    if(packageType === undefined || packageType === null || packageType.name.length < 1 || packageType.className.length < 1 || packageType._id.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all required inputs and try again'});
    }
    else
    {
        PackageType.findOne({_id: packageType._id}, (err, existingPackageType) =>
        {
            if (!existingPackageType)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                existingPackageType.name = packageType.name;
                existingPackageType.className = packageType.className;
                return existingPackageType.save((err, savedPackageType) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, packageTypeId: savedPackageType._id, message: 'Request was successfully executed'});
                    }
                });
            }
        });
    }
}

function deletePackageType(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
    else
    {
        PackageType.remove({_id: id}).exec(err =>
        {
            if(err)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                return res.json({code: 5, packageTypeId: id, message: 'Request was successfully executed'});
            }
        });
    }
}

function getPackageType(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'Invalid selection!'});
    }
    else
    {
        PackageType.findOne({_id: id}).populate({path: 'creativeSubCategory', populate: {path: 'creativeCategory'}}).exec((err, packageType) =>
        {
            if (!packageType)
            {
                return res.json({code: -1, message: 'Package Type was not found'});
            }
            else
            {
                return res.json({code: 5, packageType: packageType});
            }
        });
    }
}

function getPackageTypes(req, res)
{
    let find = (req.query.searchText && req.query.searchText.length > 0)? { name: { "$regex": req.query.searchText, "$options": "i" } } : {};

    PackageType.count(find).exec((err, num) =>
    {
        if(num === undefined || num < 1)
        {
            return res.json({totalItems: 0, items: []});
        }
        else
        {
            PackageType.find(find).sort({name: req.query.sortOrder}).skip((req.query.page - 1) * req.query.itemsPerPage).limit(parseInt(req.query.itemsPerPage)).exec((err, results) => {

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

const getAllPackageTypes = (req, res) =>
{
    PackageType.find({}).exec((error, packageTypes) =>
    {
        return res.json(packageTypes);
    });
};

const getSectionsAndPackageTypes = (req, res) =>
{
    PackageType.find({}).sort({name: 'asc'}).exec((error, packageTypes) =>
    {
        CreativeSection.find({}).exec((error, creativeSections) =>
        {
            return res.json({sections: creativeSections, packageTypes: packageTypes});
        });
    });
};


module.exports = init;