import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { SignInPage } from "./pages/SignInPage.jsx";
import { SignUpPage } from "./pages/SignUpPage.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute.jsx";
import { MissingKeyScreen } from "./components/MissingKeyScreen.jsx";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function Root() {
  if (!clerkPublishableKey) return <MissingKeyScreen />;

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <BrowserRouter>
        <Routes>
          <Route path="/sign-in/*" element={<PublicOnlyRoute><SignInPage /></PublicOnlyRoute>} />
          <Route path="/sign-up/*" element={<PublicOnlyRoute><SignUpPage /></PublicOnlyRoute>} />
          <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
