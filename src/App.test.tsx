import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";

// The vi.mock call has been REMOVED.
// Mocking will now be handled globally by the vitest.config.ts alias.

describe("App", () => {
  it("renders the main application without crashing", () => {
    render(<App />);
    // The global mock will ensure onAuthStateChanged runs instantly.
    // The app will then render the landing page.
    const footerText = screen.getByText(/Stature-AI. All rights reserved./i);
    expect(footerText).toBeInTheDocument();
  });
});
