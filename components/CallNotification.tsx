"use client";
import { useSocket } from "@/context/socketContext";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import React from "react";
import { Button } from "./ui/button";
import { MdCall, MdCallEnd } from "react-icons/md";

function CallNotification() {
  const { onGoingCall, onGoingCallWithGroup,handleJoinCall,handleHangUp,isCallEnded } = useSocket();
  console.log("is ongoing call >>", onGoingCall);
  console.log("is ongoing group call >>", onGoingCallWithGroup);

  // Vérification de l'appel en cours (individuel ou de groupe)
  const isIndividualCall = onGoingCall?.isRinging;
  const isGroupCall = onGoingCallWithGroup?.isRinging;

  // Si aucun appel n'est en cours, rien n'affiche
  if (!isIndividualCall && !isGroupCall) return null;

  // Récupération de l'appelant (Caller) en fonction du type d'appel
  let caller;
  if (isIndividualCall) {
    caller = onGoingCall?.participants?.caller;
  } else if (isGroupCall) {
    caller = onGoingCallWithGroup?.participants?.caller;
  }

  if (!caller) return null; // Si l'appelant n'est pas défini, rien n'affiche
  if(isCallEnded){
    return <div className='mt-5 text-red-600 text-center'>Call ended</div>
}

  return (
    <div className="absolute bg-slate-500 bg-opacity-70 w-screen h-screen top-0 bottom-0 left-0 right-0 flex items-center justify-center">
      <div className="bg-white flex flex-col gap-3 p-4 rounded-lg shadow-lg text-center text-xl justify-center items-center">
       {caller &&(
        <div className="flex flex-col gap-2 justify-center items-center">
          <Avatar>
        <AvatarImage src={caller.profile?.imageUrl} className="w-11 h-11 rounded-full" />
        <AvatarFallback>{caller.profile?.firstName}</AvatarFallback>
      </Avatar>
      <div className="text-sm">{caller.profile?.username?.split(" ")[0]}</div>
        </div>
       )

       }
        {/* Affichage de la notification d'appel en fonction du type d'appel */}
        <div>
          <p>{isGroupCall ? "A group call is incoming" : "Someone is calling"}</p>
          <div className="flex gap-2 justify-center items-center">
          <Button
          variant={"secondary"}
          className="hover:bg-slate-950/10"
            onClick={() => onGoingCall && handleJoinCall(onGoingCall)}
          >
            <MdCall size={24}/>
          </Button>
          <Button
          variant={"destructive"}
          onClick={()=>handleHangUp({onGoingCall:onGoingCall? onGoingCall : undefined, isEmitHangUp:true})}
          >
           <MdCallEnd size={24}/>
          </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CallNotification;
