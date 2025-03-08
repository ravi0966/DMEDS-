import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import logo from '../data/digicure.svg';
import { links } from '../data/dummy2';
import { useStateContext } from '../contexts/ContextProvider';

const Sidebar2 = () => {
  const { currentColor, activeMenu, setActiveMenu, screenSize } = useStateContext();

  const handleCloseSideBar = () => {
    if (activeMenu !== undefined && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const activeLink = 'flex items-center gap-4 pl-5 pt-3 pb-3 rounded-lg text-white bg-pink-500 text-md shadow-lg transition-all duration-300 m-2';
  const normalLink = 'flex items-center gap-4 pl-5 pt-3 pb-3 rounded-lg text-md text-gray-700 hover:bg-pink-100 dark:hover:text-black transition-all duration-300 m-2';

  return (
    <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10 bg-pink-50 rounded-lg shadow-md">
      {activeMenu && (
        <>
          {/* Sidebar Header - Removed Close Button */}
          <div className="flex justify-center items-center px-4 py-4 border-b border-pink-200">
            <Link
              to="/"
              onClick={handleCloseSideBar}
              className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-pink-900"
            >
              <img className="w-8" src={logo} alt="logo" />
              <span>DMEDS+</span>
            </Link>
          </div>

          {/* Sidebar Navigation */}
          <div className="mt-5 px-4">
            {links.map((item) => (
              <div key={item.title}>
                <p className="text-pink-700 font-semibold uppercase text-sm mb-2">{item.title}</p>
                {item.links.map((link) => (
                  <NavLink
                    to={`/${link.name.replace(/ /g, '')}`}
                    key={link.name}
                    onClick={handleCloseSideBar}
                    style={({ isActive }) => ({
                      backgroundColor: isActive ? '#f472b6' : '',
                    })}
                    className={({ isActive }) => (isActive ? activeLink : normalLink)}
                  >
                    {link.icon}
                    <span className="capitalize">{link.name}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar2;
