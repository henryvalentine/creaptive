/**
 * Created by Jack V on 9/22/2017.
 */

let Keyword = '';
const init = (app, mongoose) =>
{
    Keyword = mongoose.model('Keyword');
    app.post('/processKeywords', processKeywords);
    app.post('/editKeyword', editKeyword);
    app.post('/deleteKeyword', deleteKeyword);
    app.post('/getKeyword', getKeyword);
    app.get('/getAllKeywords', getAllKeywords);
    app.get('/getKeywords', getKeywords);
};

function processKeywords(req, res)
{
    let keywords = req.body;
    if(keywords === undefined || keywords === null || keywords.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please refresh the page and try again'});
    }
    else
    {
        let processedKeywords = [];
        for(let i = 0; i < keywords.length; i++)
        {
            let keyword = keywords[i];
            Keyword.findOne({nameUpper: keyword.nameUpper, creativeSection: keyword.creativeSection}).exec((err, sKeyword) =>
            {
                if (sKeyword !== null)
                {
                    processedKeywords.push(sKeyword._id);
                }
                else
                {
                    new Keyword(keyword).save((err, savedKeyword) =>
                    {
                        if (savedKeyword !== null)
                        {
                            processedKeywords.push(savedKeyword._id);
                        }
                    });
                }
            });
        }

        Keyword.find({creativeSection: keywords[0].creativeSection}).exec((error, keywords) =>
        {
            return res.json({code: 5, keywords: keywords, serviceKeywords: processedKeywords, message: 'Request was successfully executed'});
        });

    }
}

function editKeyword(req, res)
{
    let keyword = req.body;
    if(keyword === undefined || keyword === null || keyword.name.length < 1)
    {
        return res.json({code: -1, message: 'Please provide all required fields and try again'});
    }
    else
    {
        Keyword.findOne({_id: keyword._id}, (err, existingKeyword) =>
        {
            if (!existingKeyword)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                existingKeyword.name = keyword.name;
                existingKeyword.nameUpper = keyword.name.toUpperCase().replace(' ', '');
                return existingKeyword.save((err, savedKeyword) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        Keyword.find({}).sort({name: 'asc'}).exec((error, keywords) =>
                        {
                            if (error)
                            {
                                return res.json({code: -1, message: 'An error was encountered. Please try again'});
                            }
                            else
                            {
                                return res.json({code: 5, keywordId: savedKeyword.id, keywords: keywords, message: 'Request was successfully executed'});
                            }
                        });
                    }
                });
            }
        });
    }

}

function deleteKeyword(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
    else
    {
        Keyword.remove({_id: id}).exec(err =>
        {
            if(err)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                return res.json({code: 5, keywordId: id, message: 'Request was successfully executed'});
            }
        });
    }
}

function getKeyword(req, res)
{
    let id = req.id;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'Invalid selection!'});
    }
    else
    {
        Keyword.findOne({_id: id}).exec((err, keyword) =>
        {
            if (!keyword)
            {
                return res.json({code: -1, message: 'Keyword was not found'});
            }
            else
            {
                return res.json({code: 5, keyword: keyword});
            }
        });
    }
}

function getKeywords(req, res)
{
    var find = (req.query.searchText && req.query.searchText.length > 0)? { [req.query.sortField]: { "$regex": req.query.searchText, "$keywords": "i" } } : {};

    Keyword.count(find).exec((err, num) =>
    {
        if(num === undefined || num < 1)
        {
            return res.json({totalItems: 0, items: []});
        }
        else
        {
            Keyword.find(find).sort({[req.query.sortField]: req.query.sortOrder}).skip((req.query.page - 1) * req.query.itemsPerPage).limit(parseInt(req.query.itemsPerPage)).exec((err, results) => {

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

const getAllKeywords = (req, res) =>
{
    let creativeSection = req.query.section;
    Keyword.find({creativeSection: creativeSection}).sort({name: 'asc'}).exec((error, keywords) =>
    {
        return res.json(keywords);
    });
};

module.exports = init;