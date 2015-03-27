/*************************************************************
 /* Start Legend component
 */
ArcChart.Legend = (function () {
	function centerLegend(legend, size, lineHeight) {
		return 'translate(' + ((size - legend.node().getBBox().width) / 2) + ',' + ((size - legend.node().getBBox().height + lineHeight) / 2) + ')';
	}

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

		self.legend.attr('transform', centerLegend(self.legend, self.config.size, self.config.lineHeight));

		return self;
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

	Legend.prototype.reposition = function (newSize) {
		var self = this;

		this.legend.attr('transform', centerLegend(self.legend, newSize, self.config.lineHeight));
	}

	return Legend;
})();
