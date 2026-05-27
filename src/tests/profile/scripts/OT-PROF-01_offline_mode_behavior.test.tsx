/// <reference types="jest" />

import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Image, TouchableOpacity } from "react-native";
import { Alert } from "react-native";

const mockGetUser = jest.fn();
const mockGetProfileByUserId = jest.fn();
const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockSignOut = jest.fn();

type MockPermissionResponse = {
    status: "granted" | "denied";
};

type MockImagePickerResult = {
    canceled: boolean;
    assets: Array<{ uri: string }>;
};

const mockRequestMediaLibraryPermissionsAsync = jest.fn<
    () => Promise<MockPermissionResponse>
>();
const mockLaunchImageLibraryAsync = jest.fn<
    () => Promise<MockImagePickerResult>
>();

type StorageMap = Record<string, string>;

const storage: StorageMap = {};

const mockAsyncStorage = {
    getItem: jest.fn(async (key: string) => (key in storage ? storage[key] : null)),
    setItem: jest.fn(async (key: string, value: string) => {
        storage[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
        delete storage[key];
    }),
    clear: jest.fn(async () => {
        Object.keys(storage).forEach((key) => delete storage[key]);
    }),
};

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

jest.mock("expo-router", () => ({
    useRouter: () => ({
        replace: mockReplace,
        push: mockPush,
    }),
    useFocusEffect: (cb: () => void) => {
        // run the callback immediately like useEffect would in tests
        const { useEffect } = require("react");
        useEffect(cb, []);
    },
}));

jest.mock("@/hooks/use-color-scheme", () => ({
    useColorScheme: () => "light",
}));

jest.mock("@/lib/supabase", () => ({
    supabase: {
        auth: {
            signOut: mockSignOut,
            getUser: () => mockGetUser(),
        },
    },
}));

jest.mock("@/lib/profiles", () => ({
    getProfileByUserId: () => mockGetProfileByUserId(),
}));

jest.mock("expo-image-picker", () => ({
    requestMediaLibraryPermissionsAsync: () =>
        mockRequestMediaLibraryPermissionsAsync(),
    launchImageLibraryAsync: () =>
        mockLaunchImageLibraryAsync(),
}));

jest.mock("@expo/vector-icons", () => ({
    Ionicons: () => null,
}));

jest.mock("react-native/Libraries/Alert/Alert", () => ({
    alert: jest.fn(),
}));

jest.mock("@/constants/theme", () => ({
    Colors: {
        light: {
            text: "#424242",
            secondaryText: "#FAFAFA",
            alternateText: "#1C1C1C",
            background: "#FAFAFA",
            tint: "#2E7D32",
            icon: "#687076",
            tabIconDefault: "#687076",
            tabIconSelected: "#2E7D32",
        },
        dark: {
            text: "#FFFFFF",
            secondaryText: "#BDBDBD",
            alternateText: "#1C1C1C",
            background: "#1C1C1C",
            tint: "#FFCCBC",
            icon: "#9BA1A6",
            tabIconDefault: "#9BA1A6",
            tabIconSelected: "#FFCCBC",
        },
        primaryGreen: "#2E7D32",
        pastelSage: "#A5D6A7",
        pastelPeach: "#FFCCBC",
        softGray: "#EEEEEE",
        mutedGray: "#BDBDBD",
    },
    Typography: {
        heading: { fontFamily: "Bitter" },
        subheading: { fontFamily: "Inter" },
        body: { fontFamily: "Inter" },
        button: { fontFamily: "Inter" },
    },
}));

const ProfileScreen = require("../../../app/(tabs)/profile").default;

describe("OT-PROF-01 offline mode behavior", () => {
    beforeEach(async () => {
        await mockAsyncStorage.clear();
        jest.clearAllMocks();
        mockGetUser.mockResolvedValue({ data: { user: null } });
        mockGetProfileByUserId.mockResolvedValue(null);
        mockRequestMediaLibraryPermissionsAsync.mockImplementation(async () => ({
            status: "granted",
        }));
        mockLaunchImageLibraryAsync.mockImplementation(async () => ({
            canceled: false,
            assets: [{ uri: "file:///mock/path/avatar.jpg" }],
        }));
    });

    test("loads cached profile data and cached avatar from AsyncStorage on mount", async () => {
    // Screen loads from Supabase, not @profile_info — mock the data source
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-abc", email: "kevin@example.com" } } });
    mockGetProfileByUserId.mockResolvedValue({ full_name: "Kevin Lara", phone: "787-555-0001" });
    storage["@profile_avatar"] = "file:///mock/path/avatar.jpg";

    const screen = render(<ProfileScreen />);
    await waitFor(() => {
        expect(screen.getByText("Kevin Lara")).toBeTruthy();
        expect(screen.getByDisplayValue("Kevin Lara")).toBeTruthy();
        expect(screen.getByDisplayValue("kevin@example.com")).toBeTruthy();
        expect(screen.getByDisplayValue("787-555-0001")).toBeTruthy();
    });
    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("@profile_avatar");
    const images = screen.UNSAFE_getAllByType(Image);
    expect(
        images.some((img) => img.props.source?.uri === "file:///mock/path/avatar.jpg"),
    ).toBe(true);
});

    test("falls back safely when cached profile data and avatar are missing", async () => {
        const screen = render(<ProfileScreen />);

        await waitFor(() => {
            expect(screen.getByText("Your Name")).toBeTruthy();
        });

        //expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("@profile_info");
        expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("@profile_avatar");
        expect(screen.getByText("?")).toBeTruthy();
        expect(screen.queryByText(/offline/i)).toBeNull();
    });

    test("navigates to edit-profile from the profile screen and does not perform inline local save", async () => {
        const screen = render(<ProfileScreen />);

        await waitFor(() => {
            expect(screen.getByText("Edit")).toBeTruthy();
        });

        fireEvent.press(screen.getByText("Edit"));

        //expect(mockPush).toHaveBeenCalledWith("/edit-profile");
        expect(mockPush).toHaveBeenCalledWith({ pathname: "/edit-profile" });
        expect(mockAsyncStorage.setItem).not.toHaveBeenCalledWith(
            "@profile_info",
            expect.any(String),
        );
        expect(mockSignOut).not.toHaveBeenCalled();
        expect(screen.queryByText(/offline/i)).toBeNull();
    });

    test("persists previously cached profile data across remounts", async () => {
    // Screen fetches from Supabase on every focus — mock stays consistent across remounts
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-persist", email: "persisted@example.com" } } });
    mockGetProfileByUserId.mockResolvedValue({ full_name: "Kevin Persisted", phone: "787-000-9999" });

    const firstRender = render(<ProfileScreen />);
    await waitFor(() => {
        expect(firstRender.getByText("Kevin Persisted")).toBeTruthy();
        expect(firstRender.getByDisplayValue("Kevin Persisted")).toBeTruthy();
        expect(firstRender.getByDisplayValue("persisted@example.com")).toBeTruthy();
        expect(firstRender.getByDisplayValue("787-000-9999")).toBeTruthy();
    });

    firstRender.unmount();

    const secondRender = render(<ProfileScreen />);
    await waitFor(() => {
        expect(secondRender.getByText("Kevin Persisted")).toBeTruthy();
        expect(secondRender.getByDisplayValue("Kevin Persisted")).toBeTruthy();
        expect(secondRender.getByDisplayValue("persisted@example.com")).toBeTruthy();
        expect(secondRender.getByDisplayValue("787-000-9999")).toBeTruthy();
    });
});

    test("stores selected avatar locally and reloads it on remount", async () => {
        const firstRender = render(<ProfileScreen />);

        await waitFor(() => {
            expect(firstRender.getByText("Your Name")).toBeTruthy();
        });

        const touchables = firstRender.UNSAFE_getAllByType(TouchableOpacity);
        fireEvent.press(touchables[1]);

        await waitFor(() => {
            expect(mockRequestMediaLibraryPermissionsAsync).toHaveBeenCalled();
            expect(mockLaunchImageLibraryAsync).toHaveBeenCalled();
            expect(storage["@profile_avatar"]).toBe("file:///mock/path/avatar.jpg");
        });

        firstRender.unmount();

        const secondRender = render(<ProfileScreen />);

        await waitFor(() => {
            const images = secondRender.UNSAFE_getAllByType(Image);
            expect(
                images.some((img) => img.props.source?.uri === "file:///mock/path/avatar.jpg"),
            ).toBe(true);
        });
    });

    test("shows permission alert when avatar access is denied", async () => {
        mockRequestMediaLibraryPermissionsAsync.mockImplementationOnce(async () => ({
            status: "denied",
        }));
        const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => { });

        const screen = render(<ProfileScreen />);

        await waitFor(() => {
            expect(screen.getByText("Your Name")).toBeTruthy();
        });

        const touchables = screen.UNSAFE_getAllByType(TouchableOpacity);
        fireEvent.press(touchables[1]);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith("Permission needed to access photos.");
        });

        expect(mockLaunchImageLibraryAsync).not.toHaveBeenCalled();
        alertSpy.mockRestore();
    });
});
