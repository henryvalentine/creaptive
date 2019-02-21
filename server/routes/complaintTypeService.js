/**
 * Created by Jack V on 8/21/2017.
 */

let ComplaintType = '';
const init = (app, mongoose) =>
{
    ComplaintType = mongoose.model('ComplaintType');
    app.post('/addCType', addCType);
    app.post('/editCType', editCType);
    app.post('/getCType', getCType);
    app.get('/getCTypes', getCTypes);
    app.get('/getCTypesByTarget', getCTypesByTarget);
    app.get('/getAllCTypes', getAllCTypes);
};

let feedback = {code: -1, message: 'Process failed. Please try again later', itemId : '', successCount: 0, failedModels: []};

function addCType(req, res)
{
    let cType = req.body;
    if(cType === undefined || cType.name.length < 1 || cType.complaintTypeFor === undefined || cType.complaintTypeFor === null || cType.complaintTypeFor < 1)
    {
        return res.json({code: -1, message: 'Please provide all fields and try again'});
    }
    else
    {
       let find = { $and: [{complaintTypeFor: cType.complaintTypeFor}, {name: { "$regex": cType.name, "$options": "i" }}]};
        ComplaintType.findOne(find, (err, cT) =>
        {
            if (!cT)
            {
                const newCType = new ComplaintType(cType);
                return newCType.save((err, savedCType) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, Id: savedCType.id, message: 'Request was successfully completed'});
                    }
                });

            }
            else {
                return res.json({code: 5, Id: cT._id, message: 'Request was successfully executed'});
            }
        });
    }

}

function editCType(req, res)
{
    let cType = req.body;
    if(cType === undefined || cType.name.length < 1  || cType.complaintTypeFor === undefined || cType.complaintTypeFor === null || cType.complaintTypeFor < 1)
    {
        return res.json({code: -1, message: 'Please provide all fields and try again'});
    }
    else
    {
        ComplaintType.findOne({_id: cType._id}, (err, cT) =>
        {
            if (!cT)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                cT.name = cType.name;
                cT.complaintTypeFor = cType.complaintTypeFor;

                return cT.save((err, savedCType) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, Id: savedCType._id, message: 'Request was successfully executed'});
                    }
                });
            }
        });
    }

}

function getCType(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'Invalid selection!'});
    }
    else
    {
        ComplaintType.findOne({_id: id}).exec((err, cT) =>
        {
            if (!cT)
            {
                return res.json({code: -1, message: 'Complaint Type was not found'});
            }
            else
            {
                return res.json({code: 5, cType: cT});
            }
        });
    }
}

function getCTypes(req, res)
{
    let find = (req.query.searchText && req.query.searchText.length > 0)? { [req.query.sortField]: { "$regex": req.query.searchText, "$options": "i" } } : {};

    ComplaintType.count(find).exec((err, num) =>
    {
        if(num === undefined || num < 1)
        {
            return res.json({totalItems: 0, items: []});
        }
        else
        {
            ComplaintType.find(find).sort({[req.query.sortField]: req.query.sortOrder}).skip((req.query.page - 1) * req.query.itemsPerPage).limit(parseInt(req.query.itemsPerPage)).exec((err, results) => {

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

const getCTypesByTarget = (req, res) =>
{
    let find = {$or: [{complaintTypeFor: req.query.target}, {complaintTypeFor: 3}]};
    ComplaintType.find(find).exec((error, complaintTypes) =>
    {
        return res.json(complaintTypes);
    });
};

const getAllCTypes = (req, res) =>
{
    
    ComplaintType.find({}).exec((error, complaintTypes) =>
    {
        return res.json(complaintTypes);
    });
};

export default init;