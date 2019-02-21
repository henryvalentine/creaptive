/**
 * Created by Jack V on 8/21/2017.
 */
import FileRecord from '../models/fileRecord';import async from 'async';
import moment from 'moment'; import fs from 'fs';import path from 'path';

let feedback = {code: -1, message: 'Process failed. Please try again later', itemId : '', successCount: 0, failedPaths: []};

exports.addFile = (fileInfo, res) =>
{
    try
    {
        if(fileInfo.fullName.length < 1)
        {
            feedback.message = 'File information could not be processed';
            return feedback;
        }

        var newFile = new FileRecord({
            name: fileInfo.fullName,
            absolutePath: path.join(__filedir, fileInfo.fullName),
            relativePath: fileInfo.relativePath + '/' + fileInfo.fullName,
            dateCreated: new Date(),
            lastModified: new Date(),
            size: fileInfo.size/1048576
        });

        newFile.save((err, file) =>
        {
            if (err)
            {
                fs.unlinkSync(file.absolutePath);
                feedback.code = -1;
                res.send(feedback);
            }
           else
            {
                feedback.message = 'File was successfully processed';
                feedback.code = 5;
                feedback.itemId = file._id;
                res.send(feedback);
            }
        });

    }
    catch (e)
    {
        res.send(feedback);
    }
};

exports.addFiles = (files, res) =>
{
    try
    {
        if(files.length < 1)
        {
            feedback.message = 'The Files information could not be processed. Please try again';
            res.send(feedback);
        }
        else
        {
            let processed = 0;
            async.each(files, (fileInfo, callback) =>
            {
                let newFile = new FileRecord({
                    name: fileInfo.fullName,
                    absolutePath: path.join(__filedir, fileInfo.fullName),
                    relativePath: fileInfo.relativePath + '/' + fileInfo.fullName,
                    dateCreated: new Date(),
                    lastModified: new Date(),
                    size: fileInfo.size/1048576
                });

                newFile.save((err, file) =>
                {
                    if (err)
                    {
                        console.log('Error 1: ');
                        console.log(err);
                        feedback.failedPaths.push(file.absolutePath);
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
                    feedback.failedPaths.forEach(path =>
                    {
                        fs.unlinkSync(path);
                    });
                    feedback.code = -1;
                    feedback.message = 'An error was encountered. Files processed : ' + feedback.successCount;
                    res.send(feedback);
                }
                else
                {
                    if(feedback.successCount <  files.length)
                    {
                        //delete file from directory
                        //send error feedback to user
                        feedback.failedPaths.forEach(path =>
                        {
                            fs.unlinkSync(path);
                        });
                        feedback.code = -1;
                        feedback.message = 'An error was encountered. Files processed : ' + feedback.successCount;
                        res.send(feedback);
                    }
                    else
                    {
                        feedback.code = 5;
                        feedback.message = 'The Files were successfully processed';
                        res.send(feedback);
                    }
                }
            });

        }
    }
    catch (e)
    {
        res.send(feedback);
    }
};

exports.getFiles = (req, res) =>
{
    try
    {
        FileRecord.find().limit(10).
        sort('-dateCreated').exec((error, files) =>
        {
            if(error)
            {
                res.send([]);
            }
            else
            {
                files.forEach((file) =>
                {
                    file.creationDate = moment(file.dateCreated).format('d/m/y');
                    file.modificationDate = moment(file.lastModified).format('d/m/y');
                });
                res.send(files);
            }
        });
    }
    catch (e)
    {
        res.send([]);
    }
};

exports.getFileByName = (req, res) =>
{
    try
    {
        FileRecord.findOne({name: req.fileName}).exec((error, file) =>
        {
            if(error)
            {
                res.send({});
            }
            else
            {
                file.creationDate = moment(file.dateCreated).format('DD/MM/YYYY');
                file.modificationDate = moment(file.lastModified).format('DD/MM/YYYY');
                res.send(file);
            }
        });
    }
    catch (e)
    {
        res.send({});
    }
};

exports.getFileById = (req, res) =>
{
    try
    {
        FileRecord.findOne({_id: req.query.id}).exec((error, file) =>
        {
            if(error)
            {
                res.send({});
            }
            else
            {
                file.creationDate = moment(file.dateCreated).format('DD/MM/YYYY');
                file.modificationDate = moment(file.lastModified).format('DD/MM/YYYY');
                res.send(file);
            }
        });
    }
    catch (e)
    {
        res.send({});
    }
};

exports.deleteById = (req, res) =>
{
    try
    {
        FileRecord.findOne({_id: req.query.id}).exec((error, file) =>
        {
            if(error)
            {
                res.send('File could not be deleted');
            }
            else
            {
                console.log(file);
                FileRecord.remove({_id: req.query.id}, error =>
                {
                    if(error)
                    {
                        res.send('File could not be deleted');
                    }
                    else
                    {
                        fs.unlinkSync(file.absolutePath);
                        res.send('File was successfully deleted');
                    }
                });
            }
        });
    }
    catch (e)
    {
        res.send('An error was encountered. File could not be deleted');
    }
};