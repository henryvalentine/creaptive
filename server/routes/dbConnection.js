/**
 * Created by Jack V on 8/23/2017.
 */
import mongoose from 'mongoose';
mongoose.Promise = Promise;
var db = mongoose.connection.openUri('mongodb://localhost:27017/creaptive', { config: { autoIndex: false }});

exports.establishConnection = () =>
{
    db.on('error', (e)=> {console.log('+++Connection to Mongoose failed')});
    db.once('open', () =>
    {
        return db;
        console.log( '+++Connected to mongoose')
    });
};

exports.db = db;