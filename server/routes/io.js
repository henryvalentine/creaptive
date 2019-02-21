import socketIo from "socket.io";
import logger from "../logger";

let io = null;
let Service = '';
let Order = '';
let Chat = '';
let User = '';
let OrderPayment = '';
let ServicePackage = '';
let OrderRef = '';
let ToggledOrder = '';

const init = (app, mongoose, server) =>
{
    io = socketIo(server);
    Service = mongoose.model('Service');
    User = mongoose.model('User');
    Order = mongoose.model('Order');
    Chat = mongoose.model('Chat');
    OrderPayment = mongoose.model('OrderPayment');
    ServicePackage = mongoose.model('ServicePackage');
    OrderRef = mongoose.model('OrderRef');
    ToggledOrder = mongoose.model('ToggledOrder');

    app.post('/gtMs', getMessages);

    io.on('connection', connect);
    io.on('disconnect', disconnect);
};

function connect (socket)
{
    socket.on('room', function(room)
    {
        socket.join(room);
    });
    socket.on('msg', sendChat);
    socket.on('msgRead', msgRead);   
    socket.on('checkPeer', (peerAuth) =>
    {
        Object.values(io.sockets.sockets).forEach(function(s)
        {
            if(s.id !== socket.id && s.auth === peerAuth)
            {
                io.to(socket.id).emit('online', {peer: s.id, auth: s.auth});
            }
        });
    });
    socket.on('offline', () =>
    {        
        socket.auth = '';
        socket.broadcast.emit('offline', {peer: socket.id, auth: ''});       
    });
    socket.on('disconnect', () =>
    {        
        socket.auth = '';
        socket.broadcast.emit('offline', {peer: socket.id, auth: ''});       
    });
    socket.on('online', (peerAuth) =>
    {
        let isValid = (peerAuth !== undefined && peerAuth !== null && peerAuth.length > 0);
        if (isValid)
        {
            User.findOne({_id: peerAuth}).exec((err, user) =>
            {
                if (err || !user)
                {
                    socket.auth = '';
                    io.to(socket.id).emit('AuthError', 'User authentication failed. Please try again later');
                }
                else
                {
                    socket.auth = peerAuth;
                    socket.broadcast.emit('online', {peer: socket.id, auth: peerAuth});                   
                }
            });
        }
        
        let sockets = Object.values(io.sockets.sockets);
        if(sockets !== undefined && sockets.length > 0)
        {
            let peers = [];
            sockets.forEach(function(s)
            {
                if(s.id !== socket.id)
                {
                    peers.push({peer: s.id, auth: (s.auth !== undefined && s.auth !== null && s.auth.length > 0)? s.auth : ''});
                }
            });
            io.to(socket.id).emit('peers', peers);
        }

    });
}

function sendChat (msg)
{
    let chat = new Chat(msg);
    return chat.save((err, sChat) =>
    {
        if (err)
        {
            io.to(msg.senderSid).emit('msgError', msg);
        }
        else
        {
            if(msg.receiverSid && msg.receiverSid.length > 0)
            {
                msg._id = sChat._id;
                io.to(msg.senderSid).emit('idUpdate', msg);
                io.to(msg.receiverSid).emit('receive', msg);                
            }
        }
    });
}

function msgRead (msg)
{
    let updated = [];
    msg.reads.forEach(m =>
    {
        Chat.findByIdAndUpdate(m, { read: true, received: new Date()},  function (err, s)
        {
            if (!err)
            {
                updated.push(m);
                if(updated.length === msg.reads.length)
                {
                    io.to(msg.receiverSid).emit('msgRead', msg);
                }
            }
        });
    })
}

function getMessages (req, res)
{
    try{
        Chat.find({room: req.body.room})
            .sort({sent: 'asc'}).skip((req.body.page - 1) * req.body.itemsPerPage).limit(req.body.itemsPerPage)
            .then((chats) =>
            {
                return res.json(chats);
            });
    }
    catch(e)
    {
        console.log('\nERROR\n');
        console.log(e);
        return res.json([]);
    }
}

function disconnect (socket)
{
    socket.auth = '';
    socket.broadcast.emit('offline', {peer: socket.id, auth: ''}); 
}

module.exports = init;