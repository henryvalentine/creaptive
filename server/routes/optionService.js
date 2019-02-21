/**
 * Created by Jack V on 9/22/2017.
 */

let Option = '';
const init = (app, mongoose) =>
{
    Option = mongoose.model('Option');
    app.post('/addOption', addOption);
    app.post('/editOption', editOption);
    app.post('/deleteOption', deleteOption);
    app.post('/getOption', getOption);
    app.get('/getAllOptions', getAllOptions);
    app.get('/getOptions', getOptions);
};

function addOption(req, res)
{
    let option = req.body;
    if(option === undefined || option === null || option.name.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all fields and try again'});
    }
    else
    {
        Option.findOne({name: option.name}, (err, existingOption) =>
        {
            if (!existingOption)
            {
                const newOption = new Option(option);
                return newOption.save((err, savedOption) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        Option.find({}).sort({name: 'asc'}).exec((error, options) =>
                        {
                            if (error)
                            {
                                return res.json({code: -1, message: 'An error was encountered. Please try again'});
                            }
                            else
                            {
                                return res.json({code: 5, optionId: savedOption.id, options: options, message: 'Option was successfully added'});
                            }
                        });
                    }
                });

            }
            else
            {
                Option.find({}).sort({name: 'asc'}).exec((error, options) =>
                {
                    if (error)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, optionId: existingOption.id, options: options, message: 'Request was successfully executed'});
                    }
                });
            }
        });
    }
}

function editOption(req, res)
{
    let option = req.body;
    if(option === undefined || option === null || option.name.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all required fields and try again'});
    }
    else
    {
        Option.findOne({_id: option._id}, (err, existingOption) =>
        {
            if (!existingOption)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                existingOption.name = option.name;
                return existingOption.save((err, savedOption) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        Option.find({}).sort({name: 'asc'}).exec((error, options) =>
                        {
                            if (error)
                            {
                                return res.json({code: -1, message: 'An error was encountered. Please try again'});
                            }
                            else
                            {
                                return res.json({code: 5, optionId: savedOption.id, options: options, message: 'Request was successfully executed'});
                            }
                        });
                    }
                });
            }
        });
    }

}

function deleteOption(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
    else
    {
        Option.remove({_id: id}).exec(err =>
        {
            if(err)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                return res.json({code: 5, optionId: id, message: 'Request was successfully executed'});
            }
        });
    }
}

function getOption(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'Invalid selection!'});
    }
    else
    {
        Option.findOne({_id: id}).exec((err, option) =>
        {
            if (!option)
            {
                return res.json({code: -1, message: 'Option was not found'});
            }
            else
            {
                return res.json({code: 5, option: option});
            }
        });
    }
}

function getOptions(req, res)
{
    var find = (req.query.searchText && req.query.searchText.length > 0)? { [req.query.sortField]: { "$regex": req.query.searchText, "$options": "i" } } : {};

    Option.count(find).exec((err, num) =>
    {
        if(num === undefined || num < 1)
        {
            return res.json({totalItems: 0, items: []});
        }
        else
        {
            Option.find(find).sort({[req.query.sortField]: req.query.sortOrder}).skip((req.query.page - 1) * req.query.itemsPerPage).limit(parseInt(req.query.itemsPerPage)).exec((err, results) => {

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

const getAllOptions = (req, res) =>
{
    Option.find({}).sort({name: 'asc'}).exec((error, options) =>
    {
        return res.json(options);
    });
};

module.exports = init;