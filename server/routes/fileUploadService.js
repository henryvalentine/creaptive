import path from 'path'; import fs from 'fs'; import multer from 'multer'; import async from 'async';
import  uuidBase62 from  'uuid-base62';
let feedback = {code: -1, message: 'Process failed. Please try again later', itemId : '', successCount: 0, failedItems: [], filePath: ''};

let storage = multer.diskStorage({
    destination:
        function (req, file, cb)
        {
            let directory = path.join(__filedir, req.query.uploadPath);
            req.fileDirectory = directory;

            fs.stat(directory, function(err, stats)
            {
                if (err)
                {
                    fs.mkdir(directory, (er) =>
                    {
                        if(!er)
                        {
                            cb(null, directory)
                        }
                        else{

                            cb(null, null)
                        }
                    });

                } else
                {
                    cb(null, directory)
                }
            });
        },
    filename: function (req, file, cb)
    {
        let fileName = uuidBase62.v4() +  path.extname(file.originalname);
        file.relativePath = '/flt/' + req.query.uploadPath + '/' + fileName;
        file.fullName = file.originalname;
        let directory = path.join(__filedir, req.query.uploadPath);
        file.absolutePath = path.join( directory, fileName);
        cb(null, fileName);
    }
});

let uploader = multer({ storage: storage,
    fileFilter: function(req, file, callback)
    {
        let directory = path.join(__filedir, req.query.uploadPath);
        let fileAbsolutePath = path.join( directory, file.originalname);
        let exists = fs.existsSync(fileAbsolutePath);
        if(exists)
        {
            fs.unlinkSync(fileAbsolutePath);
        }
        callback(null, true);
    } }).single('file');

function uploadPhoto(req, res)
{
    try
    {
        uploader(req, res, (err)=>
        {
            if(err)
            {
                feedback.message = err;
                return res.send(feedback);
            }

            let absolutePath = req.file.absolutePath;
            let fileName = req.file.relativePath;
            if(req.file === undefined || req.file === null || req.file.fullName.length < 1 || absolutePath.length < 1 || fileName.length < 1)
            {
                feedback.message = 'File information could not be processed';
                return res.json(feedback);
            }

            if(!req.query.section || req.query.section.length < 1 || !req.query.itemId || req.query.itemId.lenght < 1 || !req.query.prop || req.query.prop.lenght < 1)
            {
                feedback.message = err;
                fs.unlinkSync(absolutePath);
                return res.send(feedback);
            }
            else
            {
                let oldPath = '';
                let model = req.query.section === 'service'? Service : Craft;
                model.findOne({_id: req.query.itemId}, (err, existingModel) =>
                {
                    if (!existingModel)
                    {
                        fs.unlinkSync(absolutePath);
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        oldPath = existingModel[req.query.prop];
                        existingModel[req.query.prop] = fileName;

                        existingModel.save((err, savedModel) =>
                        {
                            if (err)
                            {
                                fs.unlinkSync(absolutePath);
                                return res.json({code: -1, message: 'An error was encountered. Please try again'});
                            }
                            else
                            {
                                if(oldPath !== undefined && oldPath !== null && oldPath.length > 0)
                                {
                                    let resolvedPath = '';

                                    if(oldPath.indexOf('\\') > -1)
                                    {
                                        resolvedPath = oldPath;
                                    }
                                    else
                                     {
                                         resolvedPath = path.join(__filedir, oldPath.replace('/flt', '').replace('/', '\\'));
                                    }

                                    fs.stat(resolvedPath, function(err, stats)
                                    {
                                        if (!err || err === null || err === undefined)
                                        {
                                            fs.unlinkSync(resolvedPath);
                                            return res.json({code: 5, itemId: savedModel._id, filePath: fileName,  message: 'Request was successfully executed'});
                                        }
                                        else
                                         {
                                            return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                        }
                                    });
                                }
                                else{
                                    return res.json({code: 5, itemId: savedModel._id, filePath: fileName,  message: 'Request was successfully executed'});
                                }
                            }
                        });

                    }
                });
            }
        });
    }
    catch (e)
    {
        return res.json({code: -1, message: 'An internal server error was encountered. Please try again later'});
    }

}

