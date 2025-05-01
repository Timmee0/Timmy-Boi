d3.csv("data/sentimentdataset_iso3.csv").then(function(data) {
    // 1. Extract words from the Text column
    let allText = data.map(d => d.Text || "").join(" ").toLowerCase();
  
    // 2. Tokenize and remove common stopwords
    let stopwords = new Set(["the", "is", "and", "to", "in", "a", "of", "that", "for", "on", "with", "as", "are", "this", "it", "was", "but", "be"]);
    let words = allText
      .replace(/[^a-zA-Z\s]/g, "") // remove punctuation
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopwords.has(w));
  
    // 3. Count frequency
    let frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
  
    let wordData = Object.entries(frequency)
      .map(([text, size]) => ({ text, size }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 100); // take top 100 words
  
    // 4. Set up word cloud layout
    var layout = d3.layout.cloud()
      .size([700, 400])
      .words(wordData.map(d => ({ text: d.text, size: 10 + d.size * 2 })))
      .padding(5)
      .rotate(() => ~~(Math.random() * 2) * 90)
      .fontSize(d => d.size)
      .on("end", draw);
  
    layout.start();
  
    // 5. Draw word cloud
    function draw(words) {
      d3.select("#chart3").append("svg")
        .attr("width", 700)
        .attr("height", 400)
        .append("g")
        .attr("transform", "translate(350,200)")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", d => d.size + "px")
        .style("fill", () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text(d => d.text);
    }
  });
  