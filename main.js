(() => {
  SIDE_LENGTH = 35;
  document.addEventListener("DOMContentLoaded", () => {
    var myButton = document.getElementById("my-button");
    var navBar = document.getElementById("nav-bar");
    myButton.addEventListener("click", () => {
      myButton.style.opacity = "0";
      window.setTimeout(() => {
        myButton.style.display = "none";
        var canv = document.getElementsByTagName("canvas")[0];
        canv.style.display = "flex";

        navBar.style.display = "flex";
        window.setTimeout(() => {
          canv.style.opacity = '1';
          navBar.style.opacity = '1';
        }, 500);

      }, 1000);

    });


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
    var geometry = new THREE.BoxGeometry( 20, 20, 20);
    var material = new THREE.MeshNormalMaterial();
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    var analyser;
    var dataArray;
    navigator.mediaDevices.getUserMedia({audio: true})
    .then(function(stream) {
      var audioCtx = new AudioContext();
      var source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      source.connect(analyser);
      analyser.fftSize = 2048;
      var bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      render();
    });


    function averageFromRange(vals, s, e) {
      var sum = 0;
      var count = 0;
      for (var i = s; i <= e; i++) {
        sum += vals[i];
        count += 1;
      }
      return sum / count;
    }

    function resetVertices() {
      for (i = 0; i < cube.geometry.vertices.length; i++) {
        var oldX = cube.geometry.vertices[i].x;
        var oldY = cube.geometry.vertices[i].y;
        var oldZ = cube.geometry.vertices[i].z;
        cube.geometry.vertices[i].x = oldX < 0 ? 0 - SIDE_LENGTH : SIDE_LENGTH;
        cube.geometry.vertices[i].y = oldY < 0 ? 0 - SIDE_LENGTH : SIDE_LENGTH;
        cube.geometry.vertices[i].z = oldZ < 0 ? 0 - SIDE_LENGTH : SIDE_LENGTH;
      }
    }

    function render() {
      resetVertices();
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
        cube.geometry.vertices[i].x = oldX < 0 ? 0 - (avs[i] % SIDE_LENGTH) : avs[i] % SIDE_LENGTH;
        cube.geometry.vertices[i].y = oldY < 0 ? 0 - (avs[i] % SIDE_LENGTH) : avs[i] % SIDE_LENGTH;
        cube.geometry.vertices[i].z = oldZ < 0 ? 0 - (avs[i] % SIDE_LENGTH) : avs[i] % SIDE_LENGTH;
      }

      cube.geometry.verticesNeedUpdate = true;
      cube.rotation.x += 0.002;
      cube.rotation.y += 0.002;

      requestAnimationFrame( render );
      renderer.render( scene, camera );
    }

  });

})();
