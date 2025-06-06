# How to Embed a Last9 Dashboard in Your Own App

This section provides a step-by-step guide to embedding a Last9 dashboard into
your own application, based on the provided sequence diagram and sample code.
You do **not** need to run or edit any files in this repository—just follow
these instructions and copy the relevant code snippets into your own frontend
and backend.

---

## 1. Backend: Secure Token Endpoint

You need a backend endpoint that your frontend can call to fetch a short-lived
dashboard access token. This keeps your Last9 API credentials secure.

**Example (Go, based on
[`embedded-dashboard-token-server/main.go`](embedded-dashboard-token-server/main.go)):**

```go
// Pseudocode for a secure token endpoint
http.HandleFunc("/embed-token", func(w http.ResponseWriter, r *http.Request) {
    // Parse dashboard_id, datasource_id, variables from request body
    // Use your org and Last9 API read refresh token (see README prerequisites)
    // Make a POST request to:
    //   https://app.last9.io/api/v4/oauth/organizations/{org}/dashboard/embed_token
    //   with Authorization: Bearer <refresh_token>
    //   and the dashboard_id, datasource_id, variables in the body
    // Return the response JSON to the frontend
})
```

- See
  [`embedded-dashboard-token-server/main.go`](embedded-dashboard-token-server/main.go)
  for a full implementation.
- Your endpoint should **never expose your refresh token to the browser**.

---

## 2. Frontend: Load the Dashboard and Fetch Token

### a. Load the Dashboard Library

Add the following `<script>` tag to your HTML (or load dynamically in React):

```html
<script src="https://cdn.last9.io/dashboard-assets/embedded/last9-embedded-dashboard.umd-v1.1.js"></script>
```

### b. Add a Container for the Dashboard

```html
<div id="embedded-dashboard-container" style="height: 100vh; width: 100%"></div>
```

### c. Fetch the Token from Your Backend

```js
async function getToken() {
  const response = await fetch("/embed-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dashboard_id: "<your-dashboard-id>",
      datasource_id: "<your-datasource-id>",
      variables: {
        /* your variables here */
      },
    }),
  });
  if (!response.ok) throw new Error("Failed to fetch token");
  return response.json();
}
```

- See
  [`embedded-dashboard-client/index.html`](embedded-dashboard-client/index.html)
  for a working example.

### d. Initialize the Dashboard

```js
EmbeddedDashboardApp.initialize({
  containerId: "embedded-dashboard-container",
  org: "<your-org>",
  getToken, // the function above
  onError: (err) => {
    console.error("Dashboard error", err);
  },
});
```

- See
  [`embedded-dashboard-client/index.html`](embedded-dashboard-client/index.html)
  and
  [`embedded-dashboard-client-react/src/EmbeddedDashboardApp.tsx`](embedded-dashboard-client-react/src/EmbeddedDashboardApp.tsx)
  for more details.

---

## 3. Token Refresh Flow

- The dashboard library will automatically call your `getToken` function to
  refresh the token every 30 minutes (see the
  [sequence diagram](sequence-diagram.png)).
- Your backend endpoint should always return a fresh, valid token.
- The dashboard will also periodically fetch new data using the current token.

---

## 4. Summary of Steps

1. **Implement a secure `/embed-token` endpoint** in your backend (see above).
2. **Add the dashboard library** to your frontend.
3. **Add a container div** for the dashboard.
4. **Write a `getToken` function** that calls your backend endpoint.
5. **Initialize the dashboard** with your org, container, and `getToken`
   function.
6. **Handle errors** via the `onError` callback.

---

For more details and full code samples, see:

- [`embedded-dashboard-token-server/main.go`](embedded-dashboard-token-server/main.go)
- [`embedded-dashboard-client/index.html`](embedded-dashboard-client/index.html)
- [`embedded-dashboard-client-react/src/EmbeddedDashboardApp.tsx`](embedded-dashboard-client-react/src/EmbeddedDashboardApp.tsx)
- [sequence-diagram.png](sequence-diagram.png)
