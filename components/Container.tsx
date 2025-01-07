import React from 'react'

function Container({children}:{children:React.ReactNode}) {
  return (
    <div className='container px-6'>{children}</div>
  )
}

export default Container