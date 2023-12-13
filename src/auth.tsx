import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export function Auth() {
  const { loginWithRedirect } = useAuth0();
  const { logout } = useAuth0();

  return (
    <>
      <h1>Auth</h1>
      <button onClick={() => loginWithRedirect()}>Log In</button>
      <button
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
      >
        Log Out
      </button>
    </>
  );
}
