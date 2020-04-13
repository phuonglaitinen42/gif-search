const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;
const fetch = require("node-fetch");

const app = express();
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => res.sendFile(__dirname + "/views/search.html"));
app.post("/api/v1/gifs/:searchTerm", async (req, res) => {
  const searchTerm = req.params.searchTerm;
  const gifs = await getItems(
    `http://api.giphy.com/v1/gifs/search?api_key=0BGp4gNxACI48cwxh9MtqIoEo8sMF3pQ&q=${searchTerm}&limit=10`
  );
  const stickers = await getItems(
    `http://api.giphy.com/v1/stickers/search?api_key=0BGp4gNxACI48cwxh9MtqIoEo8sMF3pQ&q=${searchTerm}&limit=10`
  );
  const allItems = gifs.data.concat(stickers.data);
  res.send(allItems);
});

const getItems = async (apiUrl) => {
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
};
