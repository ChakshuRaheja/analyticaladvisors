import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageCarousel = ({ images, interval = 5000, fullPage = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Add responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-advance to the next slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  // Manual navigation
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    })
  };

  // Keep track of slide direction for animations
  const [direction, setDirection] = useState(0);
  
  const handleNext = () => {
    setDirection(1);
    goToNext();
  };
  
  const handlePrevious = () => {
    setDirection(-1);
    goToPrevious();
  };

  // Check if current image is data-trust
  const isDataTrustImage = () => {
    const imageSrc = images[currentIndex]?.src || '';
    const srcString = typeof imageSrc === 'string' ? imageSrc : '';
    return srcString.includes('data-trust');
  };

  // Debug: Log current image with full path
  const currentImage = images[currentIndex];
  const imageSrc = currentImage?.src || '';
  const fullImagePath = imageSrc.startsWith('http') ? imageSrc : `${window.location.origin}${imageSrc}`;
  
  console.log('Current slide:', {
    index: currentIndex,
    currentImage,
    imageSrc,
    fullImagePath,
    allImages: images,
    windowLocation: window.location.href
  });
  
  // Log image loading state
  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => console.log(`Image loaded successfully: ${imageSrc}`);
      img.onerror = () => console.error(`Failed to load image: ${imageSrc}`);
      img.src = imageSrc.startsWith('http') ? imageSrc : `${window.location.origin}${imageSrc}`;
    }
  }, [imageSrc]);

  return (
    <div className="relative w-full h-full" style={{
      height: '100%',
      width: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Image container */}
      <div className="relative h-full w-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {images && images.length > 0 && images[currentIndex] && (
            <motion.div
              key={currentIndex}
              custom={direction}
              className="absolute inset-0"
              initial="enter"
              animate="center"
              exit="exit"
              variants={slideVariants}
              transition={{ duration: 0.5 }}
            >
              <div className="w-full h-full flex items-center justify-center overflow-hidden bg-gray-100">
                {imageSrc ? (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: '#f8f9fa',
                      zIndex: 1
                    }}></div>
                    <img
                      src={imageSrc}
                      alt={images[currentIndex].alt || `Slide ${currentIndex + 1}`}
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
                      onError={(e) => {
                        console.error('Failed to load image:', images[currentIndex].src);
                        e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p>Image not available</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        className="absolute left-2 md:left-6 top-1/2 transform -translate-y-1/2 p-2 md:p-3 rounded-full bg-white bg-opacity-60 text-black hover:bg-opacity-80 transition-colors focus:outline-none z-20"
        onClick={handlePrevious}
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        className="absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2 p-2 md:p-3 rounded-full bg-white bg-opacity-60 text-black hover:bg-opacity-80 transition-colors focus:outline-none z-20"
        onClick={handleNext}
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              goToSlide(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 focus:outline-none
              ${currentIndex === index 
                ? 'bg-[#008080] scale-125' 
                : 'bg-gray-400 hover:bg-gray-600'
              }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;