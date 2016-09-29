(function() {
  var eVCanvas = document.getElementById('ev-canvas');
  var ctx = eVCanvas.getContext('2d');
  ctx.canvas.width = 680;
  ctx.canvas.height = 300;
  var winCondition = 270;
  var barHeight = 40;
  var barTopPosition = ctx.canvas.height - (barHeight*2);

  var ElectoralVotesGraph = function(ctx) {
    this.currentData = {
        'clinton': {
          'electoral': 0,
          'popular': 0,
        },
        'trump': {
          'electoral': 0,
          'popular': 0,
        }
    };
    this.init = function(data) {
      console.log('init graph');
      drawThings(data, this.currentData);
    };
    this.update = function(data) {
      var currentData = [this.currentData['clinton']['electoral'], this.currentData['trump']['electoral']].join(',');
      var newData = [data['clinton']['electoral'], data['trump']['electoral']].join(',');    
      if(currentData !== newData) {
        drawThings(data, this.currentData);
        this.currentData = data;
      }
    };

    function drawThings(newData, currentData) {
      console.log('drawing', currentData, 'to', newData);
      ctx.clearRect(0 , 0, ctx.canvas.width, ctx.canvas.height);
      drawStatics();
      drawBars(newData, currentData);
      drawBubbleBoxes(newData, currentData);
      setTimeout(function() {
        if(newData['clinton']['electoral'] !== currentData['clinton']['electoral'] || newData['trump']['electoral'] !== currentData['trump']['electoral']) {
          drawThings(newData, currentData);
        }
      });
    }

    function drawStatics() {
      // background
      ctx.beginPath();
      ctx.fillStyle = 'pink';
      ctx.fillRect(0, barTopPosition, ctx.canvas.width, barHeight);

      // 270 marker
      ctx.beginPath();
      ctx.strokeStyle = 'purple';
      ctx.lineWidth = 1;
      ctx.moveTo(ctx.canvas.width/2, 0);
      ctx.lineTo(ctx.canvas.width/2, ctx.canvas.height);
      ctx.stroke();
    }

    function drawBars(newData, currentData) {
      var clintonPosition = setPosition('clinton', newData, currentData);
      var trumpPosition = setPosition('trump', newData, currentData);
      var trumpStart = ctx.canvas.width - trumpPosition;

      // clinton
      ctx.beginPath();
      ctx.rect(0, barTopPosition, clintonPosition, barHeight);
      ctx.fillStyle = '#0000FF';
      ctx.fill();
      drawPopularVotes('clinton', newData, 'left', 10);


      // trump
      ctx.beginPath();
      ctx.rect(trumpStart, barTopPosition, trumpPosition, barHeight);
      ctx.fillStyle = 'red';
      ctx.fill();
      drawPopularVotes('trump', newData, 'right', ctx.canvas.width - 10);
    }

    function drawPopularVotes(candidate, newData, align, x) {
      ctx.beginPath();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'normal 10pt Arial';
      ctx.textAlign = align;
      ctx.fillText(newData[candidate]['popular'].toLocaleString() + ' POPULAR VOTES', x, barTopPosition + 25);
    }

    function drawBubbleBoxes(newData, currentData) {
      var clintonPosition = setPosition('clinton', newData, currentData);
      var trumpPosition = ctx.canvas.width - setPosition('trump', newData, currentData);

      var handleTip = { x: 0, y: 2 };
      var handleBase = { x: 7, y: 20 };  
      var bubbleBottomLeftCorner = { x: 70, y: 20 };
      var bubbleBottomRightCorner = { x: 70, y: 20 };
      var bubbleTopLeftCorner = { x: 70, y: 115 };
      var bubbleTopRightCorner = { x: 70, y: 115 };

      // clinton bubble
      ctx.beginPath();
      ctx.fillStyle = '#ADD8E6';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.moveTo(clintonPosition - handleTip.x, barTopPosition - handleTip.y);
      ctx.lineTo(clintonPosition - handleBase.x, barTopPosition - handleBase.y);
      ctx.lineTo(clintonPosition - bubbleBottomLeftCorner.x, barTopPosition - bubbleBottomLeftCorner.y);
      ctx.lineTo(clintonPosition - bubbleTopLeftCorner.x, barTopPosition - bubbleTopLeftCorner.y);
      ctx.lineTo(clintonPosition + bubbleTopRightCorner.x, barTopPosition - bubbleTopRightCorner.y);
      ctx.lineTo(clintonPosition + bubbleBottomRightCorner.x, barTopPosition - bubbleBottomRightCorner.y);
      ctx.lineTo(clintonPosition + handleBase.x, barTopPosition - handleBase.y);
      ctx.lineTo(clintonPosition - handleTip.x, barTopPosition - handleTip.y);
      ctx.stroke();
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20pt Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CLINTON', clintonPosition, barTopPosition - bubbleBottomLeftCorner.y - 65);

      ctx.beginPath();
      ctx.fillStyle = '#0000FF';
      ctx.font = 'bold 50pt Arial';
      ctx.textAlign = 'center';
      ctx.fillText(currentData['clinton']['electoral'], clintonPosition, barTopPosition - bubbleBottomLeftCorner.y - 10);

      // trump bubble
      ctx.beginPath();
      ctx.fillStyle = '#FF7F7F';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.moveTo(trumpPosition - handleTip.x, barTopPosition - handleTip.y);
      ctx.lineTo(trumpPosition - handleBase.x, barTopPosition - handleBase.y);
      ctx.lineTo(trumpPosition - bubbleBottomLeftCorner.x, barTopPosition - bubbleBottomLeftCorner.y);
      ctx.lineTo(trumpPosition - bubbleTopLeftCorner.x, barTopPosition - bubbleTopLeftCorner.y);
      ctx.lineTo(trumpPosition + bubbleTopRightCorner.x, barTopPosition - bubbleTopRightCorner.y);
      ctx.lineTo(trumpPosition + bubbleBottomRightCorner.x, barTopPosition - bubbleBottomRightCorner.y);
      ctx.lineTo(trumpPosition + handleBase.x, barTopPosition - handleBase.y);
      ctx.lineTo(trumpPosition - handleTip.x, barTopPosition - handleTip.y);
      ctx.stroke();
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20pt Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TRUMP', trumpPosition, barTopPosition - bubbleBottomLeftCorner.y - 65);

      ctx.beginPath();
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 50pt Arial';
      ctx.textAlign = 'center';
      ctx.fillText(currentData['trump']['electoral'], trumpPosition, barTopPosition - bubbleBottomLeftCorner.y - 10);
    }

    function setPosition(candidate, newData, currentData) {
      var position;
      if(newData[candidate]['electoral'] > currentData[candidate]['electoral']) {
        position = mathToPercentOfWinCondition(currentData[candidate]['electoral']++);
      } else if(newData[candidate]['electoral'] < currentData[candidate]['electoral']) {
        position = mathToPercentOfWinCondition(currentData[candidate]['electoral']--);
      } else {
        position = mathToPercentOfWinCondition(currentData[candidate]['electoral']);
      }
      return position;
    }

    function mathToPercentOfWinCondition(val) {
      return (val/winCondition)*(ctx.canvas.width/2);
    }
  };

  window.EVG = new ElectoralVotesGraph(ctx);
})();
