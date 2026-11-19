import { describe, expect, it } from "vitest";
import type { QtiAttemptStateV1 } from "@longsightgroup/qti3-core";
import { qtiAssessmentItemPlayerLoadStateKey } from "./player-adapter.js";

describe("qtiAssessmentItemPlayerLoadStateKey", () => {
  it("returns undefined for missing state", () => {
    expect(qtiAssessmentItemPlayerLoadStateKey(undefined)).toBeUndefined();
  });

  it("treats equivalent state objects as the same load key", () => {
    const state: QtiAttemptStateV1 = {
      schema: "qti3.attempt-state.v1",
      itemIdentifier: "ITEM-1",
      status: "interacting",
      responses: {},
      outcomes: {},
      validationMessages: [],
    };
    expect(qtiAssessmentItemPlayerLoadStateKey(state)).toBe(
      qtiAssessmentItemPlayerLoadStateKey({ ...state }),
    );
  });

  it("treats different key order as different load keys", () => {
    const first: QtiAttemptStateV1 = {
      schema: "qti3.attempt-state.v1",
      itemIdentifier: "ITEM-1",
      status: "interacting",
      responses: {},
      outcomes: {},
      validationMessages: [],
    };
    const second: QtiAttemptStateV1 = {
      schema: "qti3.attempt-state.v1",
      status: "interacting",
      itemIdentifier: "ITEM-1",
      responses: {},
      outcomes: {},
      validationMessages: [],
    };
    expect(qtiAssessmentItemPlayerLoadStateKey(first)).not.toBe(
      qtiAssessmentItemPlayerLoadStateKey(second),
    );
  });
});
