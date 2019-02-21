/**
 * Created by Jack V on 9/22/2017.
 */

let PackageFeature = '';
const init = (app, mongoose) =>
{
    PackageFeature = mongoose.model('PackageFeature');
    app.post('/addFeature', addPackageFeature);
    app.post('/editFeature', editPackageFeature);
    app.post('/deletePackageFeature', deletePackageFeature);
    app.post('/getPackageFeature', getPackageFeature);
    app.get('/getAllPackageFeatures', getAllPackageFeatures);
    app.get('/getPackageFeatureList', getPackageFeatureList);
};

function addPackageFeature(req, res)
{
    let packageFeature = req.body;
    if(packageFeature === undefined || packageFeature === null || packageFeature.title.length < 1 || packageFeature.featureType.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all fields and try again'});
    }
    else
    {
        PackageFeature.findOne({title: packageFeature.title }, (err, existingPackageFeature) =>
        {
            if (!existingPackageFeature)
            {
                const newPackageFeature = new PackageFeature(packageFeature);
                return newPackageFeature.save((err, savedPackageFeature) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, packageFeatureId: savedPackageFeature._id, message: 'Package Feature was successfully added'});
                    }
                });

            }
            else {
                return res.json({code: 5, packageFeatureId: savedPackageFeature._id, message: 'Request was successfully executed'});
            }
        });
    }

}
function editPackageFeature(req, res)
{
    let sPackageFeature = req.body;
    if(sPackageFeature === undefined || sPackageFeature === null || sPackageFeature.title.length < 1 || sPackageFeature.featureType.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all required fields and try again'});
    }
    else
    {
        PackageFeature.findOne({_id: sPackageFeature._id}, (err, existingPackageFeature) =>
        {
            if (!existingPackageFeature)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            if (existingPackageFeature === null)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                existingPackageFeature.title = sPackageFeature.title;
                existingPackageFeature.featureType = sPackageFeature.featureType;
                existingPackageFeature.featureOptions = sPackageFeature.featureOptions;

                return existingPackageFeature.save((err, savedPackageFeature) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, sPackageFeatureId: savedPackageFeature.id, message: 'Request was successfully executed'});
                    }
                });
            }
        });
    }

}

function deletePackageFeature(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
    else
    {
        PackageFeature.remove({_id: id}).exec(err =>
        {
            if(err)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                return res.json({code: 5, sPackageFeatureId: id, message: 'Request was successfully executed'});
            }
        });
    }
}

function getPackageFeature(req, res)
{
    let id = req.query.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'Invalid selection!'});
    }
    else
    {
        PackageFeature.findOne({_id: id}).exec((err, sPackageFeature) =>
        {
            if (!sPackageFeature)
            {
                return res.json({code: -1, message: 'Package Feature was not found'});
            }
            else
            {
                return res.json({code: 5, sPackageFeature: sPackageFeature});
            }
        });
    }
}

function getPackageFeatureList(req, res)
{
    let find = (req.query.searchText && req.query.searchText.length > 0)? { title: { "$regex": req.query.searchText, "$options": "i" } } : {};

    PackageFeature.count(find).exec((err, num) =>
    {
        if(num === undefined || num < 1)
        {
            return res.json({totalItems: 0, items: []});
        }
        else
        {
            PackageFeature.find(find).sort({name: req.query.sortOrder}).skip((req.query.page - 1) * req.query.itemsPerPage).limit(parseInt(req.query.itemsPerPage)).exec((err, results) => {

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

const getAllPackageFeatures = (req, res) =>
{
    PackageFeature.find({}).exec((error, sPackageFeatures) =>
    {
        return res.json(sPackageFeatures);
    });
};

module.exports = init;
