// functions
function getindex(e, r, c) {
  e = e + 1;
  
  if(e > r * c || e < 1) {
    return false;
  }

  tmpe = [e];
  if(e%r == 1) {
    tmpe.push(e+1);
  } else if(e%r == 0) {
    tmpe.push(e-1);
  } else {
    tmpe.push(e-1);
    tmpe.push(e+1);
  }

  tmpf = [-r, 0, r];

  tmpe = tmpe.flatMap(e1 => tmpf.map(f1 => e1 + f1)).filter(e1 => e1 > 0 && e1 <= r * c && e1 != e).map(e2 => e2 - 1);
  return(tmpe)

}
function getindex2(e, r, c) {
  e = e + 1;
  
  if(e > r * c || e < 1) {
    return false;
  }

  tmpe = [e];
  if(e%c == 1) {
    tmpe.push(e+1);
  } else if(e%c == 0) {
    tmpe.push(e-1);
  } else {
    tmpe.push(e-1);
    tmpe.push(e+1);
  }

  tmpf = [-c, 0, c];

  tmpe = tmpe.flatMap(e1 => tmpf.map(f1 => e1 + f1)).filter(e1 => e1 > 0 && e1 <= r * c && e1 != e).map(e2 => e2 - 1);
  return(tmpe)

}

// determine if the cell lives or dies
function getstatus(v1, vn) {
  if(v1 == 1 && (vn < 2 || vn > 3)) {
    return 0;
  } else if(v1 == 1 && (vn == 2 || vn == 3)) {
    return 1;
  } else if(v1 == 0 && vn == 3) {
    return 1;
  } else {
    return 0;
  }
}



// variables
var gol_row = 75;
var gol_col = 75;
gol_seed = Math.floor(Math.random() * (100000 - 1 + 1) + 1);
gol_seed = 12;

var myrng = new Math.seedrandom(gol_seed);

var values1 = [];
Array.from(Array(gol_row * gol_col).keys()).forEach((val, i) => {
  values1.push(Math.floor(myrng() * 2))
})

// var values1 = Array(gol_row * gol_col).fill(0);
// Array(13).fill(1).map((t,i) => values1[i] = t);

var valuesn = Array(gol_row * gol_col).fill(0);

// derived
const myrows = Array.from(Array(gol_row).keys()).map(String);
const mycols = Array.from(Array(gol_col).keys()).map(String);
const myrowindices = [].concat.apply([], Array(gol_row).fill(mycols));
const mycolindices = [].concat.apply([], mycols.map(i => Array(gol_col).fill(i)));

// defining plot margins
const margin = {
    top: 30, bottom: 30, left: 30, right:30
  },
  width = 750 - margin.left - margin.right,
  height = 750 - margin.top - margin.bottom;

// define svg
svg = d3.select("#plotdiv")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// scales
const x = d3.scaleBand().domain(myrowindices).range([0, height]).padding(0.05);
const y = d3.scaleBand().domain(mycolindices).range([0, width]).padding(0.05);

// fill
// var colorScale = d3.scaleSequential().interpolator(d3.interpolatePuBu).domain([0,1]);
var colorScale = d3.scaleSequential().interpolator(d3.interpolateOrRd).domain([0,1]);

d3.select("svg").node().oncontextmenu = function(){
  return false;
}; // do nothing on right click 

var clickvar = false, ispaused = false;


// rect
rects = svg
  .selectAll()
  .data(values1)
  .enter()
  .append("rect")
  .attr("x", (v1,i) => x(myrowindices[i])) // careful here
  .attr("y", (v1,i) => y(mycolindices[i])) // careful here
  .attr("data-i", (v1,i) => i)
  .attr("height", x.bandwidth())
  .attr("width", y.bandwidth())
  .style("fill", (v1,i) => colorScale(v1))
  .on("mousedown", function(d){
    ispaused = true;
    switch (d.which) {
      case 1:
          clicki = 1;
          break;
      case 3:
          clicki = 0;
          break;
    }
    clickvar = true;
    var tmpindex = d.srcElement.dataset.i;
    // values1[tmpindex] = values1[tmpindex] == 0 ? 1 : 0;
    values1[tmpindex] = clicki;
    d3.select(d.srcElement).style("fill", colorScale(values1[tmpindex]));
  })
  .on("mouseup", function(d){
      clickvar = false;
      ispaused = false;
  })
  .on("mouseover", function(d){
      if(clickvar){
          var tmpindex = d.srcElement.dataset.i;
          // values1[tmpindex] = values1[tmpindex] == 0 ? 1 : 0;
          values1[tmpindex] = clicki;
          d3.select(d.srcElement).style("fill", colorScale(values1[tmpindex]));
      }
  });

var interval = null;

// iter
function iter_gol(single = true) {

  var iter = 0;

  if(single) {
      iter_gol_func(iter);
      console.log(iter);
  } else {
      interval = setInterval(function(){
          
          if(!ispaused) {
            iter_gol_func(iter);
            
            console.log(iter);
    
            iter++;
          }
  
      }, 250);
  }
}

function iter_gol_func(iter) {
  values2 = values1.map(
      (v1, i) => {
          vn = getindex2(i, gol_row, gol_col).map(j => values1[j]).reduce((x, y) => x + y, 0);
          return(getstatus(v1, vn))
      }
  );

  valuesn = values2.map((v2,i) => {
    return v2 != values1[i] ? (v2 == 1 ? 0.75 : 0.25) : v2;
  });

  // check empty
  if(values2.every(v2 => v2 === 0)) {
    $("#stopbtn").click();
  }
  // check equal
  // if(String(values2) === String(values1)) {
  //   $("#stopbtn").click();
  // }

  values1 = values2;

  rects
      .data(values2)
      .transition()
      // .duration(iter * 250)
      .duration(0)
      // .style("fill", (v2, i) => colorScale(v2));
      .style("fill", (v2, i) => {
        if($("#showchange").prop("checked")) {
          return colorScale(valuesn[i]);
        } else {
          return colorScale(v2);
        }
      });
}