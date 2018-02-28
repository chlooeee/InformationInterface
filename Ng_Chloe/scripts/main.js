//REFERENCES: http://leafletjs.com/examples/choropleth/
//          : https://bl.ocks.org/mbostock/4339083
//          : https://bl.ocks.org/syntagmatic/05a5b0897a48890133beb59c815bd953
  //to create a tool tip 
  var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

var mymap = L.map('mapid').setView([50,5], 2.5);
//adding the map layer for leaflet
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.emerald',
        accessToken: 'pk.eyJ1Ijoid2hhbGVpdHNjaGxvZSIsImEiOiJjamRtbXcycmwwbXV0MndsN3o3M3V6OXA2In0.5hZIHYVG-mMQdS9UyZ0nZg'
}).addTo(mymap);

//adding hover information box
var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function (props) {
        this._div.innerHTML = '<h4>Number of StackOverFlow User</h4>' +  (props ?
            '<b>' + props.name + '</b><br />' + props.user + ' user'
            : 'Total number of surveyed user: 51392');
};
info.addTo(mymap);

//split population into color schemes
function getColor(d) {
    return d > 5000  ? '#005a32':
           d > 2000  ? '#238443':         
           d > 1000  ? '#41ab5d':        
           d > 500   ? '#78c679':
           d > 100   ? '#addd8e':  
           d > 50    ? '#d9f0a3':       
           d > 10    ? '#f7fcb9':
           d > 0     ? '#ffffe5':
                        '#F5F5F5';       
}
//style the population
function style(feature) {
    return {
        fillColor: getColor(feature.properties.user),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 7
    };
}

L.geoJson(borderData, {style: style}).addTo(mymap);


//what happens when you hover
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        color: 'black',
        dashArray: '',
        fillOpacity: 7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

var geojson;
//highlighting hover function
function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    mymap.fitBounds(e.target.getBounds());

}

function onEachFeature(feature, layer) {
layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
    });
layer.on('click',function(e){

    clicked = feature.properties.name;
    console.log(clicked)
})

}


geojson = L.geoJson(borderData, {
            style: style,
            onEachFeature: onEachFeature
}).addTo(mymap);

//make the legend for maps    
var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 50, 100, 500, 1000, 2000, 5000],
        labels = [],
        from, to;
    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' + getColor(from + 1) + '"></i> ' +
            from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};
legend.addTo(mymap);



////////// parallel coordinates/////////////////////
var marginPcord = {top: 66, right: 110, bottom: 20, left: 110},
    widthPcord = 1200 - marginPcord.left - marginPcord.right,
    heightPcord = 500 - marginPcord.top - marginPcord.bottom,
    innerHeight = heightPcord - 2;


var color = d3.scaleOrdinal()
  .range(["#5DA5B3","#D58323","#DD6CA7","#54AF52","#8C92E8","#E15E5A","#725D82","#776327","#50AB84","#954D56","#AB9C27","#517C3F","#9D5130","#357468","#5E9ACF","#C47DCB","#7D9E33","#DB7F85","#BA89AD","#4C6C86","#B59248","#D8597D","#944F7E","#D67D4B","#8F86C2"]);

var types = {
  "Number": {
    key: "Number",
    coerce: function(d) { return +d; },
    extent: d3.extent,
    within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
    defaultScale: d3.scaleLinear().range([innerHeight, 0])
  },
  "String": {
    key: "String",
    coerce: String,
    extent: function (data) { return data.sort(); },
    within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
    defaultScale: d3.scalePoint().range([0, innerHeight])
  },
  "Date": {
    key: "Date",
    coerce: function(d) { return new Date(d); },
    extent: d3.extent,
    within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
    defaultScale: d3.scaleTime().range([0, innerHeight])
  }
};

//each axises

var dimensions = [
  {
    key: "Country",
    description: "Country",
    type: types["String"],
    axis: d3.axisLeft()
      .tickFormat(function(d,i) {
        return d;
      })
  },
  {
    key: "Assembly",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "C",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "Csharp",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "Cplusplus",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "CoffeeScript",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "Common_Lisp",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "Elixir",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "Haskell",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "Hack",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "Java",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "JavaScript",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "MatLab",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "NA",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "ObjectiveC",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "PHP",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "Perl",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "Python",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "R",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "Rust",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "SQL",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "Swift",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "TypeScript",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "VBNET",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "VisualBasic6",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight, 0])
  },
  {
    key: "VBA",
    type: types["Number"],
    scale: d3.scaleSqrt().range([innerHeight,0])
  },
];

