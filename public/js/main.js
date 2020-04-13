const fetchGif = async (e) => {
  e.preventDefault();
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";
  const searchTerm = document.getElementById("searchTerm").value;
  const response = await fetch(`/api/v1/gifs/${searchTerm}`, {
    method: "POST",
  });

  const data = await response.json();
  const gifList = [data];

  for (gif of gifList[0]) {
    const gifUrl = gif.images.fixed_height_downsampled.url;
    const img = document.createElement("IMG");
    img.src = gifUrl;
    resultDiv.appendChild(img);
  }
};
