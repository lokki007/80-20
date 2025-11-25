export interface ParetoDataPoint {
  label: string;
  impactValue: number; // 0-100 scale of result contribution
  effortValue: number; // 0-100 scale of effort required (usually low for 80/20 wins?) or just quantity
}

export interface RevenueStream {
  name: string;
  focusAllocation: number; // Percentage of resources (0-100)
  revenuePotential: number; // Percentage of total revenue (0-100)
}

export interface FractalLayer {
  level: number; // 1 = 80/20, 2 = 64/4, 3 = 50/1
  title: string;
  description: string;
  keyEntities: string[]; // The specific people/products/tasks
  justification: string;
}

export interface ParetoAnalysis {
  topic: string;
  focus: {
    title: string;
    content: string;
  };
  problems: {
    title: string;
    content: string;
  };
  fractalAnalysis: FractalLayer[]; // Array containing level 1 (20%), level 2 (4%), level 3 (1%)
  monetization: {
    title: string;
    content: string;
    streams: RevenueStream[];
  };
  chartData: ParetoDataPoint[]; // Top ~5-7 inputs that drive the majority of results
  actionPlan: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}