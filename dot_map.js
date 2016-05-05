$(function() {
	queue()
		.defer(d3.json,poly)
		.await(dataDidLoad);
})

$("#topDifferences .hideTop").hide()
	var projection = d3.geo.mercator().scale(450000).center([-89.94,35.06])

function dataDidLoad(error,poly) {
//make 1 svg for everything
    var mapSvg = d3.select("#map").append("svg").attr("width",600).attr("height",800)
    //draw each layer
    drawPolygon(poly,mapSvg)
    findBoundingBox(poly)
    var boundingBox =findBoundingBox(poly)
    drawRandomDots(boundingBox,poly,3000)

}
function findBoundingBox(poly){
    var coordinates = poly["features"][0]["geometry"]["coordinates"][0]
    var maxLat = 0
    var minLat = 90
    var maxLng = -180
    var minLng = 0
    //cycle through coordinates
    for(var i in coordinates){
        var coordinate = coordinates[i]
        var lat = coordinate[1]
        var lng = coordinate[0]
        if(lat > maxLat){maxLat = lat}
        if(lat < minLat){minLat = lat}
        if(lng > maxLng){maxLng = lng}
        if(lng < minLng){minLng = lng}
    }
    //sort
    var lngs = [minLng, maxLng].sort()
    var lats = [minLat,maxLat].sort()
    //format
    boundingBox = {"min":[lngs[0],lats[0]],"max":[lngs[1],lats[1]]}
    return boundingBox
}
function drawPolygon(geoData,svg){
    //need to generalize projection into global var later
    //d3 geo path uses projections, it is similar to regular paths in line graphs
	var path = d3.geo.path().projection(projection);
    
    //push data, add path
	svg.selectAll(".buildings")
		.data(geoData.features)
        .enter()
        .append("path")
		.attr("class","buildings")
		.attr("d",path)
		.style("stroke","#aaa")
        .style("fill","none")
	    .style("opacity",.5)
}
function drawRandomDots(bounding_box,polygon,quantity){
    var colors = ["#A7D661","#8BB27E","#69DA3E","#4F8634","#64D986"]
    var g = d3.select("#map svg")
    for(var i = 0; i <quantity; i++){
		var bbmin = bounding_box["min"];
		var bbmax = bounding_box["max"];
		var pointInPoly = false;
		while (!pointInPoly) {
			var point = random_point_in_bb(bbmin, bbmax);
			if (point_in_poly(point, polygon)) {
				pointInPoly = true;
				point = projection(point);
				var c = g.append("circle")
					.attr("cx", point[0])
					.attr("cy", point[1])
					.attr("id", i)
					.attr("class", "students" + i)
					.attr("r", 2)
					.style("fill", colors[i%(colors.length-1)])
			}
		}
    }
}

//copied from Jennifer Jang's school code
function random_point_in_bb(min,max) {
    var x = Math.random()*(max[0]-min[0])+min[0];
    var y = Math.random()*(max[1]-min[1])+min[1];
	return [x,y];
}

//adapted from Jennifer Jang's school code
function point_in_poly(point,zone) {
	var x = point[0];
	var y = point[1];
	var inside = false;
	var geometry = zone["features"][0]["geometry"]["coordinates"];
	for (var i in geometry) {
		var poly = geometry[i]
		var n = poly.length;
		var p1 = poly[0];
		for (var i = 0; i < n; i++) {
			p2 = poly[i % n];
			if (y >= Math.min(p1[1],p2[1])) {
				if (y <= Math.max(p1[1],p2[1])) {
					if (x <= Math.max(p1[0],p2[0])) {
						if (p1[0] != p2[0]) {
							var xints = (y-p1[1])*(p2[0]-p1[0])/(p2[1]-p1[1])+p1[0];
						}
						if (p1[0] == p2[0] || x <= xints) {
							inside = !inside;
						}
					}
				}
			}
			p1[0] = p2[0];
			p1[1] = p2[1];
		}
		if (inside == true) return true;
	}
}
