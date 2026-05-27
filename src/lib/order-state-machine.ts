/**
 * Orders state machine definition and utilities.
 *
 * This module defines the order states and valid transitions for the cafeteria ordering system.
 */

export type OrderStatus =
  | "placed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export const ALL_STATES: OrderStatus[] = [
  "placed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

export const TERMINAL_STATES: OrderStatus[] = ["completed", "cancelled"];

// Every (from -> to) pair that the system allows.
export const VALID_TRANSITIONS: [OrderStatus, OrderStatus][] = [
  ["placed", "preparing"],
  ["placed", "ready"],
  ["placed", "cancelled"],
  ["preparing", "ready"],
  ["preparing", "cancelled"],
  ["ready", "completed"],
  ["ready", "cancelled"],
];

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS.some(([f, t]) => f === from && t === to);
}

export function getValidNextStates(status: OrderStatus): OrderStatus[] {
  return VALID_TRANSITIONS.filter(([f]) => f === status).map(([, t]) => t);
}

export function isTerminalState(status: OrderStatus): boolean {
  return TERMINAL_STATES.includes(status);
}
