const azureFunctionHandler = require("azure-aws-serverless-express");
const express = require("express");
const app = express();
const qs = require("qs");
const axios = require("axios");

const createAccessToken = function (clientSecret, code, redirectUri) {
  return axios.post(
    "https://app.vssps.visualstudio.com/oauth2/token",
    qs.stringify({
      client_assertion_type:
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: clientSecret,
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: code,
      redirect_uri: redirectUri,
    })
  );
};
app.get("/api/create-ado-access-token", (req, res) => {
  console.log("doing create-ado-access-token");

  const secret = process.env.ADO_CLIENT_SECRET;
  const redirectUri = process.env.ADO_CALLBACK_URL;

  createAccessToken(secret, req.query.code, redirectUri)
    .then(function (tokenResp) {
      var _a = tokenResp.data,
        access_token = _a.access_token,
        error = _a.error;
      if (error) {
        res.status(400).json({ error: error });
      } else {
        res.status(200).json({ token: access_token });
      }
    })
    .catch(function (err) {
      console.log(err);
      res.status(400).json({ error: "Could not get token" });
    });
});

module.exports = azureFunctionHandler(app);
