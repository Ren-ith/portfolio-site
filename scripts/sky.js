const width = window.innerWidth;
const height = window.innerHeight;
const svg = d3.select("#sky")
  .attr("width", width)
  .attr("height", height);

let panRA = 0;
let panDec = 0;
const TRADITIONAL_CONNECTIONS = {
  Ori: [
    [57, 31], [51, 47], [47, 42], [51, 54], [42, 21], [57, 51], [31, 42],
  ],
  UMi: [
    [0,1], [1,2], [2,3], [3,4], [4,5], [5,6],
  ],
  UMa: [
    [3,4], [4,2], [2,0], [0,1], [1,5], [5,6],
  ],
  Cas: [
    [0,1], [1,2], [2,3], [3,4],
  ],
  Lyr: [
    [5,2], [2,1], [1,4], [4,5],
  ],
  Cyg: [
    [6,2], [2,0], [0,3], [0,4],
  ],
  Sco: [
    [0,1], [1,2], [2,3], [3,4], [4,5], [5,6],
  ],
  Tau: [
    [3,4], [4,5], [5,6], [6,7],
  ],
  Gem: [
    [0,1], [1,2], [2,3], [3,4], [4,5], [5,6],
  ],
  Leo: [
    [0,1], [1,2], [2,3], [3,4], [4,5], [5,6],
  ],
};

// Define projection
const projection = d3.geoStereographic()
  .scale(width / 4)
  .translate([width / 2, height / 2])
  .clipAngle(90)
  .precision(0.1)
  .rotate([panRA, -panDec]);

// Load constellation data
d3.json("../../libs/constellations.json").then(data => {
  draw(data);

  // Enable drag panning
  svg.call(d3.drag().on("drag", (event) => {
    panRA = (panRA - event.dx * 0.1 + 360) % 360;
    panDec = Math.max(-89, Math.min(89, panDec + event.dy * 0.1));
    projection.rotate([panRA, -panDec]);
    redraw(data);
  }));
});

function draw(data) {
  svg.selectAll("*").remove();

  data.forEach(constellation => {
    if (!constellation.stars) return;

    // Draw stars
    svg.selectAll(`.star-${constellation.name}`)
      .data(constellation.stars)
      .enter()
      .append("circle")
      .attr("cx", d => {
        let coords = projection([d.ra * 15, d.dec]); // RA hours to degrees
        return coords[0];
      })
      .attr("cy", d => {
        let coords = projection([d.ra * 15, d.dec]);
        return coords[1];
      })
      .attr("r", d => Math.max(0.5, 6 - d.mag))
      .attr("fill", "white");

    // Draw traditional connections if available
    const connections = TRADITIONAL_CONNECTIONS[constellation.name];
    if (connections) {
      connections.forEach(conn => {
        let s1 = constellation.stars[conn[0]];
        let s2 = constellation.stars[conn[1]];
        if (!s1 || !s2) return;

        let p1 = projection([s1.ra * 15, s1.dec]);
        let p2 = projection([s2.ra * 15, s2.dec]);

        svg.append("line")
          .attr("x1", p1[0])
          .attr("y1", p1[1])
          .attr("x2", p2[0])
          .attr("y2", p2[1])
          .attr("stroke", "white")
          .attr("stroke-width", 1);
      });
    }
  });
}

function redraw(data) {
  draw(data);
}
