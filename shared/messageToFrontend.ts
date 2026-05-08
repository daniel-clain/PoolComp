import type { BackendState } from "./domain.js";


export type MessageToFrontend = {
  message: 'actionInProgress';
  data: boolean;
} | {
  message: 'allData';
  data: BackendState;
} 
