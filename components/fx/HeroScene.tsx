"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "./gsap";

/**
 * WebGL pozadie hera — piliny/prach vznášajúce sa v svetelnom lúči.
 * Tri hĺbkové vrstvy častíc s teplými tónmi značky, jemná parallaxa
 * myši. Renderuje len keď je sekcia viditeľná; na mobile a pri
 * prefers-reduced-motion sa vôbec nespustí (rieši rodič).
 */
export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    // WebGL len na väčších obrazovkách; pri reduced-motion statický frame
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    // tichý pre-check, nech THREE nehádže chyby tam, kde WebGL nie je
    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return;

    const reduced = prefersReducedMotion();

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0d1321, 0.055);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 60);
    camera.position.set(0, 0, 14);

    // bez WebGL (staré GPU, zakázané v prehliadači) sekcia funguje aj bez častíc
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // mäkký okrúhly sprite pre častice
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = spriteCanvas.height = 64;
    const ctx2d = spriteCanvas.getContext("2d")!;
    const grad = ctx2d.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.5)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, 64, 64);
    const sprite = new THREE.CanvasTexture(spriteCanvas);

    const palette = [new THREE.Color(0xc5d86d), new THREE.Color(0xffeddf), new THREE.Color(0x86615c)];

    type Layer = { points: THREE.Points; speed: number; spread: number };
    const layers: Layer[] = [];

    const makeLayer = (count: number, size: number, depth: number, speed: number, opacity: number) => {
      const spread = 22;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const phases = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.7;
        positions[i * 3 + 2] = depth + (Math.random() - 0.5) * 3;
        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
        phases[i] = Math.random() * Math.PI * 2;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geo.userData.phases = phases;
      const mat = new THREE.PointsMaterial({
        size,
        map: sprite,
        vertexColors: true,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      const points = new THREE.Points(geo, mat);
      scene.add(points);
      layers.push({ points, speed, spread });
    };

    makeLayer(170, 0.14, 2, 0.16, 0.8); // popredie — väčšie, rýchlejšie
    makeLayer(240, 0.09, -2, 0.1, 0.55);
    makeLayer(320, 0.05, -6, 0.06, 0.35); // pozadie — drobný prach

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouse = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    let acc = 0;
    const FRAME = 1 / 30; // dekoratívny prach stačí na 30 fps — polovičná záťaž
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!visible || document.hidden) return;
      acc += clock.getDelta();
      if (acc < FRAME) return;
      acc %= FRAME;
      const t = clock.getElapsedTime();

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      camera.position.x = mouse.x * 0.9;
      camera.position.y = -mouse.y * 0.6;
      camera.lookAt(0, 0, 0);

      for (const layer of layers) {
        const pos = layer.points.geometry.getAttribute("position") as THREE.BufferAttribute;
        const arr = pos.array as Float32Array;
        const half = layer.spread / 2;
        // len stúpanie + wrap (lacný add/compare); horizontálne hojdanie
        // rieši transform celej vrstvy, nie per-vertex Math.sin
        for (let i = 1; i < arr.length; i += 3) {
          arr[i] += layer.speed * FRAME;
          if (arr[i] > half * 0.7) arr[i] = -half * 0.7;
        }
        pos.needsUpdate = true;
        layer.points.position.x = Math.sin(t * 0.3 + layer.spread) * 0.4;
        layer.points.rotation.y = Math.sin(t * 0.05) * 0.04;
      }

      renderer.render(scene, camera);
    };

    if (reduced) {
      // statický prvý frame, žiadna slučka
      renderer.render(scene, camera);
    } else {
      animate();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMouse);
      for (const layer of layers) {
        layer.points.geometry.dispose();
        (layer.points.material as THREE.Material).dispose();
      }
      sprite.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden />;
}
