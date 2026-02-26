const { Server } = require('socket.io');

// Track online users: userId -> socketId
const onlineUsers = new Map();

/**
 * Initialize Socket.io server for real-time communication
 * Handles: chat, typing indicators, online status, notifications
 */
const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // User comes online
        socket.on('user_online', (userId) => {
            onlineUsers.set(userId, socket.id);
            io.emit('online_users', Array.from(onlineUsers.keys()));
        });

        // Join a chat room (for DM or group)
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
        });

        // Leave a chat room
        socket.on('leave_room', (roomId) => {
            socket.leave(roomId);
        });

        // Send message in real-time
        socket.on('send_message', (data) => {
            const { roomId, message } = data;
            socket.to(roomId).emit('receive_message', message);
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const { roomId, userId, userName } = data;
            socket.to(roomId).emit('user_typing', { userId, userName });
        });

        // Stop typing indicator
        socket.on('stop_typing', (data) => {
            const { roomId, userId } = data;
            socket.to(roomId).emit('user_stop_typing', { userId });
        });

        // Join notification room
        socket.on('join_notifications', (userId) => {
            socket.join(`notifications_${userId}`);
        });

        // Send notification to specific user
        socket.on('send_notification', (data) => {
            const { recipientId, notification } = data;
            io.to(`notifications_${recipientId}`).emit('new_notification', notification);
        });

        // Join group room
        socket.on('join_group', (groupId) => {
            socket.join(`group_${groupId}`);
        });

        // Group message
        socket.on('group_message', (data) => {
            const { groupId, message } = data;
            socket.to(`group_${groupId}`).emit('receive_group_message', message);
        });

        // Disconnect
        socket.on('disconnect', () => {
            // Remove from online users
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
            io.emit('online_users', Array.from(onlineUsers.keys()));
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

module.exports = { initSocket, onlineUsers };
