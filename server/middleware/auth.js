export const socketAuth = (socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) return next(new Error("Username required"));
  
  socket.data.username = username;
  next();
};