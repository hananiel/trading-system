export enum TradeState {
  WAIT = 'WAIT',
  ARMED = 'ARMED',
  ENTER = 'ENTER'
}

export interface TradeStateData {
  currentState: TradeState;
  previousState: TradeState;
  timestamp: number;
}