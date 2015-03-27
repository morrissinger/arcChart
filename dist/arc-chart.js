/**
 * arcChart - A flexible arc layout for charts in d3 with legends.
 * @version v0.1.0
 * @link https://github.com/morrissinger/arcChart
 * @license MIT
 */
/*************************************************************
 /* Start ArcChart component
 */
var ArcChart = (function (Component) {
	Component = function (id) {
		this.id = id;

		/* Set Defaults */
		this.data = [];
		this.config = {
			size: 600,
			margin: 10,
			startAnimationDuration: 1000,
			arcs: {
				arcWidth: 120,
				span: 270
			},
			legend: {
				featureSize: 22,
				labelSize: 12,
				lineHeight: 30
			}
		};

	};

	Component.prototype.size = function (size) {
		this.config.size = size;
		return this;
	};

	Component.prototype.span = function (span) {
		this.config.arcs.span = span;
		this.config.arcs.startRotationOffset = -1 * span / 2;
		return this;
	}

	Component.prototype.arcWidth = function (width) {
		this.config.arcs.arcWidth = width;
		return this;
	};

	Component.prototype.margin = function (margin) {
		this.config.margin = margin;
		return this;
	};

	Component.prototype.featureSize = function (size) {
		this.config.legend.featureSize = size;
		return this;
	};

	Component.prototype.labelSize = function (size) {
		this.config.legend.labelSize = size;
		return this;
	};

	Component.prototype.lineHeight = function (height) {
		this.config.legend.lineHeight = height;
		return this;
	};

	Component.prototype.startAnimationDuration = function (duration) {
		this.config.startAnimationDuration = duration;
		return this;
	};

	Component.prototype.labels = function (labels) {
		this.labels = labels;
		return this;
	}
	Component.prototype.dataSet = function (data) {
		this.data = data;
		return this;
	};

	Component.prototype.render = function () {

		/* A set of utility functions to assist in rendering */
		var helpers = {

			/* Sets up a new svg for the component */
			createSvg: function createSvg(id, config) {
				return d3.select(id)
						.append('svg')
						.attr('width', config.size)
						.attr('height', config.size);
			},

			/* Creates a set of arcs */
			createArcs: function createArcs(svg, config, data, labels) {
				var radius = config.size / 2;

				var arcSet = svg.append('g')
						.attr('transform', 'translate(' + (-1 * radius) + ',' + (-1 * radius) + ')')
						.attr('class', 'chart');

				return new ArcChart.ArcSet(arcSet)
						.size(config.size)
						.margin(config.margin)
						.startAnimationDuration(config.startAnimationDuration)
						.span(config.arcs.span)
						.arcWidth(config.arcs.arcWidth)
						.dataSet(data)
						.labels(labels);
			},

			/* Creates a legend */
			createLegend: function createLegend(svg, config, data, labels) {
				var legend = svg.append('g')
						.attr('class', 'legend');

				return new ArcChart.Legend(legend)
						.size(config.size)
						.featureSize(config.legend.featureSize)
						.labelSize(config.legend.labelSize)
						.lineHeight(config.legend.lineHeight)
						.dataSet(data)
						.labels(labels);
			}

		};

		/* Rendering */
		var svg = helpers.createSvg(this.id, this.config);
		helpers.createArcs(svg, this.config, this.data, this.labels).render();
		helpers.createLegend(svg, this.config, this.data, this.labels).render();

	};

	return Component;
})();
/**
 * arcChart - A flexible arc layout for charts in d3 with legends.
 * @version v0.1.0
 * @link https://github.com/morrissinger/arcChart
 * @license MIT
 */
/*************************************************************
 /* Start ArcSet component
 */
