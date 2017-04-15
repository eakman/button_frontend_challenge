(() => {

  SIDE_LENGTH = 35;
  PERMISSION_ERROR = "Oops! Looks like you forgot to give JELL-O-CUBE permission to use your microphone.";
  BROWSER_ERROR = "Oops! something went wrong. Sadly, JELL-O-CUBE makes use of a browser feature which is not supported by Safari or Opera. If you're using one of those, switch to Chrome or Firefox. :)";
  document.addEventListener("DOMContentLoaded", () => {
    var myButton = document.getElementById("my-button");
    var navBar = document.getElementById("nav-bar");
    var introTitle = document.getElementById("intro-title");

    myButton.addEventListener("click", () => {
      myButton.style.opacity = "0";
      introTitle.style.opacity = "0";
      window.setTimeout(() => {
        myButton.style.display = "none";
        introTitle.style.display = "none";
        var canv = document.getElementsByTagName("canvas")[0];
        canv.style.display = "flex";

        navBar.style.display = "flex";
        window.setTimeout(() => {
          canv.style.opacity = '1';
          navBar.style.opacity = '1';
        }, 500);

      }, 1000);
      setUpCube();
    });

    function resetVertices(cube, initalVertices) {
      for (i = 0; i < cube.geometry.vertices.length; i++) {
        cube.geometry.vertices[i].x = initalVertices[i].x;
        cube.geometry.vertices[i].y = initalVertices[i].y;
        cube.geometry.vertices[i].z = initalVertices[i].z;
      }
      cube.geometry.verticesNeedUpdate = true;
    }

    function averageFromRange(vals, s, e) {
      var sum = 0;
      var count = 0;
      for (var i = s; i <= e; i++) {
        sum += vals[i];
        count += 1;
      }
      return sum / count;
    }

    function setUpCube() {
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(
                              75,
                              window.innerWidth/window.innerHeight,
                              0.1,
                              1000
                            );
      camera.position.z = 100;
      var renderer = new THREE.WebGLRenderer();
      renderer.setSize( window.innerWidth, window.innerHeight );
      document.body.appendChild( renderer.domElement );
      var geometry = new THREE.BoxGeometry( 70, 70, 70);
      var material = new THREE.MeshNormalMaterial();
      var cube = new THREE.Mesh( geometry, material );
      scene.add( cube );
      var analyser;
      var dataArray;
      var instructions = document.getElementById("instructions");
      try {
        navigator.mediaDevices.getUserMedia({audio: true})
        .then(function(stream) {
          var audioCtx = new AudioContext();
          var source = audioCtx.createMediaStreamSource(stream);
          analyser = audioCtx.createAnalyser();
          source.connect(analyser);
          analyser.fftSize = 2048;
          var bufferLength = analyser.frequencyBinCount;
          dataArray = new Uint8Array(bufferLength);
          var initalVertices = cube.geometry.vertices.map((v) => {
            var obj = {};
            obj.x = v.x;
            obj.y = v.y;
            obj.z = v.z;
            return obj;
          });
          render(cube, initalVertices, analyser, dataArray, scene, camera, renderer);
        }, function () {
          instructions.innerHTML = PERMISSION_ERROR;
        });
      } catch(e) {
        instructions.innerHTML = BROWSER_ERROR;
        instructions.style.width = "400px";
        instructions.style.left = "25px";
      }

    }

    function render(cube, initalVertices, analyser, dataArray, scene, camera, renderer) {
      resetVertices(cube, initalVertices);
      analyser.getByteTimeDomainData(dataArray);
      var sum = 0;
      dataArray.forEach((datum) => {
        sum += datum;
      });
      var eigth = 1024 / 8;
      var end = eigth;
      var start = 1;
      var avs = [];
      for (var i = 0; i < 8; i ++) {
        avs.push(averageFromRange(dataArray, start - 1, end - 1));
        start+=eigth;
        end+=eigth;
      }
      for (i = 0; i < cube.geometry.vertices.length; i++) {
        var oldX = cube.geometry.vertices[i].x;
        var oldY = cube.geometry.vertices[i].y;
        var oldZ = cube.geometry.vertices[i].z;
        cube.geometry.vertices[i].x = initalVertices[i].x < 0 ? 0 - (avs[i] % SIDE_LENGTH) : avs[i] % SIDE_LENGTH;
        cube.geometry.vertices[i].y = initalVertices[i].y < 0 ? 0 - (avs[i] % SIDE_LENGTH) : avs[i] % SIDE_LENGTH;
        cube.geometry.vertices[i].z = initalVertices[i].z < 0 ? 0 - (avs[i] % SIDE_LENGTH) : avs[i] % SIDE_LENGTH;
      }

      cube.geometry.verticesNeedUpdate = true;
      cube.rotation.x += 0.002;
      cube.rotation.y += 0.002;

      requestAnimationFrame( () => {
        render(cube, initalVertices, analyser, dataArray, scene, camera, renderer);
      });
      renderer.render( scene, camera );
    }
  });

})();