var xscale = d3.scalePoint()
    .domain(d3.range(dimensions.length))
    .range([0, widthPcord]);

var yAxis = d3.axisLeft();

var container = d3.select("#parcoords").append("parcoords")
    .attr("class", "parcoords")
    .style("width", widthPcord + marginPcord.left + marginPcord.right + "px")
    .style("height", heightPcord + marginPcord.top + marginPcord.bottom + "px");

var svg = container.append("svg")
    .attr("width", widthPcord + marginPcord.left + marginPcord.right)
    .attr("height", heightPcord + marginPcord.top + marginPcord.bottom)
  .append("g")
    .attr("transform", "translate(" + marginPcord.left + "," + marginPcord.top + ")");

var canvas = container.append("canvas")
    .attr("width", widthPcord * devicePixelRatio)
    .attr("height", heightPcord * devicePixelRatio)
    .style("width", widthPcord + "px")
    .style("height", heightPcord + "px")
    .style("margin-top", marginPcord.top + "px")
    .style("margin-left", marginPcord.left + "px");

var ctx = canvas.node().getContext("2d");
ctx.globalCompositeOperation = 'darken';
ctx.globalAlpha = 0.15;
ctx.lineWidth = 1.5;
ctx.scale(devicePixelRatio, devicePixelRatio);

var output = d3.select("body").append("pre");

var axes = svg.selectAll(".axis")
    .data(dimensions)
  .enter().append("g")
    .attr("class", function(d) { return "axis " + d.key.replace(/ /g, "_"); })
    .attr("transform", function(d,i) { return "translate(" + xscale(i) + ")"; });

d3.csv("radarchart.csv", function(error, data) {

  if (error) throw error;

  data.forEach(function(d) {
    dimensions.forEach(function(p) {
      d[p.key] = !d[p.key] ? null : p.type.coerce(d[p.key]);
    });
  });

  // type/dimension default setting happens here
  dimensions.forEach(function(dim) {
    if (!("domain" in dim)) {
      // detect domain using dimension type's extent function
      dim.domain = d3_functor(dim.type.extent)(data.map(function(d) { return d[dim.key]; }));
    }
    if (!("scale" in dim)) {
      // use type's default scale for dimension
      dim.scale = dim.type.defaultScale.copy();
    }
    dim.scale.domain(dim.domain);
  });

  var render = renderQueue(draw).rate(10);
  ctx.globalAlpha = d3.min([0.85/Math.pow(data.length,0.3),1]);
  render(data);
  axes.append("g")
      .each(function(d) {
        var renderAxis = "axis" in d
          ? d.axis.scale(d.scale)  // custom axis
          : yAxis.scale(d.scale);  // default axis
        d3.select(this).call(renderAxis);
      })
    .append("text")
      .attr("class", "title")
      .attr("text-anchor", "start")
      .text(function(d) { return "description" in d ? d.description : d.key; });
  // Add and store a brush for each axis.
  axes.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(d.brush = d3.brushY()
          .extent([[-10,0], [10,heightPcord]])
          .on("start", brushstart)
          .on("brush", brush)
          .on("end", brush)
        )
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
  d3.selectAll(".axis.country .tick text")
    .style("fill", color);
  function project(d) {
    return dimensions.map(function(p,i) {
      // check if data element has property and contains a value
      if (
        !(p.key in d) ||
        d[p.key] === null
      ) return null;
      return [xscale(i),p.scale(d[p.key])];
    });
  };
  function draw(d) {
    ctx.strokeStyle = color(d.country);
    ctx.beginPath();
    var coords = project(d);
    coords.forEach(function(p,i) {
      // this tricky bit avoids rendering null values as 0
      if (p === null) {
        // this bit renders horizontal lines on the previous/next
        // dimensions, so that sandwiched null values are visible
        if (i > 0) {
          var prev = coords[i-1];
          if (prev !== null) {
            ctx.moveTo(prev[0],prev[1]);
            ctx.lineTo(prev[0]+6,prev[1]);
          }
        }
        if (i < coords.length-1) {
          var next = coords[i+1];
          if (next !== null) {
            ctx.moveTo(next[0]-6,next[1]);
          }
        }
        return;
      }
      
      if (i == 0) {
        ctx.moveTo(p[0],p[1]);
        return;
      }

      ctx.lineTo(p[0],p[1]);
    });
    ctx.stroke();
  }
  function brushstart() {
    d3.event.sourceEvent.stopPropagation();
  }
  // Handles a brush event, toggling the display of foreground lines.
  function brush() {
    render.invalidate();

    var actives = [];
    svg.selectAll(".axis .brush")
      .filter(function(d) {
        return d3.brushSelection(this);
      })
      .each(function(d) {
        actives.push({
          dimension: d,
          extent: d3.brushSelection(this)
        });
      });
    var selected = data.filter(function(d) {
      if (actives.every(function(active) {
          var dim = active.dimension;
          // test if point is within extents for each active brush
          return dim.type.within(d[dim.key], active.extent, dim);
        })) {
        return true;
      }
    });
    ctx.clearRect(0,0,widthPcord,heightPcord);
    ctx.globalAlpha = d3.min([0.85/Math.pow(selected.length,0.3),1]);
    render(selected);
    output.text(d3.tsvFormat(selected.slice(0,240)));
  }
});

