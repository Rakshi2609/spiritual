"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import shapeData from "./om_shape.json";

/* ----------------------------------------------------------------------------
   A true 3D model of the product photo: the Om (ॐ) pendant's silhouette was
   traced directly from necklace.jpeg (marching-squares contour + holes) and is
   extruded here into solid oxidized metal, hung on a procedural box chain.
---------------------------------------------------------------------------- */

const METAL = "#74747D"; // neutral oxidised silver-grey
const CHAIN = "#84848E"; // slightly brighter grey box chain

type ShapeEntry = { outer: number[][]; holes: number[][][] };

function buildShapes(data: ShapeEntry[]): THREE.Shape[] {
  return data.map((s) => {
    const shape = new THREE.Shape();
    s.outer.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
    shape.closePath();
    s.holes.forEach((h) => {
      const path = new THREE.Path();
      h.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
      path.closePath();
      shape.holes.push(path);
    });
    return shape;
  });
}

export default function OmPendant() {
  const group = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const shapes = buildShapes(shapeData as ShapeEntry[]);
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.055,
      bevelSegments: 6, // rounded, polished edge — no sharp corners
      curveSegments: 4,
    });
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }, []);

  // smooth snake/box chain — one continuous tube draped through the bail
  const chainGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.5, 2.9, -0.1),
      new THREE.Vector3(-1.4, 2.0, 0.05),
      new THREE.Vector3(-0.45, 1.45, 0.05),
      new THREE.Vector3(0, 1.3, 0.05),
      new THREE.Vector3(0.45, 1.45, 0.05),
      new THREE.Vector3(1.4, 2.0, 0.05),
      new THREE.Vector3(2.5, 2.9, -0.1),
    ]);
    return new THREE.TubeGeometry(curve, 120, 0.075, 16, false);
  }, []);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={group} position={[0, -0.35, 0]} scale={1.05}>
      {/* the extruded Om pendant — smooth rounded edges */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={METAL} metalness={1} roughness={0.34} envMapIntensity={1.0} />
      </mesh>

      {/* smooth chain */}
      <mesh geometry={chainGeometry} castShadow>
        <meshStandardMaterial color={CHAIN} metalness={1} roughness={0.28} envMapIntensity={1.0} />
      </mesh>
    </group>
  );
}
