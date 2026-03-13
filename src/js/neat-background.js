/**
 * NEAT Gradient Background
 * WebGL animated gradient cho Hero Section
 * Config từ https://neat.firecms.co/
 */

import { NeatGradient } from '@firecms/neat';

const NEAT_CONFIG = {
    colors: [
        { color: '#000000', enabled: true },
        { color: '#000205', enabled: true },
        { color: '#000000', enabled: true },
        { color: '#6E313D', enabled: false },
        { color: '#00429B', enabled: true },
    ],
    speed: 2,
    horizontalPressure: 4,
    verticalPressure: 4,
    waveFrequencyX: 3,
    waveFrequencyY: 2,
    waveAmplitude: 1,
    shadows: 2,
    highlights: 2,
    colorBrightness: 1,
    colorSaturation: -1,
    wireframe: false,
    colorBlending: 7,
    backgroundColor: '#010101',
    backgroundAlpha: 1,
    grainScale: 2,
    grainSparsity: 0,
    grainIntensity: 0,
    grainSpeed: 1,
    resolution: 0.75,
    yOffset: 533.7222900390625,
    yOffsetWaveMultiplier: 2.2,
    yOffsetColorMultiplier: 2.5,
    yOffsetFlowMultiplier: 2.8,
    flowDistortionA: 1.2,
    flowDistortionB: 2.4,
    flowScale: 1.5,
    flowEase: 0.41,
    flowEnabled: false,
    mouseDistortionStrength: 0.1,
    mouseDistortionRadius: 0.25,
    mouseDecayRate: 0.96,
    mouseDarken: 0.24,
    enableProceduralTexture: false,
    textureVoidLikelihood: 0.06,
    textureVoidWidthMin: 10,
    textureVoidWidthMax: 500,
    textureBandDensity: 0.8,
    textureColorBlending: 0.06,
    textureSeed: 333,
    textureEase: 0.68,
    proceduralBackgroundColor: '#FFED00',
    textureShapeTriangles: 20,
    textureShapeCircles: 15,
    textureShapeBars: 15,
    textureShapeSquiggles: 10,
};

export function initNeatBackground() {
    const canvas = document.getElementById('neat-canvas');
    if (!canvas) return null;

    const gradient = new NeatGradient({
        ref: canvas,
        ...NEAT_CONFIG,
    });

    return gradient;
}
