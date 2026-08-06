import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
}));

vi.mock("@/lib/api/auth");

import LoginPage from "./page";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import * as authApi from "@/lib/api/auth";
import { tokenStorage } from "@/lib/api/client";

const mockedAuthApi = vi.mocked(authApi);

function renderLoginPage() {
  return render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    tokenStorage.clear();
    vi.clearAllMocks();
  });

  it("renders the login form", () => {
    renderLoginPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("submits credentials, logs in, and navigates to the dashboard", async () => {
    const user = userEvent.setup();
    mockedAuthApi.login.mockResolvedValue({
      id: "1",
      email: "user@example.com",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    });

    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "supersecret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockedAuthApi.login).toHaveBeenCalledWith("user@example.com", "supersecret1");
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows an error message when login fails", async () => {
    const user = userEvent.setup();
    mockedAuthApi.login.mockRejectedValue(new Error("Invalid credentials"));

    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/incorrect email or password/i)).toBeInTheDocument();
  });
});
