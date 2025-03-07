import React from 'react'
import { useEffect } from 'react'
import {MdKeyboardArrowDown} from 'react-icons/md'
import {TooltipComponent} from '@syncfusion/ej2-react-popups'
import {useCookies } from 'react-cookie'
import {useStateContext} from '../contexts/ContextProvider' 
import avatar from '../data/avatar.png';


import {UserProfile} from './UserProfile' 

const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
  <TooltipComponent content={title} position='BottomCenter'>
    <button
      type="button"
      onClick={()=>customFunc()}  
      style= {{color}}
      className="relative text-xl rounded-full p-3 hover:bg-light-gray"
    >
      <span
      style={{backgroundColor:dotColor}}
      className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2"
      
      />
      {icon}


    </button>

  </TooltipComponent>

)

const NavBar = () => {
  const { currentColor, activeMenu, setActiveMenu, handleClick, isClicked, setScreenSize, screenSize } = useStateContext();

  useEffect(()=>{
    const handleResize = () => setScreenSize(window.innerWidth)
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  },[])

  useEffect(()=>{
    if(screenSize <= 900) setActiveMenu(false)
    else {
      setActiveMenu(true)
    }
  },[screenSize])

  const handleActiveMenu = () => setActiveMenu(!activeMenu);
  const [cookies, setCookie] = useCookies() ;


  return (
    <div className={`flex justify-end p-6 md:ml-6 md:mr-6 relative`}>
      <div className='flex'>
        <TooltipComponent content='Profile' position='BottomCenter'>
          <div
          className="flex items-center gap-2 cursor-pointer p-1 hover:bg-light-gray rounded-lg"
          onClick={()=>handleClick('userProfile')}
          >
            <img
            className='rounded-full h-8 w-8'
            src={avatar}
            alt='user-Profile'
            
            />
          <p>
            <span className='text-gray-400 text-14'>LOG OUT</span>{' '}
            <span className="text-gray-400 font-bold ml-1 text-14">
                {cookies['name']}
              </span>

          </p>
          <MdKeyboardArrowDown className='text-2xl text-gray-400'/>

          </div>
        </TooltipComponent>
        {isClicked.userProfile && <UserProfile />}
      </div>



    </div>
  )

    
}
export default NavBar;