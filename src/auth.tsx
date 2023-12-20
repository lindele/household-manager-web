import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button, Label } from "flowbite-react";

export function Auth() {
  const { loginWithRedirect } = useAuth0();
  const { logout } = useAuth0();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Label>Welcome to Household Manager</Label>
      <Button onClick={() => loginWithRedirect()}>Login</Button>
      <Button
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
      >
        Logout
      </Button>
    </div>
  );
}
