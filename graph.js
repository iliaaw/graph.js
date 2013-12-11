/*global window: false, console: false */

(function () {
    'use strict';

    function extend(Superclass, Subclass) {
        var F = function () { return; };
        F.prototype = Superclass.prototype;
        Subclass.prototype = new F();
        Subclass.prototype.constructor = Subclass;
        Subclass.superclass = Superclass.prototype;
    }

    function Graph(functions, dependencies) {
        this.functions = functions;
        this.dependencies = dependencies;

        this.detectCycles();
        this.compile();
    }

    Graph.prototype.detectCycles = function () {
        var key, i, edges, nodesWithNoEdges, node;

        edges = {};
        nodesWithNoEdges = [];

        for (key in this.dependencies) {
            if (this.dependencies.hasOwnProperty(key)) {
                for (i = 0, edges[key] = []; i < this.dependencies[key].length; i += 1) {
                    if (this.functions.hasOwnProperty(this.dependencies[key][i])) {
                        edges[key].push(this.dependencies[key][i]);
                    }
                }

                if (edges[key].length === 0) {
                    nodesWithNoEdges.push(key);
                }
            }
        }

        while (nodesWithNoEdges.length > 0) {
            node = nodesWithNoEdges[0];
            nodesWithNoEdges.splice(0, 1);

            for (key in edges) {
                if (edges.hasOwnProperty(key)) {
                    i = edges[key].indexOf(node);
                    if (i !== -1) {
                        edges[key].splice(i, 1);
                        if (edges[key].length === 0) {
                            nodesWithNoEdges.push(key);
                        }
                    }
                }
            }
        }

        for (key in edges) {
            if (edges.hasOwnProperty(key) && edges[key].length !== 0) {
                throw new Error('Cannot compile cyclic graph');
            }
        }
    };

    Graph.prototype.compile = function () {
        var that, key, compileFunction, result;

        that = this;
        this.results = {};
        this.compiledFunctions = {};

        compileFunction = function (key) {
            var args, i, fn;

            if (that.results.hasOwnProperty(key)) {
                return that.results[key];
            }

            if (that.data.hasOwnProperty(key)) {
                return that.data[key];
            }

            if (that.functions.hasOwnProperty(key)) {
                console.log('computing function ' + key);

                fn = that.functions[key];
                for (i = 0, args = []; i < that.dependencies[key].length; i += 1) {
                    args.push(compileFunction(that.dependencies[key][i]));
                }
                result = fn.apply(null, args);
                that.results[key] = result;

                return result;
            }
        };

        for (key in this.functions) {
            if (this.functions.hasOwnProperty(key)) {
                this.compiledFunctions[key] = compileFunction.bind(null, key);
            }
        }
    };

    Graph.prototype.compute = function (key, data) {
        // TODO check for key presence and missing dependencies
    };

    function LazyGraph() {
        LazyGraph.superclass.constructor.apply(this, arguments);
    }

    extend(Graph, LazyGraph);

    LazyGraph.prototype.compute = function (key, data) {
        LazyGraph.superclass.compute.apply(this, arguments);

        this.data = data;

        return this.compiledFunctions[key]();
    };

    window.LazyGraph = LazyGraph;

    function EagerGraph() {
        EagerGraph.superclass.constructor.apply(this, arguments);
    }

    extend(Graph, EagerGraph);

    EagerGraph.prototype.compute = function (key, data) {
        EagerGraph.superclass.compute.apply(this, arguments);

        var fn;

        this.data = data;

        for (fn in this.compiledFunctions) {
            if (this.compiledFunctions.hasOwnProperty(fn)) {
                this.compiledFunctions[fn]();
            }
        }

        return this.results[key];
    };

    window.EagerGraph = EagerGraph;
}());