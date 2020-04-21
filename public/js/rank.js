const renderRank = (data) => {
  data.forEach(function (rankData) {
    const rankEl = document.createElement("li");
    rankEl.innerText = rankData.username + ":" + rankData.score;
    document.getElementById("rank").appendChild(rankEl);
  });
};

const apiUrl = "/api/rank";

fetch(apiUrl)
  .then(function (resp) {
    return resp.json();
  })
  .then(function (data) {
    console.log(data);
    renderRank(data);
  })
  .catch(function (err) {
    console.log("An error has occurred:" + err);
  });
