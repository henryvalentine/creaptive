import path from 'path'; import fs from 'fs'; import multer from 'multer'; import async from 'async';
import  uuidBase62 from  'uuid-base62';
let feedback = {code: -1, message: 'Process failed. Please try again later', itemId : '', successCount: 0, failedItems: [], filePath: ''};

let storage = multer.diskStorage({
    destination:
        function (req, file, cb)
        {
            let dir = path.join(__resourcedir, req.query.uploadPath);
            fs.stat(dir, function(err, stats)
            {
                if (err)
                {
                    fs.mkdir(dir, (er) =>
                    {
                        if(!er)
                        {
                            cb(null, dir)
                        }
                        else
                        {
                            cb(null, null)
                        }
                    });

                } else
                {
                    cb(null, dir)
                }
            });
        },
    filename: function (req, file, cb)
    {
        let fileName = uuidBase62.v4() +  path.extname(file.originalname);
        file.relativePath = '/resources/' + req.query.uploadPath + '/' + fileName;
        file.fullName = file.originalname;
        let dir = path.join(__resourcedir, req.query.uploadPath);
        file.absolutePath = path.join( dir, fileName);
        cb(null, fileName);
    }
});

let uploader = multer({ storage: storage,
    fileFilter: function(req, file, callback)
    {
        let dir = path.join(__resourcedir, req.query.uploadPath);
        let fileAbsolutePath = path.join( dir, file.originalname);
        let exists = fs.existsSync(fileAbsolutePath);

        if(exists)
        {
            fs.unlinkSync(fileAbsolutePath);
        }
        callback(null, true);
    } }).single('file');

function uploadFile(req, res)
{
    try
    {
        uploader(req, res, (err)=>
        {
            if(err)
            {
                return res.send({code: -1, message: err});
            }

            let absolutePath = req.file.absolutePath;
            let fileName = req.file.relativePath;
            if(req.file === undefined || req.file === null || req.file.fullName.length < 1 || absolutePath.length < 1 || fileName.length < 1)
            {
                return res.json({code: -1, message: 'The uploaded file could not be parsed. Please select the file again'});
            }

            if(!req.query.itemId || req.query.itemId.lenght < 1 || !req.query.prop || req.query.prop.lenght < 1 || !req.query.model || req.query.model.length < 1)
            {
                fs.unlinkSync(absolutePath);
                return res.send({code: -1, message: 'An unknown error message was encountered. Please try again'});
            }
            else
            {
                let oldPath = '';
                let appModel = models.find(m => m.name.toLowerCase() === req.query.model.toLowerCase());
                if(!appModel || appModel === null)
                {
                    fs.unlinkSync(absolutePath);
                    return res.json({code: -1, message: 'An error was encountered. Please ensure the target model is specified in the URL and try again'});
                }
                else
                {
                    appModel.model.findOne({_id: req.query.itemId}, (err, existingModel) =>
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
                                            resolvedPath = path.join(__resourcedir, oldPath.replace('/resources', '').replace('/', '\\'));
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
                                    else
                                    {
                                        return res.json({code: 5, itemId: savedModel._id, filePath: fileName,  message: 'Request was successfully executed'});
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

let models = [];
const init = (app, mongoose) =>
{
    models = 
    [
        {name: 'category', model: mongoose.model('CreativeCategory')}, 
        {name: 'subcategory', model: mongoose.model('CreativeSubCategory')},
        {name: 'user', model: mongoose.model('User')},
        {name: 'service', model: mongoose.model('Service')},
        {name: 'craft', model: mongoose.model('Craft')}
    ];
    app.post('/uploadFile', uploadFile);
};

module.exports = init;