/**
 * Created by Jack V on 9/22/2017.
 */

let PricePackage = '';
let MetadataOption = '';
let ServiceMetadata = '';
let Option = '';
const init = (app, mongoose) =>
{
    PricePackage = mongoose.model('PricePackage');
    Option = mongoose.model('Option');
    MetadataOption = mongoose.model('MetadataOption');
    ServiceMetadata = mongoose.model('ServiceMetadata');

    app.post('/addPricePackage', addPricePackage);
    app.post('/editPricePackage', editPricePackage);
    app.post('/deletePricePackage', deletePricePackage);
    app.post('/getPricePackage', getPricePackage);
    app.get('/removePackageFeature', removePackageFeature);
    app.get('/getAllPricePackages', getAllPricePackages);
    app.get('/getPricePackageList', getPricePackageList);
};
 
function addPricePackage(req, res)
{
    let pricePackage = req.body;
    if(pricePackage === undefined || pricePackage === null || pricePackage.packageFeatures.length < 1  || pricePackage.creativeSubCategory.length < 1 || pricePackage.section.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all fields and try again'});
    }
    else
    {
        let finder = { $and: [{creativeSubCategory: pricePackage.creativeSubCategory}, {section: pricePackage.section}]};
        PricePackage.findOne(finder, (err, existingPricePackage) =>
        {
            if (!existingPricePackage)
            {
                pricePackage.dateProfiled = new Date();
                const newPricePackage = new PricePackage(pricePackage);
                return newPricePackage.save((err, savedPricePackage) =>
                {
                    if (err)
                    {
                        console.log(err);
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, pricePackageId: savedPricePackage._id, message: 'Price Package was successfully added'});
                    }
                });
            }
            else {
                return res.json({code: 5, pricePackageId: existingPricePackage._id, message: 'Request was successfully executed'});
            }
        });
    }

}

function editPricePackage(req, res)
{
    let pricePackage = req.body;
    if(pricePackage === undefined || pricePackage === null || pricePackage.packageFeatures.length < 1  || pricePackage.creativeSubCategory.length < 1 || pricePackage.section.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all required fields and try again'});
    }
    else
    {
        PricePackage.findOne({_id: pricePackage._id}, (err, existingPricePackage) =>
        {
            if (!existingPricePackage)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            if (existingPricePackage === null)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                existingPricePackage.packageFeatures = pricePackage.packageFeatures;
                existingPricePackage.creativeSubCategory = pricePackage.creativeSubCategory;

                return existingPricePackage.save((err, savedPricePackage) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, pricePackageId: savedPricePackage.id, message: 'Request was successfully executed'});
                    }
                });
            }
        });
    }

}

function deletePricePackage(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
    else
    {
        PricePackage.remove({_id: id}).exec(err =>
        {
            if(err)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                return res.json({code: 5, pricePackageId: id, message: 'Request was successfully executed'});
            }
        });
    }
}

function removePackageFeature(req, res)
{
    let packageId = req.query.packageId;

    if(packageId === undefined || packageId === null || packageId.length < 1)
    {
        return res.json([]);
    }
    else
    {
        PricePackage.find({_id: packageId}).exec((err, pricePackage) =>
        {
            if (!pricePackage)
            {
                return res.json([]);
            }
            else
            {
                return res.json(pricePackage);
            }
        });
    }
}

function getPricePackage(req, res)
{
    let id = req.query.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'Invalid selection!'});
    }
    else
    {
        PricePackage.findOne({_id: id}).populate('Option').populate({path: 'creativeSubCategory', populate: {path: 'creativeCategory', populate: {path: 'creativeSection'}}}).exec((err, pricePackage) =>
        {
            if (!pricePackage)
            {
                return res.json({code: -1, message: 'Price Package was not found'});
            }
            else
            {
                if(pricePackage.hasOptions === true)
                {
                    MetadataOption.find({pricePackage: pricePackage._id}).populate('Option').exec((err, options) =>
                    {
                        if (!options)
                        {
                            return res.json({code: -1, message: 'Price Package was not found'});
                        }
                        else
                        {
                            pricePackage.options = options;
                            return res.json({code: 5, pricePackage: pricePackage});
                        }
                    });
                }
                else
                {
                    return res.json({code: 5, pricePackage: pricePackage});
                }

            }
        });
    }
}

function getPricePackageList(req, res)
{
    let find = (req.query.searchText && req.query.searchText.length > 0)? { name: { "$regex": req.query.searchText, "$options": "i" } } : {};

    PricePackage.count(find).exec((err, num) =>
    {
        if(num === undefined || num < 1)
        {
            return res.json({totalItems: 0, items: []});
        }
        else
        {
            //packageType packageFeatures section
            PricePackage.find(find).populate({path: 'section'}).populate({path: 'packageFeatures'}).populate({path: 'creativeSubCategory'}).sort({name: req.query.sortOrder}).skip((req.query.page - 1) * req.query.itemsPerPage).limit(parseInt(req.query.itemsPerPage)).exec((err, results) => {

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

const getAllPricePackages = (req, res) =>
{
    let subcategory = req.query.subcategory;
    if(subcategory === undefined || subcategory === null || subcategory.length < 1)
    {
        return res.json({code: -1, message: 'An unknown error was encountered', pricePackages: []});
    }
    PricePackage.find({creativeSubCategory: subcategory}).populate('packageFeatures').exec((error, pricePackages) =>
    {
        return res.json({code: 5, message: '', pricePackages: pricePackages});
    });
};

module.exports = init;