function d3_functor(v) {
  return typeof v === "function" ? v : function() { return v; };
};

// set the dimensions and margins of the diagram
var marginTree = {top: 20, right: 90, bottom: 30, left: 90},
    widthTree = 960 - marginTree.left - marginTree.right,
    heightTree = 2100 - marginTree.top - marginTree.bottom;

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#tree").append("svg")
    .attr("width", widthTree + marginTree.right + marginTree.left)
    .attr("height", heightTree + marginTree.top + marginTree.bottom)
  .append("g")
    .attr("transform", "translate("
          + marginTree.left + "," + marginTree.top + ")");

// load the external data
d3.json("data.json", function(error, treeData) {
  if (error) throw error;

var i = 0,
    duration = 750,
    root;
    // declares a tree layout and assigns the size
var treemap = d3.tree().size([heightTree, widthTree]);

// Assigns parent, children, height, depth
root = d3.hierarchy(treeData, function(d) { return d.children; });
root.x0 = heightTree / 2;
root.y0 = 0;

// Collapse after the second level
root.children.forEach(collapse);

update(root);

// Collapse the node and all it's children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function update(source) {

  // Assigns the x and y position for the nodes
  var treeData = treemap(root);

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach(function(d){ d.y = d.depth * 180});

  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = svg.selectAll('g.node')
      .data(nodes, function(d) {return d.id || (d.id = ++i); })
      .on("mouseover", function(d) {
       div.transition()
         .duration(200)
         .style("opacity", .9);
       div.html(d.data.value + " user" )
         .style("left", (d3.event.pageX) + "px")
         .style("top", (d3.event.pageY - 20) + "px");
       })
     .on("mouseout", function(d) {
       div.transition()
         .duration(200)
         .style("opacity", 0);
       });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on('click', click);

  // Add Circle for the nodes
  nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-2)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      });

  // Add labels for the nodes
  nodeEnter.append('text')
      .attr("dy", ".35em")
      .attr("x", function(d) {
          return d.children || d._children ? -13 : 13;
      })
      .attr("text-anchor", function(d) {
          return d.children || d._children ? "end" : "start";
      })
      .text(function(d) { return d.data.name; })

  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) { 
        return "translate(" + d.y + "," + d.x + ")";
     });

  // Update the node attributes and style
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
    })
    .attr('cursor', 'pointer');


  // Remove any exiting nodes
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select('circle')
    .attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
    .style('fill-opacity', 1e-6);

  // ****************** links section ***************************

  // Update the links...
  var link = svg.selectAll('path.link')
      .data(links, function(d) { return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', function(d){
        var o = {x: source.x0, y: source.y0}
        return diagonal(o, o)
      });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate.transition()
      .duration(duration)
      .attr('d', function(d){ return diagonal(d, d.parent) });

  // Remove any exiting links
  var linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', function(d) {
        var o = {x: source.x, y: source.y}
        return diagonal(o, o)
      })
      .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {

    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

    return path
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    update(d);
  }

}
  
});