function uploadPic(req, res)
{
    try
    {
        uploader(req, res, (err)=>
        {
            if(err)
            {
                console.log('\n');
                console.log(err);
                return res.send({code: -1, message: 'Request could not be executed. Please try again later'});
            }

            if(req.file === undefined || req.file === null || req.file.fullName.length < 1)
            {
                feedback.message = 'Photo information could not be processed';
                return res.json({code: -1, message: 'Image could not be processed. Please try again later'});
            }

            let oldPath = '';
            let absolutePath = req.file.absolutePath;

            if(!req.query.geek || req.query.geek.lenght < 1)
            {
                fs.unlinkSync(absolutePath);
                return res.send({code: -1, message: 'An unexpected error was encountered. Please try again'});
            }
            else
            {                
                let fileName = req.file.relativePath;

                if(absolutePath.length < 1 || fileName.length < 1)
                {
                    feedback.message = 'Photo information could not be processed';
                    return res.json({code: -1, message: 'Image could not be processed. Please try again later'});
                }
                else{
                    User.findOne({_id: req.query.geek}, (err, user) =>
                    {
                        if (!user)
                        {
                            fs.unlinkSync(absolutePath);
                            return res.json({code: -1, message: 'An error was encountered. Please try again'});
                        }
                        else
                        {
                            oldPath = user.profileImagePath;
                            user.profileImagePath = fileName;

                            user.save((err, savedModel) =>
                            {
                                if (err)
                                {
                                    fs.unlinkSync(absolutePath);
                                    return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                }
                                else
                                {
                                    if(oldPath !== undefined && oldPath !== null && oldPath.length > 0)
                                    {
                                        let resolvedPath = '';

                                        if(oldPath.indexOf('\\') > -1)
                                        {
                                            resolvedPath = oldPath;
                                        }
                                        else
                                        {
                                            resolvedPath = path.join(__filedir, oldPath.replace('/flt', '').replace('/', '\\'));
                                        }

                                        fs.stat(resolvedPath, function(err, stats)
                                        {
                                            if (!err || err === null || err === undefined)
                                            {
                                                fs.unlinkSync(resolvedPath);
                                                return res.json({code: 5, filePath: fileName,  message: 'Request was successfully executed'});
                                            }
                                            else
                                            {
                                                return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                            }
                                        });
                                    }
                                    else{
                                        return res.json({code: 5, filePath: fileName,  message: 'Request was successfully executed'});
                                    }
                                }
                            });
                        }
                    });
                }

            }
        });
    }
    catch (e)
    {
        return res.json({code: -1, message: 'An internal server error was encountered. Please try again later'});
    }

}

function uploadPdf(req, res)
{
    try
    {
        uploader(req, res, (err)=>
        {
            if(err)
            {
                return res.json({code: -1, message: 'File information could not be processed'});
            }

            else
             {
                let absolutePath = req.file.absolutePath;
                let fileName = req.file.relativePath;
                if(req.file === undefined || req.file === null || req.file.fullName.length < 1 || absolutePath.length < 1 || fileName.length < 1)
                {
                    return res.json({code: -1, message: 'File information could not be processed'});
                }

                if(!req.query.section || req.query.section.length < 1 || !req.query.itemId || req.query.itemId.lenght < 1)
                {
                    fs.unlinkSync(absolutePath);
                    return res.send({code: -1, message: 'An error was encountered. Please try again'});
                }
                else
                {
                    let oldPath = '';
                    let model = req.query.section === 'service'? Service : Craft;
                    model.findOne({_id: req.query.itemId}, (err, existingModel) =>
                    {
                        if (!existingModel)
                        {
                            fs.unlinkSync(absolutePath);
                            return res.json({code: -1, message: 'An error was encountered. Please try again'});
                        }
                        else
                        {
                            if(existingModel.pdfResource || existingModel.pdfResource !== undefined || existingModel.pdfResource !== null || existingModel.pdfResource.path.length > 0)
                            {
                                oldPath = existingModel.pdfResource.path;
                            }

                            existingModel.pdfResource = {name: req.file.fullName.replace('.pdf', '').replace('.Pdf', '').replace('.PDF', ''), path: fileName} ;

                            existingModel.save((err, savedModel) =>
                            {
                                if (err)
                                {
                                    fs.unlinkSync(absolutePath);
                                    return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                }
                                else
                                {
                                    if(oldPath !== undefined && oldPath !== null && oldPath.length > 0)
                                    {
                                        let resolvedPath = '';

                                        if(oldPath.indexOf('\\') > -1)
                                        {
                                            resolvedPath = oldPath;
                                        }
                                        else
                                        {
                                            resolvedPath = path.join(__filedir, oldPath.replace('/flt', '').replace('/', '\\'));
                                        }

                                        fs.stat(resolvedPath, function(err, stats)
                                        {
                                            if (!err || err === null || err === undefined)
                                            {
                                                fs.unlinkSync(resolvedPath);
                                                return res.json({code: 5, itemId: savedModel._id, filePath: fileName,  message: 'Your Request was successfully executed'});
                                            }
                                            else
                                            {
                                                return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                            }
                                        });
                                    }
                                    else{
                                        return res.json({code: 5, itemId: savedModel._id, filePath: fileName,  message: 'Your Request was successfully executed'});
                                    }
                                }
                            });

                        }
                    });
                }
            }
        });
    }
    catch (e)
    {
        return res.json({code: -1, message: 'An internal server error was encountered. Please try again later'});
    }

}

let Service = '';
let Craft = '';
let User = '';
const init = (app, mongoose) =>
{
    Service = mongoose.model('Service');
    Craft = mongoose.model('Craft');
    User = mongoose.model('User');
    app.post('/uploadPhoto', uploadPhoto);
    app.post('/uploadPdf', uploadPdf);
    app.post('/uploadPic', uploadPic);
};

module.exports = init;