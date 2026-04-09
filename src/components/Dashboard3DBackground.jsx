import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

const NetworkParticles = ({ count = 3000 }) => {
  const ref = useRef();

  const [positions, scales] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      scales[i] = Math.random();
    }

    return [positions, scales];
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
      ref.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-scale"
          count={count}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#1e88e5"
        sizeAttenuation={true}
        transparent={true}
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const DataNodes = () => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
        groupRef.current.rotation.y -= delta * 0.05;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {[...Array(12)].map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={1.5} floatIntensity={2} position={[
          (Math.random() - 0.5) * 20, 
          (Math.random() - 0.5) * 20, 
          (Math.random() - 0.5) * 20
        ]}>
          <mesh>
            <octahedronGeometry args={[Math.random() * 0.5 + 0.2]} />
            <meshPhysicalMaterial 
              color="#42a5f5" 
              metalness={0.9} 
              roughness={0.1} 
              transmission={0.4} 
              thickness={0.5} 
              transparent
              opacity={0.7}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

export default function Dashboard3DBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      pointerEvents: 'none',
      background: 'linear-gradient(135deg, rgba(21, 101, 192, 0.02) 0%, rgba(30, 136, 229, 0.02) 100%)'
    }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#42a5f5" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#10B981" />
        
        <NetworkParticles count={4000} />
        <DataNodes />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
