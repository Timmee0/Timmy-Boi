d3.select("#chart1")
  .insert("div", ":first-child")
  .attr("class", "map-description")
  .style("margin-bottom", "12px")
  .style("font-size", "1.15em")
  .html("<h2>Bar chart</h2> This bar chart shows the number of posts by sentiment category. Most posts are either neutral or positive, while negative posts are significantly fewer.");




d3.csv("sentimentdataset_cleaned.csv").then(function(data) {
    // Count posts per cleaned sentiment
    var sentiments = d3.nest()
      .key(function(d) { return d.Sentiment_Clean; })
      .rollup(function(v) { return v.length; })
      .entries(data);
  
    // Order: Negative, Neutral, Positive
    var order = ["Negative", "Neutral", "Positive"];
    sentiments.sort(function(a, b) {
      return order.indexOf(a.key) - order.indexOf(b.key);
    });
  
    var margin = {top: 30, right: 30, bottom: 60, left: 60},
        width = 500 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;
  
    var svg = d3.select("#chart1").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    // X axis: Sentiment categories
    var x = d3.scaleBand()
      .domain(sentiments.map(function(d) { return d.key; }))
      .range([0, width])
      .padding(0.3);
  
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text").attr("font-size", "16px");
  
    // Y axis: Count
    var y = d3.scaleLinear()
      .domain([0, d3.max(sentiments, function(d) { return d.value; })])
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));
  
    // Bars
    svg.selectAll("rect")
      .data(sentiments)
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", "#2e86ab");
  
    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .text("Sentiment");
  
    // Y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("font-size", "18px")
        .text("Number of Posts");
  });
  