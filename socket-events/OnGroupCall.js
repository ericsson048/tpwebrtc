import { io } from "../server.js";

// Fonction pour gérer l'appel de groupe
const OnGroupCall = async ({ caller, participants, onLineUsers }) => {
  if (!participants || participants.length === 0) return;

  // Assurez-vous que la liste des utilisateurs en ligne est disponible
  if (!onLineUsers || onLineUsers.length === 0) {
    console.log("Aucun utilisateur en ligne pour recevoir l'appel de groupe");
    return;
  }

  // Envoyer l'appel de groupe aux utilisateurs en ligne
  participants.forEach((participant) => {
    const receiver = onLineUsers.find((user) => user.userId === participant.userId);
    if (receiver?.socketId) {
      io.to(receiver.socketId).emit("inComingGroupCall", {
        caller,
        participants,
      });
    }
  });

  console.log(`Appel de groupe initié par ${caller.userId} vers les participants:`, participants);
};

export default OnGroupCall;
