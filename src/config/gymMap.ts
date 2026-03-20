export interface EquipmentConfig {
  id: string;
  name: string;
  type: string;
  imageSrc: string;
  x: number; // 百分比
  y: number; // 百分比
  width: number; // 百分比
  zIndexOffset?: number;
  interactAction: string;
  rotate?: number; // 旋转角度，例如 90
}

export const gymMap: EquipmentConfig[] = [
  { id: 'treadmill_1', name: '跑步机', type: 'cardio', imageSrc: '/assets/treadmill.png', x: 40, y: 70, width: 13, zIndexOffset: 0, interactAction: 'treadmill_run' },
  { id: 'cable_1', name: '龙门架', type: 'strength', imageSrc: '/assets/cable-machine.png', x: 56, y: 93, width: 23, zIndexOffset: 0, interactAction: 'cable_pull' },
  { id: 'smith_1', name: '史密斯机', type: 'strength', imageSrc: '/assets/smith-machine.png', x: 40, y: 44, width: 20, zIndexOffset: 0, interactAction: 'squat' },
  { id: 'barbell_1', name: '杠铃', type: 'free_weight', imageSrc: '/assets/barbell.png', x: 60, y: 70, width: 5, zIndexOffset: 0, interactAction: 'deadlift', }
];