ArcChart.ArcSet = (function () {

	var ArcSet = function (chart) {
		this.config = {};
		this.chart = chart;
	};

	ArcSet.prototype.render = function () {

		var self = this;

		/**
		 * Adds the starting angle of the arc and converts the sum from degrees to radians.
		 */
		function _mapAngle(angle) {
			return (angle + self.config.startRotationOffset) * (Math.PI / 180);
		}

		function total(data) {
			var sum = 0;
			for(var i = 0, j = data.length; i < j; i++) {
				sum = sum + data[i];
			}
			return sum;
		}

		function center(size) {
			return 'translate(' + size + ',' + size + ')';
		}

		function _createBackgroundArc(chart) {
			var radius = self.config.size / 2;

			var arc = d3.svg.arc()
					.innerRadius(radius - self.config.arcWidth - self.config.margin)
					.outerRadius(radius - self.config.margin)
					.startAngle(_mapAngle(0))
					.endAngle(_mapAngle(self.config.span));

			chart.append('path')
					.attr('transform', center(self.config.size))
					.attr('d', arc)
					.attr('class', 'products ' + 'background');

		}

		function _createArc(chart, end, cssClass, series) {

			var radius = self.config.size / 2;

			var arc = d3.svg.arc()
					.innerRadius(radius - self.config.arcWidth - self.config.margin)
					.outerRadius(radius - self.config.margin)
					.startAngle(_mapAngle(0)); //converting from degs to radians

			var path = chart.append('path')
					.attr('transform', center(self.config.size))
					.datum({endAngle: _mapAngle(0)})
					.attr('d', arc)
					.attr('class', 'products ' + cssClass);

			path.transition()
					.ease('cubic-out')
					.duration(self.config.startAnimationDuration)
					.call(arcTween, _mapAngle(end));

			path.on('mouseover', function () {
				d3.select('.legend')
						.classed('filtered', true);
				d3.selectAll('.label.series-' + series)
						.classed('active', true);
			}).on('mouseout', function () {
				d3.select('.legend')
						.classed('filtered', false);
				d3.selectAll('.label.series-' + series)
						.classed('active', false);
			});

			function arcTween(transition, newAngle) {
				transition.attrTween('d', function(d) {
					var interpolate = d3.interpolate(d.endAngle, newAngle);
					return function(t) {
						d.endAngle = interpolate(t);
						return arc(d);
					}
				});
			}

		}

		function _createArcs(chart, data, labels) {
			var sum = total(data);
			for (i = data.length - 1, j = 0; i >= j; i--) {
				_createArc(chart, scale(sum), 'series-' + i, i);
				sum = sum - data[i];
			}
		}

		var scale = d3.scale.linear()
				.domain([0, total(self.data)])
				.range([0, self.config.span]);

		_createBackgroundArc(self.chart);
		_createArcs(self.chart, self.data, self.labels);

	};

	ArcSet.prototype.size = function (size) {
		this.config.size = size;
		return this;
	};

	ArcSet.prototype.span = function (span) {
		this.config.span = span;
		this.config.startRotationOffset = -1 * span / 2;
		return this;
	};

	ArcSet.prototype.arcWidth = function (width) {
		this.config.arcWidth = width;
		return this;
	};

	ArcSet.prototype.margin = function (margin) {
		this.config.margin = margin;
		return this;
	};

	ArcSet.prototype.startAnimationDuration = function (duration) {
		this.config.startAnimationDuration = duration;
		return this;
	};

	ArcSet.prototype.dataSet = function (data) {
		this.data = data;
		return this;
	};

	ArcSet.prototype.labels = function (labels) {
		this.labels = labels;
		return this;
	};

	return ArcSet;
})();

/**
 * arcChart - A flexible arc layout for charts in d3 with legends.
 * @version v0.1.0
 * @link https://github.com/morrissinger/arcChart
 * @license MIT
 */
/*************************************************************
 /* Start Legend component
 */
ArcChart.Legend = (function () {
	var Legend = function (legend) {
		this.config = {};
		this.legend = legend;
	};

	Legend.prototype.render = function () {

		var self = this;

		var features = [], featureWidths = [], featureWidth;

		function linePosition(number) {
			return self.config.lineHeight * number;
		}

		function middle(featureSize, labelSize) {
			return ((featureSize - labelSize - 4) / 2)
		}

		function centerLegend(legend) {
			return 'translate(' + ((self.config.size - legend.node().getBBox().width) / 2) + ',' + ((self.config.size - legend.node().getBBox().height + self.config.lineHeight) / 2) + ')';
		}
		function _createFeatures (legend, data) {

			function _createFeature (value, line) {
				var text = legend.append('text')
						.attr('class', 'label feature series-' + line)
						.attr('y', linePosition(line))
						.attr('text-anchor', 'end')
						.text(value);

				_addEvents(text, line);

				return text;
			}

			for (var i = 0, keys = Object.keys(data), j = keys.length; i < j; i++) {
				var key = keys[i],
					dataPoint = data[key],
					feature = _createFeature(dataPoint, i);

				features.push(feature);
				featureWidths.push(feature.node().getBBox().width);
			}

			featureWidth = d3.max(featureWidths);

		}

		function _sizeFeatures (features) {

			for (var i = 0, j = features.length; i < j; i++) {
				features[i].attr('x', featureWidth);
			}
		}

		function _createLabels (legend, labels) {
			function _createLabel (legend, label, line) {

				var text = legend.append('text')
						.attr('class', 'label series-' + i)
						.attr('x', featureWidth + 6)
						.attr('y', linePosition(line) - middle(self.config.featureSize,  self.config.labelSize))
						.text(label);

				_addEvents(text, line);
			}

			for (var i = 0, j = labels.length; i < j; i++) {
				var label = labels[i];

				_createLabel(legend, label, i);
			}
		}

		function _addEvents(text, series) {
			text.on('mouseover', function () {
				d3.select('.legend')
						.classed('filtered', true);
				d3.selectAll('.label.series-' + series)
						.classed('active', true);
				d3.selectAll('path.series-' + series)
						.classed('active', true);
			}).on('mouseout', function () {
				d3.select('.legend')
						.classed('filtered', false);
				d3.selectAll('.label.series-' + series)
						.classed('active', false);
				d3.selectAll('path.series-' + series)
						.classed('active', false);
			});
		}

		_createFeatures(self.legend, self.data);
		_sizeFeatures(features, featureWidths);
		_createLabels(self.legend, self.labels);

		self.legend.attr('transform', centerLegend(self.legend));
	};

	Legend.prototype.size = function (size) {
		this.config.size = size;
		return this;
	};

	Legend.prototype.featureSize = function (size) {
		this.config.featureSize = size;
		return this;
	};

	Legend.prototype.labelSize = function (size) {
		this.config.labelSize = size;
		return this;
	};

	Legend.prototype.lineHeight = function (height) {
		this.config.lineHeight = height;
		return this;
	};

	Legend.prototype.dataSet = function (data) {
		this.data = data;
		return this;
	};

	Legend.prototype.labels = function (labels) {
		this.labels = labels;
		return this;
	};

	return Legend;
})();
