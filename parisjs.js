(function() {
  'use strict';
  function init() {
    // Initialize sigma.js:
    var sigInst = sigma.init(
      document.getElementById('container')
    ).graphProperties({
      minNodeSize: 0.5,
      maxNodeSize: 5
    });

    // Load graph file:
    console.log('1. Load GDF file');
    var loader = new XMLHttpRequest();
    loader.open('GET', 'graphe.gdf');
    loader.onreadystatechange = function() {
      if (loader.readyState == 4) {
        initGraph(loader.responseText);
      }
    }
    loader.send();

    // Parse GDF file:
    function initGraph(rawData) {
      console.log('2. Parse GDF file');

      // Split lines:
      var lines = rawData.split(/\r?\n/),
          line, i = 0, l = lines.length,
          parsingEdges = false, parsingNodes = false,
          nodeAttributes = [], edgeAttributes = [],
          edgesCount = 0;

      // Iterate on lines:
      for (; i < l; i++) {
        line = lines[i];

        if (line.match(/^[Nn]odedef>/)) {
          // Detect node attributes
          parsingNodes = true;
          nodeAttributes = line.replace(/^[Nn]odedef>/, '').split(/,/g).map(function(s) {
            return s.replace(/ .*/, '');
          });
        } else if (line.match(/^[Ee]dgedef>/)) {
          // Detect edge attributes
          parsingEdges = true;
          edgeAttributes = line.replace(/^[Ee]dgedef>/, '').split(/,/g).map(function(s) {
            return s.replace(/ .*/, '');
          });
        } else if (parsingEdges) {
          // Add edge
          var edge = {},
              source, target,
              values = line.split(/,/g);

          edgeAttributes.forEach(function(attr, i) {
            if (attr === 'node1')
              source = values[i];
            else if (attr === 'node2')
              target = values[i];
            else
              edge[attr] = values[i];
          });

          if (source && target)
            sigInst.addEdge(++edgesCount, source, target, edge);
        } else if (parsingNodes) {
          // Add node
          var node = {},
              nodeId,
              values = line.split(/,/g);

          nodeAttributes.forEach(function(attr, i) {
            if (attr === 'name' || attr === 'id')
              nodeId = values[i];
            else
              node[attr] = values[i];
          });

          if (nodeId)
            sigInst.addNode(nodeId, node);
        }
      }

      // Some fine tuning:
      console.log('3. Fine tuning');
      var R = 100,
          i = 0,
          L = sigInst.getNodesCount();
   
      sigInst.iterNodes(function(n) {
        // Position
        n.x = Math.cos(Math.PI*(i++)/L)*R;
        n.y = Math.sin(Math.PI*(i++)/L)*R;

        // Color
        n.color =
          n.attr.sex === 'female' ?
            '#D37' :
          n.attr.sex === 'male' ?
            '#33D' :
            '#888';

        // Size
        n.size = n.degree;
      });

      // Init layout algorithm:
      console.log('4. Init layout algorithm');
      sigInst.startForceAtlas2();

      // Stop layout in ten seconds:
      window.setTimeout(function() {
        console.log('5. Stop layout algorithm');
        sigInst.stopForceAtlas2();
      }, 8000);
    }
  }

  // Execute init() when dom is loaded:
  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', init, false);
  } else {
    window.onload = init;
  }
})(window);