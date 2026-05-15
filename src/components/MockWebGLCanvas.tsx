'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function Snake({ color, speed, radius, segments = 18, offset = 0 }: { color: string; speed: number; radius: number; segments?: number; offset?: number }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const a = t - i * 0.18;
      m.position.x = Math.cos(a) * radius + Math.sin(a * 0.7) * 0.4;
      m.position.y = Math.sin(a) * radius * 0.55 + Math.cos(a * 1.3) * 0.3;
      m.position.z = Math.sin(a * 0.5) * 0.5;
      const s = 1 - i / (segments * 1.4);
      m.scale.setScalar(0.18 + s * 0.18);
    });
  });

  return (
    <group>
      {Array.from({ length: segments }).map((_, i) => (
        <mesh key={i} ref={el => { refs.current[i] = el; }}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={color} metalness={0.2} roughness={0.4} emissive={color} emissiveIntensity={0.4 - i * 0.015} />
        </mesh>
      ))}
    </group>
  );
}

function Pellets() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const items = useMemo(
    () => Array.from({ length: 30 }, () => ({
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 5,
      z: (Math.random() - 0.5) * 3,
      c: ['#FFD980', '#FF3B8A', '#5BFF8A', '#00E5FF', '#A455FF'][Math.floor(Math.random() * 5)],
    })),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.position.y = items[i].y + Math.sin(t * 1.2 + i) * 0.1;
      m.rotation.x = t;
      m.rotation.y = t * 0.7;
    });
  });

  return (
    <>
      {items.map((p, i) => (
        <mesh key={i} ref={el => { refs.current[i] = el; }} position={[p.x, p.y, p.z]}>
          <icosahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial color={p.c} emissive={p.c} emissiveIntensity={0.8} />
        </mesh>
      ))}
    </>
  );
}

export default function MockWebGLCanvas() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0, 8], fov: 55 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#FF9500" />
        <pointLight position={[-5, -3, 4]} intensity={0.8} color="#FF3B8A" />
        <pointLight position={[0, 4, -2]} intensity={0.6} color="#A455FF" />
        <Snake color="#FF9500" speed={0.6} radius={3.2} segments={24} offset={0} />
        <Snake color="#FF3B8A" speed={0.4} radius={2.4} segments={20} offset={2.2} />
        <Snake color="#5BFF8A" speed={0.8} radius={1.8} segments={16} offset={4.4} />
        <Pellets />
        <fog attach="fog" args={['#06070A', 6, 14]} />
      </Canvas>
    </div>
  );
}
