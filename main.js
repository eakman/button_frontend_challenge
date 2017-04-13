(() => {
  document.addEventListener("DOMContentLoaded", () => {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth/window.innerHeight,
      0.1,
      1000
      );

      // place the camera at z of 100
      camera.position.z = 100;

      // add a renderer
      var renderer = new THREE.WebGLRenderer();
      renderer.setSize( window.innerWidth, window.innerHeight );
      // add the renderer element to the DOM so it is in our page
      document.body.appendChild( renderer.domElement );
			// Our Javascript will go here.
      var geometry = new THREE.BoxGeometry( 20, 20, 20);
  // create a material
    var material = new THREE.MeshNormalMaterial();
  // add the geometry to the mesh - and apply the material to it
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    // debugger
    var analyser;
    var dataArray;
    navigator.mediaDevices.getUserMedia({audio: true})
        .then(function(stream) {
          var audioCtx = new AudioContext();
          var source = audioCtx.createMediaStreamSource(stream);
          analyser = audioCtx.createAnalyser();
          source.connect(analyser);
          // source.connect(audioCtx.destination);
          analyser.fftSize = 2048;
          var bufferLength = analyser.frequencyBinCount;
          dataArray = new Uint8Array(bufferLength);
          render();
        });


      function averageFromRange(vals, s, e) {
        // debugger
        var sum = 0;
        var count = 0;
        for (var i = s; i <= e; i++) {
          sum += vals[i];
          count += 1;
        }
        return sum / count;
      }



      // let flag = false;

      // cube.rotation.y = .45;
      function render() {
        // cube.scale.x = .025;
        // cube.scale.y = .025;
        // cube.scale.z = .025;
        analyser.getByteTimeDomainData(dataArray);

        // debugger
        var sum = 0;
        dataArray.forEach((datum) => {
          sum += datum;
        });
        // console.log(dataArray.slice(400,420));
        var avg = sum / 1024;

        // console.log(avg)
        var eigth = 1024 / 8;
        var end = eigth;
        var start = 1;
        var avs = [];
        for (var i = 0; i < 8; i ++) {
          // console.log(start, end);
          avs.push(averageFromRange(dataArray, start - 1, end - 1));
          start+=eigth;
          end+=eigth;
        }
        // debugger
        for (var i = 0; i < cube.geometry.vertices.length; i++) {
          // debugger
          var oldX = cube.geometry.vertices[i].x;
          var oldY = cube.geometry.vertices[i].y;
          var oldZ = cube.geometry.vertices[i].z;
          cube.geometry.vertices[i].x = oldX < 0 ? 0 - (avs[i] % 35) : avs[i] % 35;
          cube.geometry.vertices[i].y = oldY < 0 ? 0 - (avs[i] % 35) : avs[i] % 35;
          cube.geometry.vertices[i].z = oldZ < 0 ? 0 - (avs[i] % 35) : avs[i] % 35;
          // cube.geometry.vertices[i].x = oldX < 0 ? 0 - 10 : 10;
          // cube.geometry.vertices[i].y = oldY < 0 ? 0 - 10 : 10;
          // cube.geometry.vertices[i].z = oldZ < 0 ? 0 - 20 : 10;


        }

        cube.geometry.verticesNeedUpdate = true;
        cube.rotation.x += 0.002;
        cube.rotation.y += 0.002;

	       requestAnimationFrame( render );
	        renderer.render( scene, camera );

        }
  });
})();
