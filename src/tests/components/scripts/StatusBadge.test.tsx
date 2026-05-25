/// <reference types="jest" />

import { describe, expect, test } from "@jest/globals";
import { render } from "@testing-library/react-native";
import React from "react";

jest.mock("@/constants/theme", () => ({
  Colors: {
    primaryGreen: "#2E7D32",
    pastelSage: "#A5D6A7",
    pastelPeach: "#FFCCBC",
    softGray: "#EEEEEE",
    mutedGray: "#BDBDBD",
    light: { text: "#424242", secondaryText: "#FAFAFA" },
    dark: { text: "#FFFFFF", secondaryText: "#BDBDBD" },
  },
  Typography: {
    heading: { fontFamily: "Bitter" },
    subheading: { fontFamily: "Inter" },
    body: { fontFamily: "Inter" },
    button: { fontFamily: "Inter" },
  },
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

import {
  resolveStatusStyle,
  StatusBadge,
} from "@/components/ui/StatusBadge";

describe("StatusBadge mapping", () => {
  test("returns distinct styles for each canonical status", () => {
    const pending = resolveStatusStyle("Pending");
    const preparing = resolveStatusStyle("Preparing");
    const ready = resolveStatusStyle("Ready for Pickup");
    const completed = resolveStatusStyle("Completed");
    const cancelled = resolveStatusStyle("Cancelled");

    expect(pending.label).toBe("Pending");
    expect(preparing.label).toBe("Preparing");
    expect(ready.label).toBe("Ready");
    expect(completed.label).toBe("Completed");
    expect(cancelled.label).toBe("Cancelled");

    const colors = [
      pending.background,
      preparing.background,
      ready.background,
      completed.background,
      cancelled.background,
    ];
    expect(new Set(colors).size).toBe(colors.length);
  });

  test("maps legacy 'Complete' to the completed style", () => {
    const completed = resolveStatusStyle("Completed");
    const legacy = resolveStatusStyle("Complete");
    expect(legacy.background).toBe(completed.background);
    expect(legacy.text).toBe(completed.text);
  });

  test("maps OrderCard tab aliases (unread/open/finished)", () => {
    expect(resolveStatusStyle("unread").label).toBe("Pending");
    expect(resolveStatusStyle("open").label).toBe("Preparing");
    expect(resolveStatusStyle("finished").label).toBe("Completed");
  });

  test("falls back gracefully for unknown statuses", () => {
    const fallback = resolveStatusStyle("definitely-not-a-real-status");
    expect(fallback.label).toBe("Unknown");
  });
});

describe("StatusBadge rendering", () => {
  test("renders the status label", () => {
    const { getByText } = render(<StatusBadge status="Pending" />);
    expect(getByText("Pending")).toBeTruthy();
  });

  test("renders a custom label override when provided", () => {
    const { getByText, queryByText } = render(
      <StatusBadge status="Pending" label="Awaiting Pickup" />,
    );
    expect(getByText("Awaiting Pickup")).toBeTruthy();
    expect(queryByText("Pending")).toBeNull();
  });

  test("exposes an accessibility label that names the status", () => {
    const { getByLabelText } = render(
      <StatusBadge status="Ready for Pickup" />,
    );
    expect(getByLabelText(/Ready/i)).toBeTruthy();
  });
});
