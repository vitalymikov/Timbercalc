
export enum CalcStandard {
  HUBER = 'Huber (Middle Diameter)',
  SMALIAN = 'Smalian (Two Ends)',
  CYLINDER = 'Simple Cylinder',
  GOST_APPROX = 'GOST 2708-75 (Approx)'
}

export interface Log {
  id: string;
  diameter: number; // in cm
  length: number;   // in m
  volume: number;   // in m3
  species?: string;
  timestamp: number;
}

export interface Batch {
  id: string;
  name: string;
  logs: Log[];
  standard: CalcStandard;
  timestamp: number;
}

export type View = 'dashboard' | 'calculator' | 'voice' | 'scanner' | 'history';