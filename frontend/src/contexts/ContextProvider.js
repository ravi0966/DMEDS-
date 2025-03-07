import React from 'react'
import { createContext,useContext,useState } from 'react'

const StateContext = createContext()

const initialState = {
  chat:false,
  cart:false,
  userProfile:false,
  notification:false,

};

export const ContextProvider = ({children}) => {
  const [currentColor,setCurrentColor] = useState('#A6E3E9')
  const [cureentMode,setCurrentMode] = useState('light')
  const [themeSettings,setThemeSettings] = useState(false)
  const [activeMenu,setActiveMenu] = useState(true)
  const [isClicked,setIsClicked] = useState(initialState)
  const [screenSize,setScreenSize] = useState(undefined)

  const setMode=(e)=>{
    setCurrentMode(e.target.value)
    localStorage.setItem('themeMode',e.target.value);
  }

  const setColor=(color)=>{
    setCurrentColor(color)
    localStorage.setItem('colorMode',color);
  }

  const handleClick=(clicked)=> setIsClicked({...initialState,[clicked]:true})

  return (
    <StateContext.Provider value={{currentColor,cureentMode,themeSettings,activeMenu,isClicked,screenSize,setMode,setColor,handleClick,setThemeSettings,setActiveMenu,setScreenSize,setCurrentColor,setIsClicked,initialState}}>
      {children}
    </StateContext.Provider>
  )
  
}

export const  useStateContext = () => useContext(StateContext)
