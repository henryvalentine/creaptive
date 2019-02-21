import path from 'path'; import fs from 'fs'; import multer from 'multer'; import fileService from './fileService';

let storage = multer.diskStorage({
    destination: function (req, file, cb)
    {
        cb(null, './lib/fileUploads/bulkUploads/')
    },
    filename: function (req, file, cb)
    {
        let fileName = Date.now() + path.extname(file.originalname);
        file.relativePath = '/lib/fileUploads/profiles/';
        file.fullName = fileName;
        cb(null, fileName);
    }
});

let uploader = multer({ storage: storage }).array('file', 10);

exports.uploadFiles = (req, res) =>
{
    uploader(req, res, (err)=>
    {
        if(err)
        {
            res.send('File processing encountered an error. Please try again later');
        }
        else
        {
            if(req.files.length == 1)
            {
                fileService.addFile(req.files[0], res);
            }
            if(req.files.length > 1)
            {
                fileService.addFiles(req.files, res);
            }
        }
    });
};

exports.saveFile = (req, res) =>
{
    uploader(req, res, (err)=>
    {
        if(err)
        {
            res.send('File processing encountered an error. Please try again later');
        }
        else
        {
            if(req.files.length == 1)
            {
                fileService.addFile(req.files[0], res);
            }
            if(req.files.length > 1)
            {
                fileService.addFiles(req.files, res);
            }
        }
    });
};