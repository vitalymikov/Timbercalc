
import { CalcStandard } from '../types';

export const calculateVolume = (diameter: number, length: number, standard: CalcStandard): number => {
  const d_m = diameter / 100; // convert cm to m
  
  switch (standard) {
    case CalcStandard.HUBER:
      // V = L * pi * (d/2)^2
      return Number((length * Math.PI * Math.pow(d_m / 2, 2)).toFixed(4));
    
    case CalcStandard.CYLINDER:
      return Number((length * Math.PI * Math.pow(d_m / 2, 2)).toFixed(4));
      
    case CalcStandard.GOST_APPROX:
      // Simplistic GOST 2708-75 polynomial approximation for common ranges
      // In a real app, this would use the actual lookup tables
      const volume = (0.00007854 * diameter * diameter * length) * (1 + (0.01 * length));
      return Number(volume.toFixed(4));

    default:
      return Number((length * Math.PI * Math.pow(d_m / 2, 2)).toFixed(4));
  }
};

export const formatVolume = (v: number) => v.toFixed(3) + ' m³';
