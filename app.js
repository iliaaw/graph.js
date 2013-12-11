/*global window: false, console: false, LazyGraph: false, EagerGraph: false */

(function () {
    'use strict';

    var data, functions, dependencies, lazyGraph, eagerGraph, result;

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

    lazyGraph = new LazyGraph(functions, dependencies);
    console.log('Lazy computing: ');
    result = lazyGraph.compute('m2', data);
    console.log(result);

    eagerGraph = new EagerGraph(functions, dependencies);
    console.log('Eager computing: ');
    result = eagerGraph.compute('m2', data);
    console.log(result);
}());