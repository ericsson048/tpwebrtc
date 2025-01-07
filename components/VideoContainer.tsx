"use client"
import { cn } from '@/lib/utils'
import React, { useEffect, useRef } from 'react'

interface iVideoContainer{
    stream:MediaStream | null,
    isLocalStream:boolean,
    isOnCall:boolean
}

function VideoContainer({stream,isLocalStream,isOnCall}:iVideoContainer) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(()=>{
        if(videoRef.current && stream){
            videoRef.current.srcObject = stream
        }
    },[stream])
  return (
    <video className={cn('border rounded w-[800px]' ,isLocalStream && isOnCall &&" w-[200px] h-auto absolute border-primary border-2 ")} autoPlay playsInline muted={isLocalStream} ref={videoRef}/>
  )
}

export default VideoContainer