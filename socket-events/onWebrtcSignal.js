import { io } from "../server.js";

const OnWebrtcSignal = async(data)=>{
    if(data.isCaller){
        if(data.onGoingCall.participants.receiver.socketId){
            io.to(data.onGoingCall.participants.receiver.socketId).emit('webrtcSignal',data)
        }

    }else{
        if(data.onGoingCall.participants.caller.socketId){
            io.to(data.onGoingCall.participants.caller.socketId).emit('webrtcSignal',data)
        }
    }
}

export default OnWebrtcSignal