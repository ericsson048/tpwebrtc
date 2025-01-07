import {
    OnGoingCall,
    Participants,
    SocketUser,
    OnGoingCallWithGroup,
    PeerData
  } from "@/types";
  import { useUser } from "@clerk/nextjs";
  import { createContext, useCallback, useContext, useEffect, useState } from "react";
  import { io, Socket } from "socket.io-client";
  import Peer, { SignalData } from 'simple-peer'
  
  interface iSocketContext {
    onLineUsers: SocketUser[] | null;
    onGoingCall: OnGoingCall | null;
    onGoingCallWithGroup:OnGoingCallWithGroup | null;
    localStream: MediaStream | null,
    handleCall: (user: SocketUser) => void;
    handleGroupCall: (groupParticipants: SocketUser[]) => void;
    handleJoinCall:(onGoingCall:OnGoingCall)=> void;
    peer:PeerData | null;
    handleHangUp:(data:{onGoingCall?:OnGoingCall, isEmitHangUp?:boolean})=> void;
    isCallEnded:boolean
  }
  
  export const socketContext = createContext<iSocketContext | null>(null);
  
  export const SocketContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [sokect, setSokect] = useState<Socket | null>(null);
    const [isConnectSoket, setIsConnectSoket] = useState<boolean>(false);
    const [onLineUsers, setOnLineUsers] = useState<SocketUser[] | null>(null);
    const [onGoingCall, setOnGoingCall] = useState<OnGoingCall | null>(null);
    const [onGoingCallWithGroup, setOnGoingCallWithGroup] = useState<OnGoingCallWithGroup | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [peer, setPeer] = useState<PeerData | null>(null)
    const { user } = useUser();
    const [isCallEnded,setIsCallEnded] = useState(false)
  
    const currentSocketUser = onLineUsers?.find(
      (onLineUser) => onLineUser.userId === user?.id
    );
  
    const getMediaStream = useCallback(async(faceMode?:string)=>{
        if(localStream){
            return localStream
        }
        try {
            // get devices
            const devices = await navigator.mediaDevices.enumerateDevices()
            // get Video devices
            const videoDevices = devices.filter(device => device.kind === "videoinput");
            if (videoDevices.length === 0) {
              console.error("Aucun périphérique vidéo détecté.");
              return null;
            }
            
            const stream  =  await navigator.mediaDevices.getUserMedia({
                audio:true,
                video:{
                    width:{min:640,ideal:1280,max:1920},
                    height:{min:360,ideal:720,max:1080},
                    frameRate:{min:16,ideal:30,max:30},
                    facingMode:videoDevices.length > 0 ? faceMode : undefined
                }
            })
            setLocalStream(stream)
            return stream
        } catch (error : any) {
            console.error("Erreur lors de la capture du flux média :", error.name, error.message);
            if (error.name === "NotAllowedError") {
                // user has denied the access to the media device
                console.error("Camera access denied by user.");
            } else if (error.name === "NotReadableError"){
                console.error("Could not access the video source. Is the camera in use or blocked?");
            } else {
                // Other type of error.
                console.error("Unknown error when accessing the video stream.", error);
            }
            setLocalStream(null)
            return null
            
        }
    },[localStream])
    // Gestion d'un appel direct
    const handleCall = useCallback(
      async(user: SocketUser) => {
        setIsCallEnded(false)
        if (!currentSocketUser || !sokect) return;

        const stream = await getMediaStream()

        if(!stream){
            console.log("no stream in handlecall");
            return;
        }

        const participants = { caller: currentSocketUser, receiver: user };
        setOnGoingCall({
          participants,
          isRinging: false,
        });
        sokect.emit("call", participants);
      },
      [sokect, currentSocketUser]
    );
  
    // Gestion d'un appel de groupe
    const handleGroupCall = useCallback(
        async(groupParticipants: SocketUser[]) => {
          setIsCallEnded(false)
          if (!currentSocketUser || !sokect) return;

          const stream = await getMediaStream()

        if(!stream){
            console.log("no stream in handlecall");
            return;
        }
      
          setOnGoingCallWithGroup({
            participants: { caller: currentSocketUser, group: groupParticipants },
            isRinging: false,
          });
      
          sokect.emit("groupCall", {
            caller: currentSocketUser,
            participants: groupParticipants,
            onLineUsers: onLineUsers
          });
        },
        [sokect, currentSocketUser]
      );
      
  
    const OnInComingCall = useCallback(
      (participants: Participants) => {
        setOnGoingCall({
          participants,
          isRinging: true,
        });
      },
      []
    );
  
    const OnInComingGroupCall = useCallback(
      ({
        caller,
        participants,
      }: {
        caller: SocketUser;
        participants: SocketUser[];
      }) => {
        setOnGoingCallWithGroup({
          participants: { caller, group: participants },
          isRinging: true,
        });
      },
      []
    );
    const handleHangUp=useCallback((data:{onGoingCall?:OnGoingCall |null, isEmitHangUp?:boolean})=>{
      if(sokect && user && data?.onGoingCall && data?.isEmitHangUp){
        sokect.emit("hangUp", {onGoingCall:data.onGoingCall,uesrHangingUpId:user.id});
      }

      setOnGoingCall(null)
      setPeer(null)
      if(localStream){
        localStream.getTracks().forEach(track => track.stop())
        setLocalStream(null)
      }
      setIsCallEnded(true)
    },[sokect,user,localStream])

    // create a peer
    const createPeer = useCallback((stream:MediaStream, initiator:boolean)=>{
      const iceServers:RTCIceServer[] =[
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun3.l.google.com:19302",
          ]
        }
      ]

      const peer = new Peer({
        initiator,
        stream,
        config: {iceServers},
        trickle:true,
      })
      peer.on('stream',(stream)=>{
        setPeer((prevPeer)=>{
          if(prevPeer){
            return{...prevPeer,stream}
          }
          return prevPeer
        })
        
      })
      peer.on('error',console.error)
      peer.on("close",()=>handleHangUp({}))

      const rtcPeerConnection:RTCPeerConnection =(peer as any)._pc

      rtcPeerConnection.oniceconnectionstatechange = async () =>{
        if(rtcPeerConnection.iceConnectionState=== "disconnected" || rtcPeerConnection.iceConnectionState === "failed"){
          handleHangUp({})
        }
      }

      return peer
    },[onGoingCall, setPeer])

    

    const completePeerConnection= useCallback(async( connctionData:{sdp:SignalData,onGoingCall: OnGoingCall,isCaller:boolean})=>{
      console.log("completePeerConnection est appellee");
      
      if(!localStream){
        console.log("misssing the localstream");
        return;
      }
      console.log(" w've the localstream");
      if (peer) {
        console.log("Peer already exists, signaling directly.");
        peer.peerConnection?.signal(connctionData.sdp);
        return;
      }
      
      console.log(" w've the peer",peer);

      const newPeer = createPeer(localStream, true)

      setPeer({
        peerConnection:newPeer,
        participantUser: connctionData.onGoingCall.participants.receiver,
        stream:undefined
      })

      newPeer.on('signal',async (data:SignalData)=>{
        if(sokect){
          //emit offer
          sokect.emit('webrtcSignal',{
            sdp:data,
            onGoingCall,
            isCaller:true
          })
        }
      })

    },[localStream,createPeer,peer,onGoingCall])


  const handleJoinCall = useCallback( async(onGoingCall: OnGoingCall) => {
    setIsCallEnded(false)

      // Logique pour rejoindre un appel en cours
      setOnGoingCall(prevState => {
        if (prevState) {
          return { ...prevState, isRinging: false };
        }
        return prevState;
      });

      const stream = await getMediaStream()
      if(!stream){ 
            console.log("no stream in handleJoincall");
            handleHangUp({onGoingCall:onGoingCall? onGoingCall : undefined, isEmitHangUp:true})
            return;
        }
        const newPeer = createPeer(stream, true)

        setPeer({
          peerConnection:newPeer,
          participantUser:onGoingCall.participants.caller,
          stream:undefined
        })

        newPeer.on('signal',async (data:SignalData)=>{
          if(sokect){
            // emit offer
            sokect.emit('webrtcSignal',{
              sdp:data,
              onGoingCall,
              isCaller:false
            })
          }
        })
  }, [sokect, currentSocketUser])




    // Initialisation socket
    useEffect(() => {
      const newSocket = io();
      setSokect(newSocket);
  
      return () => {
        newSocket.disconnect();
      };
    }, []);
  
    useEffect(() => {
      if (!sokect) return;
  
      function onConnect() {
        setIsConnectSoket(true);
      }
  
      function onDisconnect() {
        setIsConnectSoket(false);
      }
  
      sokect.on("connect", onConnect);
      sokect.on("disconnect", onDisconnect);
  
      return () => {
        sokect.off("connect", onConnect);
        sokect.off("disconnect", onDisconnect);
      };
    }, [sokect]);
  
    useEffect(() => {
      if (!sokect || !isConnectSoket) return;
  
      sokect.emit("addNewUser", user);
      sokect.on("getUsers", (res) => setOnLineUsers(res));
  
      return () => {
        sokect.off("getUsers", (res) => setOnLineUsers(res));
      };
    }, [sokect, isConnectSoket, user]);
  
    useEffect(() => {
      if (!sokect || !isConnectSoket) return;
  
      sokect.on("inComingCall", OnInComingCall);
      sokect.on("webrtcSignal",completePeerConnection)
      sokect.on("inComingGroupCall", OnInComingGroupCall);
      sokect.on("hangUp",handleHangUp)

  
      return () => {
        sokect.off("inComingCall", OnInComingCall);
        sokect.off("webrtcSignal",completePeerConnection)
        sokect.off("inComingGroupCall", OnInComingGroupCall);
        sokect.off("hangUp",handleHangUp)
      };
    }, [sokect, isConnectSoket, OnInComingCall, OnInComingGroupCall,completePeerConnection]);

    useEffect(() => {
      let timeout : ReturnType<typeof setTimeout>
      if(isCallEnded){
        timeout = setTimeout(() => {
          setIsCallEnded(false)
        }, 2000);
      }
      return () => clearTimeout(timeout);
    }, [isCallEnded]);

    return (
      <socketContext.Provider
        value={{ onLineUsers, onGoingCall,onGoingCallWithGroup, handleCall, handleGroupCall,localStream,handleJoinCall,peer,handleHangUp,isCallEnded }}
      >
        {children}
      </socketContext.Provider>
    );
  };
  
  export const useSocket = () => {
    const context = useContext(socketContext);
  
    if (context === null) {
      throw new Error(
        "Socket Context is not defined, useContext must be used within a socketContextProvider"
      );
    }
  
    return context;
  };
  