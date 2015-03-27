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
