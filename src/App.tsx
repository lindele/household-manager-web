import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Auth } from "./auth";

import { Home } from "./Home";

const AUTH0_DOMAIN = "dev-nqu3toh2m3wrqona.us.auth0.com";
const AUTH0_CLIENT_ID = "oIg1dxrzwnjOAFkzz7JFVVpRrpRxWokA";

export function App() {
  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: "http://localhost:1234/home",
      }}
      useRefreshTokens
      cacheLocation="localstorage"
    >
      <div className="App">
        <h1>Hello, World!</h1>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={<Auth />} />
            <Route path="home" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Auth0Provider>
  );
}
