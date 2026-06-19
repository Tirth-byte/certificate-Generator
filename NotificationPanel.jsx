import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Icons represented as SVG components for zero-dependency portability
const UploadIcon = () => (
  <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const GearIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SuccessIcon = () => (
  <svg className="w-6 h-6 text-[#788C5D] filter drop-shadow-[0_0_6px_rgba(120,140,93,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5 text-[#C15F3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// Individual Notification Card with self-contained auto-dismissal timer logic
const NotificationCard = ({ item, onRemove }) => {
  const { id, title, subtitle, status, progress } = item;
  const timerRef = useRef(null);

  useEffect(() => {
    // If state reaches 'completed' or 'error', start auto-dismissal timer
    if (status === 'completed' || status === 'error') {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      timerRef.current = setTimeout(() => {
        onRemove(id);
      }, 2500); // Fades out and removes itself after 2.5 seconds
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [status, id, onRemove]);

  // Framer Motion Animation Variants
  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 350, 
        damping: 24 
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { 
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  // Border and shadow dynamic classes matching Claude Neo-Brutalism
  const getBrutalistStyles = () => {
    switch (status) {
      case 'completed':
        return 'border-[#788C5D] bg-[#ffffff] text-[#141413] shadow-[4px_4px_0px_0px_#141413]';
      case 'error':
        return 'border-[#C15F3C] bg-[#ffffff] text-[#141413] shadow-[4px_4px_0px_0px_#141413]';
      case 'active':
      default:
        return 'border-[#141413] bg-[#ffffff] text-[#141413] shadow-[4px_4px_0px_0px_#141413] animate-pulse-subtle';
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={`relative w-full max-w-md p-4 mb-3 border-3 rounded-lg ${getBrutalistStyles()} transition-all duration-200 flex items-center justify-between gap-4 overflow-hidden`}
    >
      {/* Subtle indicator strip */}
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
        status === 'completed' ? 'bg-[#788C5D]' : status === 'error' ? 'bg-[#C15F3C]' : 'bg-[#D97757]'
      }`} />

      {/* Info Section */}
      <div className="flex-1 min-w-0 pl-1.5 z-10">
        <h4 className="text-sm font-extrabold text-[#141413] tracking-wide truncate">
          {title}
        </h4>
        <p className="text-xs text-[#6E645E] font-medium mt-1 truncate">
          {subtitle}
        </p>

        {/* Progress Bar for active tasks */}
        {status === 'active' && typeof progress === 'number' && (
          <div className="w-full bg-[#E8E6DC] h-2.5 rounded-full mt-3 border border-[#141413]/20 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-[#D97757] to-[#788C5D] h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        )}
      </div>

      {/* Status Icon Indicator Section */}
      <div className="flex items-center justify-center shrink-0 z-10">
        <AnimatePresence mode="wait">
          {status === 'active' && (
            <motion.div
              key="active-icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-[#D97757] p-2 bg-[#FAF9F5] border-2 border-[#141413] rounded shadow-[1px_1px_0px_#141413]"
            >
              {title.toLowerCase().includes('upload') ? <UploadIcon /> : <GearIcon />}
            </motion.div>
          )}

          {status === 'completed' && (
            <motion.div
              key="success-icon"
              initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
              animate={{ 
                scale: [0.5, 1.2, 1], 
                rotate: 0, 
                opacity: 1 
              }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="p-1.5 bg-[#FAF9F5] border-2 border-[#788C5D] rounded flex items-center justify-center shadow-[1px_1px_0px_#788C5D]"
            >
              <SuccessIcon />
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error-icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-[#C15F3C] p-2 bg-[#FAF9F5] border-2 border-[#C15F3C] rounded shadow-[1px_1px_0px_#C15F3C]"
            >
              <ErrorIcon />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Main Notification Feed Container
export const NotificationPanel = ({ notifications, setNotifications }) => {
  
  const handleRemove = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end w-full max-w-md pointer-events-none">
      <div className="flex flex-col gap-3 w-full pointer-events-auto">
        <AnimatePresence initial={false}>
          {notifications.map((item) => (
            <NotificationCard
              key={item.id}
              item={item}
              onRemove={handleRemove}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Standard CSS Animations for TailWind Configuration integration
export const injectRedesignCSS = () => {
  const styles = `
    @keyframes pulseSubtle {
      0%, 100% {
        transform: translateY(0);
        box-shadow: 4px 4px 0px 0px #141413;
      }
      50% {
        transform: translateY(-1px);
        box-shadow: 5px 5px 0px 0px #141413;
      }
    }
    .animate-pulse-subtle {
      animation: pulseSubtle 2s infinite ease-in-out;
    }
    .border-3 {
      border-width: 3px;
    }
  `;
  
  if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  }
};

// DEMONSTRATION WORKSPACE DASHBOARD
export default function AppDemo() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Uploading certificate_template.png',
      subtitle: 'Sending high-resolution template image',
      status: 'active',
      progress: 45
    },
    {
      id: '2',
      title: 'Generating PDF Certificates',
      subtitle: 'Batch generating 128 certificates',
      status: 'active',
      progress: 72
    }
  ]);

  // Simulate updating process mock updates
  useEffect(() => {
    injectRedesignCSS();

    // Increment progress periodically
    const interval = setInterval(() => {
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.status === 'active') {
            const nextProgress = n.progress + Math.floor(Math.random() * 15);
            if (nextProgress >= 100) {
              return {
                ...n,
                progress: 100,
                status: 'completed',
                title: n.title.includes('Uploading') 
                  ? '✓ Template uploaded successfully' 
                  : '✓ Certificates generated successfully',
                subtitle: 'Process completed successfully.'
              };
            }
            return { ...n, progress: nextProgress };
          }
          return n;
        })
      );
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const addSimulatedTask = () => {
    const newId = Date.now().toString();
    setNotifications((prev) => [
      ...prev,
      {
        id: newId,
        title: `Processing Task #${newId.slice(-4)}`,
        subtitle: 'Preparing compilation context...',
        status: 'active',
        progress: 10
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#141413] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background dot grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(20,20,19,0.06)_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

      <div className="z-10 max-w-lg text-center flex flex-col gap-6">
        <header>
          <span className="text-xs uppercase tracking-widest text-[#D97757] font-extrabold px-3 py-1 border-3 border-[#141413] rounded bg-[#ffffff] shadow-[2px_2px_0px_#141413]">
            Claude Design System
          </span>
          <h1 className="text-4xl font-black mt-4 tracking-tight uppercase">Progress Feed Redesign</h1>
          <p className="text-[#6E645E] mt-2 text-sm font-semibold">
            Redesigned Neo-Brutalist component using Claude color palette (White/Cream base, Orange accents, and solid flat offset shadows).
          </p>
        </header>

        <div className="flex justify-center gap-4">
          <button 
            onClick={addSimulatedTask}
            className="px-6 py-3 bg-[#D97757] hover:bg-[#C15F3C] text-white font-extrabold rounded border-3 border-[#141413] shadow-[4px_4px_0px_0px_#141413] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_#141413] transition-all"
          >
            + Add Active Upload
          </button>
        </div>

        <div className="text-left mt-8 p-4 bg-white border-3 border-[#141413] rounded shadow-[4px_4px_0px_#141413]">
          <h5 className="text-xs font-black text-[#D97757] uppercase tracking-wider mb-2">Simulated State Feed</h5>
          <pre className="text-[10px] text-[#141413]/70 overflow-x-auto max-h-32 font-bold">
            {JSON.stringify(notifications, null, 2)}
          </pre>
        </div>
      </div>

      {/* Render the Notification Panel */}
      <NotificationPanel 
        notifications={notifications} 
        setNotifications={setNotifications} 
      />
    </div>
  );
}
