"use strict";
var label_1 = require("./label");
var label_2 = require("./label");
exports.Label = label_2.Label;
var DomUtils;
(function (DomUtils) {
    /**
     * Pools of labels, indexed by CSS class.
     */
    var labelPool = {};
    var activeLabels = [];
    var parent;
    var camera;
    var renderer;
    function init(canvasDiv, iCamera, iRenderer) {
        parent = canvasDiv;
        camera = iCamera;
        renderer = iRenderer;
    }
    DomUtils.init = init;
    function createLabel(cssClass) {
        if (!parent) {
            //TODO: error?
            return undefined;
        }
        if (labelPool[cssClass] && labelPool[cssClass].length > 0) {
            var label = labelPool[cssClass].pop();
        }
        else {
            var label = new label_1.Label(cssClass, parent, camera, renderer);
        }
        activeLabels.push(label);
        return label;
    }
    DomUtils.createLabel = createLabel;
    /**
     * Return a label to the pool.
     */
    function freeLabel(label) {
        if (!label) {
            return;
        }
        activeLabels.remove(label);
        label.free();
        if (!labelPool[label.element.className]) {
            labelPool[label.element.className] = [];
        }
        labelPool[label.element.className].push(label);
    }
    DomUtils.freeLabel = freeLabel;
    function update(deltaSec) {
        for (var i = 0; i < activeLabels.length; i++) {
            activeLabels[i].update(deltaSec);
        }
    }
    DomUtils.update = update;
})(DomUtils = exports.DomUtils || (exports.DomUtils = {}));
