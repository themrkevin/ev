(function() {
  var eVCanvas = document.getElementById('ev-canvas');
  var context = eVCanvas.getContext('2d');
  context.canvas.width = 680;
  context.canvas.height = 400;
  var winCondition = 270;
  var barHeight = 50;
  var barTopPosition = 300;

  var ElectoralVotesGraph = function(context) {
    this.currentData = [0,0];
    this.init = function() {
      console.log('init graph');
      context.fillStyle = 'pink';
      context.fillRect(0, barTopPosition, context.canvas.width, barHeight);
    };
    this.update = function(data) {
      var currentData = [this.currentData['clinton'], this.currentData['trump']].join(',');
      var newData = [data['clinton'], data['trump']].join(',');    
      if(currentData !== newData) {
        this.currentData = data;
        draw(data);
      }
    };

    function draw(data) {
      console.log('drawing', data);
      var clintonPosition = percentify(data['clinton']);
      var trumpPosition = percentify(data['trump']);
      var trumpStart = context.canvas.width - trumpPosition;

      context.fillStyle = 'blue';
      context.fillRect(0, barTopPosition, clintonPosition, barHeight);

      context.fillStyle = 'red';
      context.fillRect(trumpStart, barTopPosition, trumpPosition, barHeight);
    }

    function percentify(val) {
      return (val/winCondition)*(context.canvas.width/2);
    }
  };

  window.EVG = new ElectoralVotesGraph(context);
})();
