const express = require("express");
const path = require("path");

const app = express();

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

app.use(express.static(path.join(__dirname, "public"), { index: "index.html" }));

app.listen(process.env.PORT || 3000, () => {
  console.log("ICT website running");
});
