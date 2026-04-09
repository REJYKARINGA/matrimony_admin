import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

const LogoScene = () => {
    const meshRef = useRef();
    
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.5;
            meshRef.current.rotation.y += delta * 1.5;
        }
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
            <pointLight position={[-10, -10, -5]} intensity={1} color="#42a5f5" />
            <mesh ref={meshRef}>
                <torusKnotGeometry args={[1, 0.3, 128, 16]} />
                <meshPhysicalMaterial 
                    color="#42a5f5" 
                    metalness={0.9} 
                    roughness={0.1}
                    clearcoat={1}
                />
            </mesh>
            <Environment preset="city" />
        </>
    );
};

export const Sidebar3DLogo = () => {
    return (
        <Canvas camera={{ position: [0, 0, 4] }} style={{ width: '40px', height: '40px' }} gl={{ alpha: true }}>
            <LogoScene />
        </Canvas>
    );
};

const BackgroundScene = () => {
    const groupRef = useRef();
    const count = 15;

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
        }
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} />
            
            <group ref={groupRef}>
                {[...Array(count)].map((_, i) => (
                    <Float key={i} speed={1} rotationIntensity={0.5} floatIntensity={1} position={[
                        (Math.random() - 0.5) * 8, 
                        (Math.random() - 0.5) * 30, 
                        -3 - Math.random() * 5
                    ]}>
                        <mesh rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
                            <capsuleGeometry args={[0.05, Math.random() * 3 + 1, 4, 8]} />
                            <meshPhysicalMaterial 
                                color="#1e88e5" 
                                transparent={true}
                                opacity={0.6}
                                transmission={0.5}
                                metalness={0.5}
                                roughness={0.2}
                            />
                        </mesh>
                    </Float>
                ))}
            </group>
        </>
    );
};

export const Sidebar3DBackground = () => {
    return (
        <Canvas 
            camera={{ position: [0, 0, 10], fov: 40 }} 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
            gl={{ alpha: true }}
        >
            <BackgroundScene />
        </Canvas>
    );
};
