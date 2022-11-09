//created using example 8.7 as reference
function simulate(data, svg) {
    let width = parseInt(svg.attr('viewBox').split(' ')[2])
    let height = parseInt(svg.attr('viewBox').split(' ')[3])
    let main_group = svg.append('g')
        .attr('transform', 'translate(0, 50)')

    //calculate degree of the nodes:
    let node_degree = {} //initiate an object
    d3.map(data.links, function (d) {
        if (node_degree.hasOwnProperty(d.source)) {
            node_degree[d.source]++
        } else {
            node_degree[d.source] = 0
        }
        if (node_degree.hasOwnProperty(d.target)) {
            node_degree[d.target]++
        } else {
            node_degree[d.target] = 0
        }
    })
    //scale object based on the sqrt of citations as stated in instructions
    // The number of citations for each publication is considered as the size of the node (choose a suitable min-max for the domain, and apply scaleSqrt)

    let scale_radius = d3.scaleSqrt()
        .domain(d3.extent(data.nodes, d=> {
            //console.log(d.Citations)
            return d.Citations
        }))
        //.domain(d3.extent(Object.values(node_degree)))
        .range([5, 30])

    let color = d3.scaleSequential().domain([1995, 2020]).interpolator(d3.interpolateBuGn)
    let link_elements = main_group.append('g') //create the link elements
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll('.line')
        .data(data.links)
        .enter()
        .append('line')
        .style('stroke-width',(d) => 3 )//changed from scaling since it looks bad
        .attr('stroke', 'black')
    let node_elements = main_group.append('g') //create the node elements
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll('.circle')
        .data(data.nodes)
        .enter()
        .append('circle')
        .attr('r', (d, i) => {
            return scale_radius(node_degree[d.id])
        })
        .attr('fill', (d, i) => color(d.Year))
        .on("mouseenter",function (d,data){
            //mouse leave enter functionality does not want to work lol
            console.log(data.Year)
            console.log(data.Group.toString())
            node_elements.classed("inactive",true)
            d3.selectAll(data.Group.toString()).classed("inactive",false)
        })
        .on("mouseleave", (d,data)=>{
            d3.selectAll(".inactive").classed("inactive",false)
        })

    // force simulation function used in example 8.7
    //with citations take for node degree
    let ForceSimulation = d3
        .forceSimulation(data.nodes)
        .force('collide', d3.forceCollide().radius((d, i) => scale_radius(node_degree[d.Citations]) * 4))
        .force('x', d3.forceX())
        .force('y', d3.forceY())
        .force('charge', d3.forceManyBody())
        .force(
            'link',
            d3.forceLink(data.links).id((d) => d.id)
            //.distance(d=> d.value)
            //.strength(d=> d.value*.1)
        )
        .on('tick', ticked);

    function ticked() {
        node_elements.attr('cx', (d) => d.x).attr('cy', (d) => d.y)

        link_elements
            .attr('x1', (d) => d.source.x)
            .attr('x2', (d) => d.target.x)
            .attr('y1', (d) => d.source.y)
            .attr('y2', (d) => d.target.y)
    }

    svg.call(d3.zoom()
            .extent([[0, 0],[width, height],])
            .scaleExtent([1, 8])
            .on('zoom', zoomed))
    function zoomed({ transform }) {
        main_group.attr('transform', transform)
    }
}
