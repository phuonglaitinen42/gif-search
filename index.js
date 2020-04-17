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
  giphy_id: String,
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
  //filter search query
  if (!searchTerm) {
    res.send("Problem with search query");
    return;
  }

  const regex = new RegExp(req.params.searchTerm, "i"),
    query = { keyword: regex };

  // Check if there is duplication
  Gif.find(query, async function (err, resp) {
    const alreadyInDB = [];
    if (err) {
      console.error(err);
      res.status(501).end();
    }

    if (resp.length > 4) {
      console.log("Found some results from DB. Displaying ...");
      resp.forEach(function (item) {
        alreadyInDB.push(item);
      });
      res.send(alreadyInDB);
      return;
    } else {
      // If not enough matching results from DB then fetch from giphy api.
      const gifs = await getItems(
        `http://api.giphy.com/v1/gifs/search?api_key=0BGp4gNxACI48cwxh9MtqIoEo8sMF3pQ&q=${searchTerm}&limit=10`
      );
      const stickers = await getItems(
        `http://api.giphy.com/v1/stickers/search?api_key=0BGp4gNxACI48cwxh9MtqIoEo8sMF3pQ&q=${searchTerm}&limit=10`
      );
      const allItems = gifs.data.concat(stickers.data);

      for (const item of allItems) {
        item.orig = item.images.fixed_height_downsampled.url;
        Gif.findOne({ giphy_id: item.id }, function (err, record) {
          if (err) {
            console.log("An error has occurred:" + err);
            return;
          }
          if (record) {
            console.log("Duplicated record found. Abort saving");
            return;
          } else {
            const newItem = new Gif();
            newItem.giphy_id = item.id;
            newItem.orig = item.images.fixed_height_downsampled.url;
            newItem.keyword = item.title;
            newItem.isSticker = item.isSticker;
            newItem.orig_mp4 = item.images.original_mp4.mp4;
            newItem
              .save()
              .then(function () {
                console.log("Saved new record to DB");
              })
              .catch(function (err) {
                console.log("Error with DB saving:" + err);
              });
          }
        });
      }
      res.send(allItems);
    }
  });
});

const getItems = async (apiUrl) => {
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
};
