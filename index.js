const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;
const fetch = require("node-fetch");
const app = express();
const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://phuonglaitinen:@Kingkong4296@phuong-nodejs-learning-fw7ui.mongodb.net/test?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const db = mongoose.connection;

db.on("error", function (err) {
  console.log(
    "An error has occured while establishing connection with DB:" + err
  );
});

db.on("open", function () {
  console.log("database connection established");
});

const Schema = mongoose.Schema;

const gifSchema = new Schema({
  keyword: String,
  isSticker: Boolean,
  orig: String,
  orig_mp4: String,
  loop: String,
});

const Gif = mongoose.model("Gif", gifSchema);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => res.sendFile(__dirname + "/views/search.html"));

app.post("/api/v1/gifs/:searchTerm", async (req, res) => {
  const searchTerm = req.params.searchTerm;
  // if (!searchTerm) {
  //   res.send("No result found from database");
  //   return;
  // }

  // var regex = new RegExp(searchTerm, "i"),
  //   query = { keyword: regex };

  // Gif.find(query, function (err, resp) {
  //   res.send(resp);
  // });
  const gifs = await getItems(
    `http://api.giphy.com/v1/gifs/search?api_key=0BGp4gNxACI48cwxh9MtqIoEo8sMF3pQ&q=${searchTerm}&limit=10`
  );
  const stickers = await getItems(
    `http://api.giphy.com/v1/stickers/search?api_key=0BGp4gNxACI48cwxh9MtqIoEo8sMF3pQ&q=${searchTerm}&limit=10`
  );
  const allItems = gifs.data.concat(stickers.data);

  for (const item of allItems) {
    const newItem = new Gif();

    newItem.orig = item.images.fixed_height_downsampled.url;
    newItem
      .save()
      .then(function () {
        console.log("Saved new record to DB");
      })
      .catch(function (err) {
        console.log("Error with DB saving:" + err);
      });
  }
  res.send(allItems);
});

const getItems = async (apiUrl) => {
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
};
