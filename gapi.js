let tokenClient, access_token;

function gapiStart() {
  gapi.client.init({}).then(function () {
    if (access_token) {
      gapi.auth.setToken({ access_token: access_token });
    }
    // gapi.client.load("analytics", "v4");
  });
  // .then(
  //   function (response) {
  //     console.log("discovery document loaded");
  //   },
  //   function (reason) {
  //     console.log("Error: " + reason.result.error.message);
  //   }
  // );
}

function gapiLoad() {
  gapi.load("client", gapiStart);
}

function gisInit() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: "608858293726-kd126iiefgor24ikhvepdesecuo0udj6",
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    callback: (tokenResponse) => {
      access_token = tokenResponse.access_token;
      window.localStorage.setItem("gtoken", tokenResponse.access_token);
    },
  });
}

function getToken() {
  tokenClient.requestAccessToken();
}

// function revokeToken() {
//   google.accounts.oauth2.revoke(access_token, () => {
//     console.log("access token revoked");
//   });
// }

if (window.localStorage.getItem("gtoken")) {
  access_token = window.localStorage.getItem("gtoken");
}
