'use client'
import { Video } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import { useUser } from "@clerk/nextjs";
import { UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation';

function NavBar() {
    const route = useRouter()
    const {user} = useUser()
    
  return (
    <div className='flex justify-between items-center px-8 py-4 border-b-2'>
        <div className='flex gap-2'> <Video className='w-8 h-8'/><h1 className='font-bold text-2xl'>Video Conference</h1></div>
        <div className='flex gap-3'>
            {!user ? (
                <>
                    <Button variant="outline" onClick={()=> route.push("/sign-in")}>Sign in</Button>
                    <Button onClick={()=> route.push("/sign-up")}>Sign up</Button>
                </>
            ) : (
                <UserButton/>
            )}
        </div>
    </div>
  )
}

export default NavBar