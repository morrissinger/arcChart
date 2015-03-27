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
	};

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