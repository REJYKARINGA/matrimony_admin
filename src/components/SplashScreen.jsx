import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Preload } from '@react-three/drei';
import { motion } from 'framer-motion';

const Rings = () => {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        {/* Ring 1 */}
        <mesh position={[-0.6, 0, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[1, 0.15, 64, 128]} />
          <meshStandardMaterial 
            color="#FFD700" 
            metalness={0.9} 
            roughness={0.1} 
            envMapIntensity={2}
          />
        </mesh>
        
        {/* Ring 2 */}
        <mesh position={[0.6, 0.4, 0]} rotation={[-Math.PI / 4, 0, 0]}>
          <torusGeometry args={[1, 0.15, 64, 128]} />
          <meshStandardMaterial 
            color="#FFD700" 
            metalness={0.9} 
            roughness={0.1} 
            envMapIntensity={2}
          />
        </mesh>
      </Float>
    </group>
  );
};

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'linear-gradient(135deg, var(--bg) 0%, var(--card-bg) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100vw', height: '60vh', position: 'absolute', top: '10%' }}>
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          <Rings />
          <Environment preset="city" />
          <Preload all />
        </Canvas>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '20%',
          textAlign: 'center',
          color: 'var(--text)'
        }}
      >
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
          fontWeight: '700', 
          margin: '0',
          background: 'linear-gradient(to right, var(--primary), var(--secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0px 4px 10px rgba(0,0,0,0.1)'
        }}>
          Matrimony Admin
        </h1>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 2, duration: 1.5, ease: "easeInOut" }}
          style={{ 
            height: '3px', 
            background: 'linear-gradient(to right, var(--primary), var(--secondary))', 
            margin: '15px auto 0', 
            maxWidth: '120px',
            borderRadius: '2px'
          }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          style={{ marginTop: '15px', color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem' }}
        >
          Loading system...
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
