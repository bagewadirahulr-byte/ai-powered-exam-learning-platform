"use client";

import { useEffect, useState } from "react";
import { APP_NAME } from "@/config/constants";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Check if splash screen has already been shown in this session
    const hasShownSplash = sessionStorage.getItem("hasShownSplash");
    
    if (!hasShownSplash) {
      setIsVisible(true);
      
      // Extended to 10 seconds before fading out to give time to view all pictures
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, 10000);

      // Completely remove from DOM after 10.5 seconds
      const removeTimer = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem("hasShownSplash", "true");
      }, 10500);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, []);

  if (!isVisible) return null;

  const quoteWords = ["Ignite", "Your", "Exam", "Prep,", "Transform", "Your", "Future"];
  const creatorWords = ["Created", "by", "Data", "science", "students", "(CMR", "University):"];

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950 transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background glowing orbs */}
      <div className="absolute left-1/4 top-1/4 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
      <div className="absolute right-1/4 bottom-1/4 h-80 w-80 translate-x-1/2 translate-y-1/2 rounded-full bg-purple-600/20 blur-[120px] animate-pulse" />

      {/* Main Content */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center px-4">
        {/* Animated App Logo */}
        <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-3xl bg-gray-900 shadow-[0_0_40px_rgba(59,130,246,0.5)] animate-bounce overflow-hidden border border-white/10">
          <img 
            src="/team/logo.jpg" 
            alt="App Logo" 
            className="h-full w-full object-cover"
            onError={(e) => {
              if (e.currentTarget.src.includes('.jpg')) {
                e.currentTarget.src = '/team/logo.png';
              }
            }}
          />
        </div>
        
        {/* App Name with Gradient */}
        <h1 className="mb-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-white md:text-6xl animate-[fadeIn_1s_ease-out]">
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {APP_NAME}
          </span>
        </h1>
        
        <p className="text-xs sm:text-sm md:text-base font-medium tracking-widest text-gray-400 uppercase mt-2 animate-[fadeIn_1.5s_ease-out]">
          AI Powered Exam Learning Platform
        </p>

        {/* Motivational Quote - Word by word animation */}
        <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-base sm:text-lg md:text-xl font-medium italic text-blue-200">
          {quoteWords.map((word, i) => (
            <span
              key={`quote-${i}`}
              className="drop-shadow-md"
              style={{
                opacity: 0,
                animation: `fadeIn 0.6s ease-out forwards`,
                animationDelay: `${1.5 + i * 0.3}s` // Words appear from 1.5s to ~3.3s
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Credits Section */}
        <div className="mt-10 flex w-full flex-col items-center gap-6">
          
          {/* Creators Text - Word by word animation */}
          <div className="flex flex-wrap justify-center gap-1.5 text-gray-300 font-medium text-lg sm:text-xl">
            {creatorWords.map((word, i) => (
              <span
                key={`creator-${i}`}
                style={{
                  opacity: 0,
                  animation: `fadeIn 0.5s ease-out forwards`,
                  animationDelay: `${3.6 + i * 0.15}s` // Words appear sequentially after the quote
                }}
              >
                {word}
              </span>
            ))}
          </div>
          
          {/* Team Pictures & Names appearing one by one */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-4">
            
            <div className="flex flex-col items-center gap-3 animate-[slideUp_0.6s_ease-out_5.0s_both]">
              <div className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <img src="/team/rahul.jpg" alt="Rahul R Bagewadi" className="h-full w-full object-cover" onError={(e) => e.currentTarget.src = '/team/rahul.png'} />
              </div>
              <span className="text-sm sm:text-base font-bold text-blue-300 text-center uppercase">RAHUL R BAGEWADI</span>
            </div>

            <div className="flex flex-col items-center gap-3 animate-[slideUp_0.6s_ease-out_5.7s_both]">
              <div className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-2 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <img src="/team/charan.jpg" alt="Charan R" className="h-full w-full object-cover" onError={(e) => e.currentTarget.src = '/team/charan.png'} />
              </div>
              <span className="text-sm sm:text-base font-bold text-blue-300 text-center uppercase">CHARAN R</span>
            </div>

            <div className="flex flex-col items-center gap-3 animate-[slideUp_0.6s_ease-out_6.4s_both]">
              <div className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-2 border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                <img src="/team/dakshath.jpg" alt="Dakshath G N" className="h-full w-full object-cover" onError={(e) => e.currentTarget.src = '/team/dakshath.png'} />
              </div>
              <span className="text-sm sm:text-base font-bold text-blue-300 text-center uppercase">DAKSHATH G N</span>
            </div>

            <div className="flex flex-col items-center gap-3 animate-[slideUp_0.6s_ease-out_7.1s_both]">
              <div className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-2 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                <img src="/team/mahesh.jpg" alt="Mahesh Bilagi" className="h-full w-full object-cover" onError={(e) => e.currentTarget.src = '/team/mahesh.png'} />
              </div>
              <span className="text-sm sm:text-base font-bold text-blue-300 text-center uppercase">MAHESH BILAGI</span>
            </div>

          </div>
        </div>

        {/* Loading Bar fading in after names */}
        <div className="mt-14 h-1.5 w-64 md:w-96 overflow-hidden rounded-full bg-gray-800 animate-[fadeIn_1s_ease-out_8.5s_both]">
          <div className="h-full w-full origin-left bg-gradient-to-r from-blue-500 to-purple-500 animate-[loading_2s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Inline styles for custom animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes loading {
            0% { transform: scaleX(0); opacity: 0.1; }
            50% { transform: scaleX(1); opacity: 1; }
            100% { transform: scaleX(0); opacity: 0.1; transform-origin: right; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `
      }} />
    </div>
  );
}
