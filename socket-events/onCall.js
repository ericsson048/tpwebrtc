import { io } from "../server.js";

const OnCall = async (participants) => {
  try {
    // Vérifiez que le receiver a un socketId valide
    if (participants?.receiver?.socketId) {
      // Émettre l'événement "inComingCall" au socketId du récepteur
      io.to(participants.receiver.socketId).emit("inComingCall", participants);
    } 
  } catch (error) {
    console.error("Error while handling OnCall:", error);
  }
};

export default OnCall;
