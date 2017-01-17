const queue = d3_queue.queue();

queue
  .defer(d3.csv, '../../drift-function-counts.csv')
  .await(render);

function render(error, data) {
  data.forEach(d => {
    d.size = +d.size;
    d.constructorCount = +d.constructorCount;
    d.declarationCount = +d.declarationCount;
    d.expressionCount = +d.expressionCount;
    d.groupingOrIIFECount = +d.groupingOrIIFECount;
    d.arrowCount = +d.arrowCount;
    d.totalCount = +d.totalCount;
  })

  data.sort((a, b) => b.totalCount - a.totalCount);

  const dataForStack = data.map(d => ({
    constructorCount: d.constructorCount,
    declarationCount: d.declarationCount,
    expressionCount: d.expressionCount,
    groupingOrIIFECount: d.groupingOrIIFECount,
    arrowCount: d.arrowCount
  }));

  const stackedData = d3.stack()
    .keys(Object.keys(dataForStack[0]))(dataForStack);

  const xMaxGrouped = d3.max(dataForStack, d => d3.max(Object.values(d)));
  const xMaxStacked = d3.max(data, d => d3.sum(Object.values(d)));
  const n = Object.keys(data[0]).length; // the number of series
  const yValuesDomain = d3.range(dataForStack.length); // the number of values per series
  const yLabelsDomain = data.map(d => d.file);


  console.log('stackedData', stackedData);
  console.log('xMaxGrouped', xMaxGrouped);
  console.log('xMaxStacked', xMaxStacked);
  console.log('n, the number of series', n);
  console.log('yValuesDomain', yValuesDomain);
  console.log('yLabelsDomain', yLabelsDomain);

  const svg = d3.select('svg');
  const margin = {top: -40, right: 10, bottom: 20, left: 350};
  const width = +svg.attr('width') - margin.left - margin.right;
  const height = +svg.attr('height') - margin.top - margin.bottom;
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, xMaxStacked])
    .range([0, width]);

  const yValuesScale = d3.scaleBand()
    .domain(yValuesDomain)
    .rangeRound([0, height])
    .padding(0.08);

  const yLabelsScale = d3.scaleBand()
    .domain(yLabelsDomain)
    .rangeRound([0, height])
    .padding(0.08);

  const color = d3.scaleOrdinal()
    .domain(d3.range(n))
    .range(d3.schemeCategory20c.slice(8, 12)); // greens

  const series = g.selectAll('.series')
    .data(stackedData)
    .enter().append('g')
      .attr('fill', (d, i) => color(i));

  const rectG = series.selectAll('.rectG')
    .data(d => d)
    .enter().append('g')
      .classed('rectG', true);

  const rect = rectG
    .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => yValuesScale(i))
      .attr('width', 0)
      .attr('height', yValuesScale.bandwidth);

  const text = rectG
    .append('text')
      .attr('x', (d, i) => x(data[i].totalCount))
      .attr('dx', '6px')
      .attr('y', (d, i) => yValuesScale(i))
      .attr('dy', '0.8em')
      .attr('fill', color(0))
      .attr('fill-opacity', 0.25)
      .text((d, i) => data[i].totalCount);

  rect.transition()
    .delay((d, i) => i * 10)
    .attr('x', d => x(d[0]))
    .attr('width', d => x(d[1]) - x(d[0]));

  g.append('g')
    .attr('class', 'axis axis--y')
    .attr('transform', `translate(0, 0)`)
    .call(d3.axisLeft(yLabelsScale)
      .tickSize(0)
      .tickPadding(6)
    );

  d3.selectAll('input')
    .on('change', changed);

  // change to grouped once
  // let timeout = d3.timeout(() => {
  //   d3.select('input[value=\'grouped\']')
  //     .property('checked', true)
  //     .dispatch('change');
  // }, 2000);

  function changed() {
    // timeout.stop();
    if (this.value === 'grouped') transitionGrouped();
    else transitionStacked();
  }

  function transitionGrouped() {
    x.domain([0, xMaxGrouped]);

    rect.transition()
      .duration(500)
      .delay((d, i) => i * 10)
      .attr('y', function(d, i) {
        return yValuesScale(i) + yValuesScale.bandwidth() / n * this.parentNode.__data__.key;
      })
      .attr('height', yValuesScale.bandwidth() / n)
      .transition()
        .attr('x', d => x(0))
        .attr('width', d => x(0) + x(d[1] - d[0]));
  }

  function transitionStacked() {
    x.domain([0, xMaxStacked]);

    rect.transition()
      .duration(500)
      .delay((d, i) => i * 10)
      .attr('x', d => x(d[0]))
      .attr('width', d => x(d[1]) - x(d[0]))
      .transition()
        .attr('y', (d, i) => yValuesScale(i))
        .attr('height', yValuesScale.bandwidth());
  }
}
