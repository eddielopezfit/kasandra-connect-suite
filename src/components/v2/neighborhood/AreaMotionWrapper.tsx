import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface AreaMotionWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: boolean;
}

const AreaMotionWrapper = ({ children, className, delay = 0, stagger = false }: AreaMotionWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        delay,
        ...(stagger ? { staggerChildren: 0.12 } : {}),
      }}
    >
      {children}
    </motion.div>
  );
};

export const MotionChild = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 16 },
      visible: { opacity: 1, y: 0 },
    }}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export default AreaMotionWrapper;
