"use client"

import { Canvas } from "@react-three/fiber"
import { Environment, Float, OrbitControls, PerspectiveCamera, Stars, TorusKnot } from "@react-three/drei"
import { Suspense } from "react"

function AbstractShape() {
    return (
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            <TorusKnot args={[1, 0.3, 128, 16]}>
                <meshStandardMaterial
                    color="#f97316" // Orange-500
                    roughness={0.1}
                    metalness={0.8}
                    emissive="#c2410c" // Orange-700
                    emissiveIntensity={0.2}
                />
            </TorusKnot>
        </Float>
    )
}

export function Scene() {
    return (
        <div className="fixed inset-0 -z-10 h-full w-full bg-black">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 6]} />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />

                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={1} color="#f97316" />

                <Suspense fallback={null}>
                    <AbstractShape />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <Environment preset="city" />
                </Suspense>
            </Canvas>
        </div>
    )
}
