const azureFunctionHandler = require("azure-aws-serverless-express");
const express = require("express");
const app = express();
const axios = require("axios");
const qs = require("qs");

const createAccessToken = (clientId, clientSecret, code, state) => {
  return axios.post(
    `https://github.com/login/oauth/access_token`,
    qs.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      state,
    })
  );
};

app.get("/api/create-github-access-token", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const secret = process.env.GITHUB_CLIENT_SECRET;

  createAccessToken(clientId, secret, req.query.code, req.query.state).then(
    (tokenResp) => {
      console.log(tokenResp.data);
      const { access_token, error } = qs.parse(tokenResp.data);
      if (error) {
        res.status(400).json({ error });
      } else {
        // Return the amalgamated token
        res.status(200).json({ token: access_token });
      }
    }
  );
});

module.exports = azureFunctionHandler(app);
