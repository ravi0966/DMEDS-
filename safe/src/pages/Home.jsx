import React from "react";
import { Link } from "react-router-dom";
import logo from "../data/digicure.svg";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-pink-200">
      
      {/* Centered Logo and Website Name */}
      <div className="flex flex-col items-center space-y-4">
        <img src={logo} alt="DMEDS+ Logo" className="h-40 w-40 drop-shadow-lg" /> 
        <h1 className="text-6xl font-extrabold text-pink-900 drop-shadow-md">DMEDS+</h1>
      </div>

      {/* Call to Action Box */}
      <div className="flex flex-col items-center space-y-6 bg-white p-10 mt-8 rounded-2xl shadow-2xl border border-pink-300">
        <p className="text-pink-700 text-center text-lg max-w-lg leading-relaxed">
          Securely store and manage your medical records with ease.
        </p>
        <p className="text-pink-700 text-center text-lg max-w-lg leading-relaxed">
         An all in one medical solution to all your problems.
        </p>
        <div className="flex space-x-6">
          <Link 
            to="/login" 
            className="px-8 py-4 text-white bg-pink-500 text-lg font-medium rounded-lg shadow-md hover:bg-pink-600 transition transform hover:scale-105"
          >
            Log In
          </Link>
          <Link 
            to="/signup" 
            className="px-8 py-4 text-pink-500 border-2 border-pink-500 text-lg font-medium rounded-lg shadow-md hover:bg-pink-100 transition transform hover:scale-105"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
