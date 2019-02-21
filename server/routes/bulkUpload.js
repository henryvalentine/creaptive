import path from 'path'; import fs from 'fs'; import multer from 'multer'; import fileService from './fileService';import async from 'async'; import XLSX from 'xlsx';
import Country from '../models/country';
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
                    });

                } else
                {
                    cb(null, directory)
                }
            });

        },
    filename: function (req, file, cb)
    {
        file.relativePath = '../flt/' + req.query.uploadPath + '/' + file.originalname;
        file.fullName = file.originalname;
        let directory = path.join(__filedir, req.query.uploadPath);
        file.absolutePath = path.join( directory, file.originalname);
        cb(null, file.fullName);
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
            console.log('file exists\n');
            fs.unlinkSync(fileAbsolutePath);
        }
        callback(null, true);
    } }).single('file');

exports.uploadCountryBulk = (req, res) =>
{
    try
    {
        uploader(req, res, (err)=>
        {
            if(err)
            {
                feedback.message = err;
                res.send(feedback);
            }
            else
            {
                let absolutePath = req.file.absolutePath;
                console.log(absolutePath);
                if(req.file.fullName.length < 1)
                {
                    feedback.message = 'File information could not be processed';
                    return feedback;
                }
                let workbook = XLSX.readFile(absolutePath);
                let ws = workbook.Sheets[req.query.sheetName];
                let data = XLSX.utils.sheet_to_json(ws);
                if(!data || data.length < 1)
                {
                    fs.unlinkSync(absolutePath);
                    feedback.message = 'File processing encountered an error. Please try again later';
                    res.send(feedback);
                }

                else{

                    async.each(data, (c, callback) =>
                    {
                        let country = new Country({
                            name: c.Country,
                            countryCode: c.CountryCode,
                            currency: c.Currency,
                            currencyCode: c.CurrencyCode
                        });

                        country.save((err, c) =>
                        {
                            if (err)
                            {
                                feedback.failedItems.push(c.name);
                                callback();
                            }
                            else
                            {
                                feedback.successCount += 1;
                                callback();
                            }
                        });

                    }, (err)=>
                    {
                        if( err )
                        {
                            feedback.code = -1;
                            feedback.message = 'An error was encountered. Items processed : ' + feedback.successCount;
                            res.send(feedback);
                        }
                        else
                        {
                            if(feedback.successCount <  data.length)
                            {
                                feedback.code = -1;
                                feedback.message = 'An error was encountered. Items processed : ' + feedback.successCount;
                                res.send(feedback);
                            }
                            else
                            {
                                feedback.code = 5;
                                feedback.message = 'Process was successfully completed. Items processed : ' + feedback.successCount;
                                res.send(feedback);
                            }
                        }
                    });
                }
            }
        });
    }
    catch (e)
    {
        console.log('\n\n');
        console.log(e);
        res.send(feedback);
    }

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
            if(req.files.length === 1)
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