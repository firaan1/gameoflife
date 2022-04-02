// functions
function getindex(e, a) {
  e = e + 1;
  
  if(e > a**2 || e < 1) {
    return false;
  }

  tmpe = [e];
  if(e%a == 1) {
    tmpe.push(e+1);
  } else if(e%a == 0) {
    tmpe.push(e-1);
  } else {
    tmpe.push(e-1);
    tmpe.push(e+1);
  }

  tmpf = [-a, 0, a];

  tmpe = tmpe.flatMap(e1 => tmpf.map(f1 => e1 + f1)).filter(e1 => e1 > 0 && e1 <= a**2 && e1 != e).map(e2 => e2 - 1);
  return(tmpe)

}

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


function start_gol() {

    // get values
    gol_row = Number(document.querySelector("#gol_row").value);
    gol_iter = Number(document.querySelector("#gol_iter").value);
    gol_seed = document.querySelector("#gol_seed").value;

    if(gol_seed == "") {
      gol_seed = Math.floor(Math.random() * (100000 - 1 + 1) + 1);
    } else {
      gol_seed = Number(gol_seed);
    }

    var myrng = new Math.seedrandom(gol_seed);
    document.querySelector("#gol_seed_current").innerHTML = gol_seed;

    
    gol_values1 = [];

    document.querySelector("#plotdiv").innerHTML = '';
    
    
    Array.from(Array(gol_row**2).keys()).forEach((val, i) => {
      gol_values1.push(Math.floor(myrng() * 2))
    })
    
    const myrows = Array.from(Array(gol_row).keys()).map(String);
    const mycols = Array.from(Array(gol_row).keys()).map(String);
    
    const myrowindices = [].concat.apply([], Array(gol_row).fill(myrows));
    const mycolindices = [].concat.apply([], mycols.map(i => Array(gol_row).fill(i)));
    
    data = [myrowindices, mycolindices, gol_values1]
    
    const margin = {top: 30, right: 30, left: 30, bottom: 30}, 
      width = 500 - margin.left - margin.right, 
      height = 500 - margin.top - margin.bottom;
    
    svg = d3.select("#plotdiv")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // xy scale
    const y = d3
      .scaleBand()
      .domain(mycolindices)
      .range([0, width])
      .padding(0.05);
    
    const x = d3
      .scaleBand()
      .domain(myrowindices)
      .range([0, height])
      .padding(0.05);
    
    // color scale
    let colorScale = d3.scaleSequential()
        .interpolator(d3.interpolatePuBu)
        .domain([0, 1]);
    
    rects = svg
      .selectAll()
      .data(gol_values1)
      .enter()
      .append("rect")
      .attr("x", (v1,i) => x(mycolindices[i]))
      .attr("y", (v1,i) => y(myrowindices[i]))
      .attr("height", x.bandwidth())
      .attr("width", y.bandwidth())
      .style("fill", (v1,i) => colorScale(v1));

    texts = svg
      .append("text")
      .attr("x", x(mycolindices[0]))
      .attr("y", y(myrowindices[0]))
      .text(0)
    
    
    for(iter = 0; iter < gol_iter; iter++){
    
      gol_values2 = gol_values1.map((v1, i) => {
        vn = getindex(i, gol_row).map(j => gol_values1[j]).reduce((x, y) => x + y, 0);
        return(getstatus(v1, vn))
      });
    
      gol_values1 = gol_values2;

      texts
        .transition()
        .duration(250)
        .delay(iter * 250)
        .text(iter+1);

      rects
      .data(gol_values2)
      .transition()
      .duration(250)
      .delay(iter * 250)
      .style("fill", (v2, i) => colorScale(v2));

    }
}

