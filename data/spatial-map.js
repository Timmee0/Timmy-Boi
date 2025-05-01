d3.select("#chart2")
  .insert("div", ":first-child")
  .attr("class", "map-description")
  .style("margin-bottom", "12px")
  .style("font-size", "1.15em")
  .html("<h2>World Map of Social Media Posts</h2> Each circle shows the number of social media posts from each country.");


// Set up SVG
var width = 900, height = 500;
var svg = d3.select("#chart2")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Projection and path
var projection = d3.geoNaturalEarth1()
  .scale(160)
  .translate([width / 2, height / 2]);
var path = d3.geoPath().projection(projection);

// Load data
d3.json("world-110m.geojson").then(function(geoData) {
  d3.csv("sentimentdataset_iso3.csv").then(function(posts) {

    // 1. Count total posts per country code
    var postCounts = d3.nest()
      .key(function(d) { return d.Country_Code; })
      .rollup(function(v) { return v.length; })
      .object(posts);

    // 2. Count sentiment breakdown per country using Sentiment_Clean
    var sentimentCounts = {};
    posts.forEach(function(d) {
      var code = d.Country_Code;
      var sentiment = d.Sentiment_Clean.trim();
      if (!sentimentCounts[code]) {
        sentimentCounts[code] = {Positive: 0, Neutral: 0, Negative: 0};
      }
      if (sentimentCounts[code][sentiment] !== undefined) {
        sentimentCounts[code][sentiment]++;
      }
    });

    // 3. Attach post count and sentiment counts to each GeoJSON feature
    geoData.features.forEach(function(f) {
      var code = f.properties["ISO3166-1-Alpha-3"];
      f.properties.postCount = postCounts[code] || 0;
      f.properties.sentiment = sentimentCounts[code] || {Positive: 0, Neutral: 0, Negative: 0};
    });

    // 4. Draw the world map
    svg.append("g")
      .selectAll("path")
      .data(geoData.features)
      .enter().append("path")
        .attr("d", path)
        .attr("fill", "#f4f4f4")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 0.6);

    // 5. Draw circles for countries with posts
    var countriesWithPosts = geoData.features.filter(function(f) {
      return f.properties.postCount > 0;
    }).map(function(f) {
      return {
        name: f.properties.name,
        code: f.properties["ISO3166-1-Alpha-3"],
        postCount: f.properties.postCount,
        sentiment: f.properties.sentiment,
        centroid: path.centroid(f)
      };
    });

    // 6. Scale for circle size
    var size = d3.scaleSqrt()
      .domain([1, d3.max(countriesWithPosts, d => d.postCount)])
      .range([4, 28]);

    // 7. Tooltip
    var tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("padding", "8px 14px")
      .style("background", "#334")
      .style("color", "#fff")
      .style("border-radius", "7px")
      .style("pointer-events", "none")
      .style("font-size", "14px")
      .style("display", "none");

    // 8. Draw circles
    svg.append("g")
      .selectAll("circle")
      .data(countriesWithPosts)
      .enter()
      .append("circle")
        .attr("cx", d => d.centroid[0])
        .attr("cy", d => d.centroid[1])
        .attr("r", d => size(d.postCount))
        .attr("fill", "rgba(46,134,171,0.7)")
        .attr("stroke", "#225")
        .attr("stroke-width", 1.2)
        .on("mouseover", function(d) {
          d3.select(this).attr("fill", "#ffd600");
          tooltip.style("display", "block")
            .html(
              `<b>${d.name}</b><br>
              <b>Total Posts:</b> ${d.postCount}<br>
              <b>Positive:</b> ${d.sentiment.Positive}<br>
              <b>Neutral:</b> ${d.sentiment.Neutral}<br>
              <b>Negative:</b> ${d.sentiment.Negative}`
            );
        })
        .on("mousemove", function(d) {
          tooltip.style("left", (d3.event.pageX + 15) + "px")
                 .style("top", (d3.event.pageY - 20) + "px");
        })
        .on("mouseout", function(d) {
          d3.select(this).attr("fill", "rgba(46,134,171,0.7)");
          tooltip.style("display", "none");
        });

    // 9. Size legend (bottom right)
    var legendValues = [
      d3.min(countriesWithPosts, d => d.postCount),
      Math.round(d3.max(countriesWithPosts, d => d.postCount) * 0.25),
      Math.round(d3.max(countriesWithPosts, d => d.postCount) * 0.5),
      Math.round(d3.max(countriesWithPosts, d => d.postCount) * 0.75),
      d3.max(countriesWithPosts, d => d.postCount)
    ];

    var legendX = width - 200;
    var legendY = height - 40;

    var legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendX},${legendY})`);

    legend.selectAll("circle")
      .data(legendValues)
      .enter()
      .append("circle")
        .attr("cx", (d, i) => i * 40)
        .attr("cy", 0)
        .attr("r", d => size(d))
        .attr("fill", "rgba(46,134,171,0.7)")
        .attr("stroke", "#225")
        .attr("stroke-width", 1.2);

    legend.append("text")
      .attr("x", 0)
      .attr("y", -25)
      .style("fill", "black")
      .style("font-weight", "bold")
      .style("font-size", "16px")
      .text("Size Legend");

    legend.append("text")
      .attr("x", 0)
      .attr("y", 38)
      .style("fill", "black")
      .style("font-size", "15px")
      .style("font-weight", "bold")
      .text("Less Posts");

    legend.append("text")
      .attr("x", legendValues.length * 40 - 10)
      .attr("y", 38)
      .attr("text-anchor", "end")
      .style("fill", "black")
      .style("font-size", "15px")
      .style("font-weight", "bold")
      .text("More Posts");
  });
});
