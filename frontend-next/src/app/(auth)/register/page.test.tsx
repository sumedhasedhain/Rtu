import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
}));

vi.mock("@/lib/api/auth");

import RegisterPage from "./page";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import * as authApi from "@/lib/api/auth";
import { tokenStorage } from "@/lib/api/client";

const mockedAuthApi = vi.mocked(authApi);

function renderRegisterPage() {
  return render(
    <AuthProvider>
      <RegisterPage />
    </AuthProvider>,
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    tokenStorage.clear();
    vi.clearAllMocks();
  });

  it("renders the registration form", () => {
    renderRegisterPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("registers, logs in, and navigates to the dashboard", async () => {
    const user = userEvent.setup();
    mockedAuthApi.register.mockResolvedValue({
      id: "1",
      email: "new@example.com",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    });
    mockedAuthApi.login.mockResolvedValue({
      id: "1",
      email: "new@example.com",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    });

    renderRegisterPage();

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.type(screen.getByLabelText(/password/i), "supersecret1");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockedAuthApi.register).toHaveBeenCalledWith("new@example.com", "supersecret1");
      expect(mockedAuthApi.login).toHaveBeenCalledWith("new@example.com", "supersecret1");
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows an error message when registration fails", async () => {
    const user = userEvent.setup();
    mockedAuthApi.register.mockRejectedValue(new Error("Email already registered"));

    renderRegisterPage();

    await user.type(screen.getByLabelText(/email/i), "dupe@example.com");
    await user.type(screen.getByLabelText(/password/i), "supersecret1");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/could not create your account/i)).toBeInTheDocument();
  });
});
