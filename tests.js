/*global Graph: false, LazyGraph: false, EagerGraph: false, test: false, equal: false, raises: false */
(function () {
    'use strict';

    var data, functions, dependencies, cycleFunctions, cycleDependencies, graph, lazyGraph, eagerGraph;

    data = {
        'xs': [1, 2, 3, 6]
    };

    functions = {
        'n': function (xs) {
            return xs.length;
        },

        'm': function (xs, n) {
            var i, sum;

            for (i = 0, sum = 0; i < xs.length; i += 1) {
                sum += xs[i];
            }

            return sum / n;
        },

        'm2': function (xs, n) {
            var i, sum;

            for (i = 0, sum = 0; i < xs.length; i += 1) {
                sum += xs[i] * xs[i];
            }

            return sum / n;
        },

        'v': function (m, m2) {
            return m2 - m * m;
        }
    };

    dependencies = {
        'n':  ['xs'],
        'm':  ['xs', 'n'],
        'm2': ['xs', 'n'],
        'v':  ['m', 'm2']
    };

    cycleFunctions = {
        'a': function () {
            return 1;
        },

        'b': function () {
            return 2;
        },

        'c': function () {
            return 3;
        }
    };

    cycleDependencies = {
        'a': ['xs', 'c'],
        'b': ['xs', 'a'],
        'c': ['xs', 'b']
    };

    lazyGraph = new LazyGraph(functions, dependencies);

    eagerGraph = new EagerGraph(functions, dependencies);

    test('Lazy computing', function () {
        equal(lazyGraph.compute('n', data), 4, 'n');
        equal(lazyGraph.compute('m', data), 3, 'm');
        equal(lazyGraph.compute('m2', data), 12.5, 'm2');
        equal(lazyGraph.compute('v', data), 3.5, 'v');
    });

    test('Eager computing', function () {
        equal(eagerGraph.compute('n', data), 4, 'n');
        equal(eagerGraph.compute('m', data), 3, 'm');
        equal(eagerGraph.compute('m2', data), 12.5, 'm2');
        equal(eagerGraph.compute('v', data), 3.5, 'v');
    });

    test('Exceptions', function () {
        raises(
            function () { lazyGraph.compute('n', {}); },
            /Missing argument xs/,
            'Missing argument detection'
        );
        raises(
            function () { graph = new Graph(cycleFunctions, cycleDependencies); },
            /Cannot compile cyclic graph/,
            'Cycles detection'
        );
    });
}());