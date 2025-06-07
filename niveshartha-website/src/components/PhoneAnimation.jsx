import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const PhoneAnimation = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-[600px]">
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative w-[280px] h-[580px] bg-black rounded-[40px] shadow-2xl overflow-hidden">
          {/* Phone frame */}
          <div className="absolute inset-0 border-4 border-gray-800 rounded-[40px] pointer-events-none" />
          
          {/* Screen content */}
          <div className="absolute inset-0 bg-white">
            {/* Status bar */}
            <div className="h-6 bg-black text-white text-xs flex items-center justify-between px-4">
              <span>9:41</span>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white rounded-full" />
                <div className="w-4 h-4 bg-white rounded-full" />
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </div>

            {/* App content */}
            <div className="p-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Niveshartha</h2>
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Portfolio Value</p>
                    <p className="text-2xl font-bold">₹2.5L</p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Today's P&L</p>
                    <p className="text-2xl font-bold text-green-600">+₹1,234</p>
                  </div>
                </div>

                {/* Watchlist */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Watchlist</h3>
                  <div className="space-y-2">
                    {['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'].map((stock) => (
                      <div key={stock} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{stock}</span>
                        <span className="text-green-600">+1.2%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Home button */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-800 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};

export default PhoneAnimation; 