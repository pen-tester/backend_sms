var global_area = require('../config/global');    

module.exports=function(io){
    var nsp = io.of('/notification');
    global_area.notification_io =nsp;
    nsp.on('connection', function(socket) {
        //nsp.emit('hi', 'Hello everyone!');
        console.log('new app connected');
        socket.on('register', function(data){
            console.log(data);
            socket.join('channel'+data.id);
        })
    });
   /* io.on('connection', function(socket){
        console.log('new app connected');
    })*/
}