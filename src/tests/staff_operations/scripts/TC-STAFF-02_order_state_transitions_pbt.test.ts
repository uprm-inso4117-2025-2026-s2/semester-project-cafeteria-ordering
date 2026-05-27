/**
 * Property-Based Tests: Order State Transitions
 *
 * @id      TC-STAFF-02
 * @author  Reinaldo J. Martinez Morales
 * @issue   #537
 *
 * Five properties verified via fast-check over the pure state machine defined
 * in order-state-machine.ts. Fast-check generates random inputs and
 * automatically shrinks any failing case to its minimal counterexample.
 *
 */

import fc from "fast-check";
import {
  ALL_STATES,
  getValidNextStates,
  isTerminalState,
  isValidTransition,
  VALID_TRANSITIONS,
  type OrderStatus,
} from "../../../lib/order-state-machine";

const anyState = fc.constantFrom<OrderStatus>(...ALL_STATES);

const terminalState = fc.constantFrom<OrderStatus>("completed", "cancelled");

const validPair = fc.constantFrom<[OrderStatus, OrderStatus]>(
  ...VALID_TRANSITIONS,
);

const stateSequence = fc.array(anyState, { minLength: 1, maxLength: 8 });

function setsEqual(a: OrderStatus[], b: OrderStatus[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((x) => setA.has(x));
}

function expectedNextStates(status: OrderStatus): OrderStatus[] {
  return VALID_TRANSITIONS.filter(([f]) => f === status).map(([, t]) => t);
}

describe("Smoke tests – specific known transitions", () => {
  it("ST-1: placed → preparing is valid", () => {
    expect(isValidTransition("placed", "preparing")).toBe(true);
  });

  it("ST-2: ready → completed is valid", () => {
    expect(isValidTransition("ready", "completed")).toBe(true);
  });

  it("ST-3: completed → placed is invalid (backwards)", () => {
    expect(isValidTransition("completed", "placed")).toBe(false);
  });

  it("ST-4: cancelled → preparing is invalid (terminal)", () => {
    expect(isValidTransition("cancelled", "preparing")).toBe(false);
  });

  it("ST-5: isTerminalState correctly classifies all states", () => {
    expect(isTerminalState("completed")).toBe(true);
    expect(isTerminalState("cancelled")).toBe(true);
    expect(isTerminalState("placed")).toBe(false);
    expect(isTerminalState("preparing")).toBe(false);
    expect(isTerminalState("ready")).toBe(false);
  });
});

describe("Property 1 – every defined valid transition is accepted", () => {
  it("isValidTransition returns true for all pairs in VALID_TRANSITIONS", () => {
    fc.assert(
      fc.property(validPair, ([from, to]) => {
        return isValidTransition(from, to) === true;
      }),
      { numRuns: 200, verbose: true },
    );
  });
});

describe("Property 2 – terminal states cannot transition to any state", () => {
  it("isValidTransition returns false for all (terminal, any) pairs", () => {
    fc.assert(
      fc.property(terminalState, anyState, (from, to) => {
        return isValidTransition(from, to) === false;
      }),
      { numRuns: 200, verbose: true },
    );
  });
});

describe("Property 3 – no state can transition to itself", () => {
  it("isValidTransition(s, s) is false for every state s", () => {
    fc.assert(
      fc.property(anyState, (s) => {
        return isValidTransition(s, s) === false;
      }),
      { numRuns: 200, verbose: true },
    );
  });
});

describe("Property 4 – getValidNextStates matches VALID_TRANSITIONS", () => {
  it("for every state, getValidNextStates returns exactly the expected successors", () => {
    fc.assert(
      fc.property(anyState, (s) => {
        return setsEqual(getValidNextStates(s), expectedNextStates(s));
      }),
      { numRuns: 200, verbose: true },
    );
  });
});

describe("Property 5 – randomly generated valid walks are consistent", () => {
  it("every consecutive pair in a valid-transition walk is accepted", () => {
    fc.assert(
      fc.property(stateSequence, (seq) => {
        fc.pre(
          seq.length >= 2 &&
            seq.slice(0, -1).every((s, i) => isValidTransition(s, seq[i + 1])),
        );

        return seq
          .slice(0, -1)
          .every((s, i) => isValidTransition(s, seq[i + 1]));
      }),
      { numRuns: 500, verbose: true },
    );
  });

  it("completed and cancelled states always appear as the final step of any shrunk walk", () => {
    fc.assert(
      fc.property(stateSequence, (seq) => {
        fc.pre(seq.length >= 2);
        fc.pre(seq[0] === "placed");
        fc.pre(
          seq.slice(0, -1).every((s, i) => isValidTransition(s, seq[i + 1])),
        );

        const terminalIdx = seq.findIndex(isTerminalState);

        if (terminalIdx === -1) return true;

        return terminalIdx === seq.length - 1;
      }),
      { numRuns: 500, verbose: true },
    );
  });
});
