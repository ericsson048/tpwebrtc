import { io } from "../server.js";

const OnHangUp = async (data) => {
  let socketIdToEmitTo;

  if(data.onGoingCall.participants.caller.userId === data.userHangigUpId){
    socketIdToEmitTo = data.onGoingCall.participants.reciever.socketId;
  }else{
    socketIdToEmitTo = data.onGoingCall.participants.caller.socketId;
  }
  if(socketIdToEmitTo){
    io.to(socketIdToEmitTo).emit('hangUp');
  }
};



export default OnHangUp;