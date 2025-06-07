import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const ScrollAnimation = ({ children, animation = 'from-bottom', delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const variants = {
    'from-bottom': {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 }
    },
    'from-left': {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 }
    },
    'from-right': {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0 }
    },
    'fade-in': {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants[animation]}
      transition={{
        duration: 0.8,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimation; 