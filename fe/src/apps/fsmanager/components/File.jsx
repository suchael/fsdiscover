import React from 'react'
import { BiFile } from 'react-icons/bi'

const File = ({ data }) => {
    const maxL = window.innerWidth < 468 ? 10 : 30
    const prn=data?.name.substring(0, maxL-5)
  return (
      <a className='text-light' style={{maxWidth:'100%'}} href={location.pathname+'/'+data?.name}>
          <BiFile /> <span className="text-truncate">{data?.name.length > maxL ?
              prn + '...'+data.name.substring(data?.name.length-8, data?.name.length)
              : data?.name}</span>
      </a>
  )
}

export default File