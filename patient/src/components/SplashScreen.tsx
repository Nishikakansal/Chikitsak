
import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-screen w-full bg-background-light dark:bg-background-dark flex flex-col justify-between items-center overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-6 z-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-8 group"
        >
          {/* Ambient glow behind logo */}
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl transform scale-150 pointer-events-none"></div>
          {/* Logo card */}
          <div className="relative p-2 rounded-3xl shadow-2xl ring-2 ring-primary/30">
            <img
              src="/logo.svg"
              alt="CHIKITSAK logo"
              className="w-28 h-28 rounded-2xl drop-shadow-lg"
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            CHIKITSAK
          </h1>
          <h2 className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide uppercase">
            Right Hospital. Right Time. <span className="text-primary-dark dark:text-primary font-bold">Saving Lives.</span>
          </h2>
        </motion.div>
      </div>

      <div className="w-full flex flex-col items-center pb-12 relative z-0">
        <div className="w-48 flex flex-col gap-3 items-center">
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }}
              className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(19,236,236,0.5)]"
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-widest uppercase">Initializing</p>
        </div>
        <div className="absolute bottom-2 text-[10px] text-slate-300 dark:text-slate-700 font-mono">
          v1.0.0
        </div>
      </div>
    </div>
  );
}
