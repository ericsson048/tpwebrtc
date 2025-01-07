"use client"
import { useSocket } from '@/context/socketContext'
import React, { useCallback, useEffect, useState } from 'react'
import VideoContainer from './VideoContainer'
import { Button } from './ui/button'
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from 'react-icons/md'

function VideoCall() {
    const {localStream,peer,onGoingCall,handleHangUp,isCallEnded}= useSocket()
    const [isMicOn, setIsMicOn] = useState<boolean>(true)
    const [isVidOn, setIsVidOn] = useState<boolean>(true)


    useEffect(()=>{
        if (localStream) {

            const videoTrack = localStream.getVideoTracks()[0];
            setIsVidOn(videoTrack.enabled)

            const audioTrack = localStream.getAudioTracks()[0];
            setIsMicOn(audioTrack.enabled)
        }
        

    },[localStream])

    const toggleCamera = useCallback(()=>{
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVidOn(videoTrack.enabled)
            }
        }
    },[localStream])

    const toggleMic = useCallback(()=>{
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled)
            }
        }
    },[localStream])
    // const isOnCall = localStream && peer && (onGoingCall || onGoingCallWithGroup) ? true : false;
    const isOnCall = localStream && peer && onGoingCall  ? true : false;
    console.log('peer stream >>',peer?.stream);
    console.log('peer  >>',peer);

    if(isCallEnded){
        return <div className='mt-5 text-red-600 text-center'>Call ended</div>
    }

    if(!localStream &&!peer) return;
    
    
  return (
    <div className=' flex flex-col justify-center items-center'>
        <div className='mt-4 relative max-w-[800px] mx-auto'>
        {localStream && <VideoContainer stream={localStream} isLocalStream={true} isOnCall={isOnCall}/>}
        {peer &&peer.stream && <VideoContainer stream={peer.stream} isLocalStream={false} isOnCall={isOnCall}/>}
        </div>
        <div className="mt-8 flex items-center gap-2 justify-center">
            <Button onClick={toggleMic}>
                {isMicOn && <MdMicOff size={28}/>}
                {!isMicOn && <MdMic size={28}/>}
            </Button>
            <Button onClick={()=>handleHangUp({onGoingCall:onGoingCall? onGoingCall : undefined, isEmitHangUp:true})} variant={"destructive"}>
                End Call
            </Button>
            <Button onClick={toggleCamera}>
                {isVidOn && <MdVideocamOff size={28}/>}
                {!isVidOn && <MdVideocam size={28}/>}
            </Button>
        </div>
    </div>
  )
}

export default VideoCall