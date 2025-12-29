
import React, { useEffect, useState } from 'react';

interface OverlayFeedbackProps {
  message: string | null;
}

const OverlayFeedback: React.FC<OverlayFeedbackProps> = ({ message }) => {
  const [visible, setVisible] = useState(false);
  const [displayMessage, setDisplayMessage] = useState('');

  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 800); // Disappear after 800ms
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-[15rem] font-bold text-slate-200 opacity-[0.08] select-none font-mono tracking-tighter">
        {displayMessage}
      </div>
    </div>
  );
};

export default OverlayFeedback;
