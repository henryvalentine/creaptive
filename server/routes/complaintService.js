/**
 * Created by Jack V on 9/22/2017.
 */

let Complaint = '';
const init = (app, mongoose) =>
{
    Complaint = mongoose.model('Complaint');
    app.post('/complain', addComplaint);
    app.post('/editComplaint', editComplaint);
    app.post('/getComplaint', getComplaint);
    app.get('/getComplaintByOrder', getComplaintByOrder);
    app.get('/getAllComplaints', getAllComplaints);
    app.get('/getComplaints', getComplaints);
};
    
function addComplaint(req, res)
{
    let complaint = req.body;
    if(complaint === undefined || complaint.caption.length < 1 || complaint.note.length < 1 || complaint.complaintType.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all fields and try again'});
    }
    else
    {
        const newComplaint = new Complaint(complaint);
        return newComplaint.save((error, savedComplaint) =>
        {
            console.log(error);
            if (error)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                return res.json({code: 5, complaintId: savedComplaint._id, message: 'Thanks for this feedback. We will review it and take appropriate action(s)'});
            }
        });
    }
}

function editComplaint(req, res)
{
    let complaint = req.body;
    if(complaint === undefined || complaint.caption.length < 1 || complaint.note.length < 1 || complaint.complaintType.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all fields and try again'});
    }
    else
    {
        Complaint.findOne({_id: complaint._id}, (err, existingComplaint) =>
        {
            if (!existingComplaint)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                existingComplaint.caption = complaint.caption;
                existingComplaint.note = complaint.note;
                existingComplaint.complaintType = complaint.complaintType;
                existingComplaint.status = complaint.status;
                existingComplaint.dateResolved = complaint.dateResolved;
                existingComplaint.complainerFeedback = complaint.complainerFeedback;
                  
                return existingComplaint.save((err, savedComplaint) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, ComplaintId: savedComplaint._id, message: 'Request was successfully executed'});
                    }
                });
            }
        });
    }

}

function getComplaint(req, res)
{
    let id = req.query.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'Invalid selection!'});
    }
    else
    {        
        Complaint.findOne({_id: id}).populate('ComplaintType')        
        .exec((err, complaint) =>
        {
            if (!complaint)
            {
                return res.json({code: -1, message: 'Complaint was not found'});
            }
            else
            {
                return res.json({code: 5, complaint: complaint});
            }
        });
    }

}

function getComplaintByOrder(req, res)
{
    let order = req.query.order;
    let complainer = req.query.complainer;
    if(order === undefined || order === null || order.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again later'});
    }
    else
    {       
        let find = {$and: [{order: order}, {addedBy: complainer}]}
        Complaint.findOne(find).populate('complaintType')        
        .exec((err, complaint) =>
        {
            if (err || !complaint)
            {
                return res.json({code: -1, message: 'Complaint was not found'});
            }
            else
            {
                return res.json({code: 5, complaint: complaint});
            }
        });
    }

}

function getComplaints(req, res)
{
    var find = (req.query.searchText && req.query.searchText.length > 0)? { name: { "$regex": req.query.searchText, "$options": "i" } } : {};
    Complaint.find(find).populate('ComplaintType').sort({name: req.query.sortOrder}).skip((req.query.page - 1) * req.query.itemsPerPage).limit(parseInt(req.query.itemsPerPage)).exec((err, results) => {

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

const getAllComplaints = (req, res) =>
{
    Complaint.find({}).populate('ComplaintType').sort({name: 'asc'}).exec((error, complaints) =>
    {
        return res.json(complaints);
    });
};

export default init;