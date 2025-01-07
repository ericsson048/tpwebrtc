import { User } from "@clerk/nextjs/server";
import Peer from 'simple-peer'


// Type représentant un utilisateur connecté via Socket.IO
export type SocketUser = {
  userId: string;
  socketId: string;
  profile: User;
};

// Type générique pour un appel en cours
export type OnGoingCall = {
  participants: Participants;
  isRinging: boolean;
};

// Type pour les participants d'un appel individuel
export type Participants = {
  caller: SocketUser;
  receiver: SocketUser;
};

// Nouveau type pour les participants d'un appel de groupe
export type GroupParticipants = {
  caller: SocketUser;
  group: SocketUser[]; // Liste des utilisateurs participants à l'appel
};

// Type générique pour un appel en cours (individuel ou de groupe)
export type OnGoingCallWithGroup = {
  participants: Participants | GroupParticipants;
  isRinging: boolean;
};

export type PeerData ={
  peerConnection: Peer.Instance,
  stream: MediaStream | undefined,
  participantUser: SocketUser 

}
