import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

export function Home() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  return (
    <>
      <h1>Home</h1>
      {isLoading && <div>Loading ...</div>}
      {isAuthenticated && (
        <div>
          <h3>test</h3>
          <img src={user?.picture} alt={user?.name} />
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
        </div>
      )}
    </>
  );
}
