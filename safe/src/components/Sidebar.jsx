import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaHandsHelping } from 'react-icons/fa';  // Help Icon
import logo from '../data/digicure.svg';
import { links } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';

const Sidebar = () => {
  const { currentColor, activeMenu, screenSize } = useStateContext();

  const handleCloseSideBar = () => {
    if (activeMenu !== undefined && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  // Active and normal link styles
  const activeLink =
    'flex items-center gap-4 px-5 py-3 rounded-xl text-white text-md font-semibold bg-pink-500 shadow-lg transform scale-105 transition-all duration-300';
  const normalLink =
    'flex items-center gap-4 px-5 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-pink-200 dark:hover:bg-pink-700 hover:shadow-md transition-all duration-300';

  return (
    <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10 bg-gradient-to-b from-pink-100 to-pink-300 dark:from-pink-900 dark:to-pink-700 shadow-xl rounded-r-3xl">
      {activeMenu && (
        <>
          {/* Header (Logo Only) */}
          <div className="flex justify-center items-center px-6 py-6">
            <Link
              to="/"
              onClick={handleCloseSideBar}
              className="flex items-center gap-3 text-2xl font-extrabold text-gray-900 dark:text-white"
            >
              <img src={logo} alt="DMEDS+" className="w-12" />
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 text-transparent bg-clip-text">
                DMEDS+
              </span>
            </Link>
          </div>

          {/* Sidebar Navigation */}
          <div className="mt-6 px-4">
            {links.map((item) => (
              <div key={item.title}>
                <p className="text-gray-600 dark:text-gray-300 uppercase font-semibold px-4 py-2 mt-4">
                  {item.title}
                </p>
                {item.links.map((link) => (
                  link.name === 'MediPal' ? (
                    <a
                      key={link.name}
                      href="https://randombot1.streamlit.app/" // Replace with actual URL
                      target="_blank"
                      rel="noopener noreferrer"
                      className={normalLink + " flex items-center justify-center gap-4 px-6 py-4 rounded-xl text-white text-lg font-bold bg-pink-500 shadow-lg transform hover:scale-105 transition-all duration-300"}
                    >
                      {link.icon}
                      <span className="capitalize">{link.name}</span>
                    </a>
                  ) : (
                    <NavLink
                      to={`/${link.name.replace(/ /g, '')}`}
                      key={link.name}
                      onClick={handleCloseSideBar}
                      style={({ isActive }) => ({
                        backgroundColor: isActive ? '#F06292' : '',
                        color: isActive ? 'white' : '',
                      })}
                      className={({ isActive }) => (isActive ? activeLink : normalLink)}
                    >
                      {link.icon}
                      <span className="capitalize">{link.name}</span>
                    </NavLink>
                  )
                ))}
              </div>
            ))}

            {/* Help Section - Stands Out */}
            <div className="mt-6 px-2">
              <p className="text-gray-700 dark:text-gray-300 uppercase font-semibold px-4 py-2 text-lg">
                Support
              </p>
              <NavLink
                to="/help"
                onClick={handleCloseSideBar}
                className="flex items-center justify-center gap-4 px-6 py-4 rounded-xl text-white text-lg font-bold bg-pink-500 shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <FaHandsHelping className="text-2xl" />
                <span>Help People in Need</span>
              </NavLink>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
