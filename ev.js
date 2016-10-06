(function() {
  var ctx = document.getElementById('ev-canvas').getContext('2d');
  ctx.canvas.width = 665;
  ctx.canvas.height = 260;
  var bg = document.getElementById('static-canvas').getContext('2d');
  bg.canvas.width = ctx.canvas.width;
  bg.canvas.height = ctx.canvas.height;
  var totalVotes = 538;
  var winCondition = 270;
  var barHeight = 30;
  var barTopPosition = ctx.canvas.height - (barHeight*2.5);
  var imgClinton = new Image();
  imgClinton.width = 300;
  imgClinton.height = 274;
  imgClinton.src = 'clinton.png';
  var imgTrump = new Image();
  imgTrump.width = 300;
  imgTrump.height = 247;
  imgTrump.src = 'trump.png';
  var titleFont = 'ProximaCondensedExtraBold, Arial, serif';

  var ElectoralVotesGraph = function(ctx) {
    this.currentData = {
        clinton: {
          electoral: 0,
          popular: 0,
        },
        trump: {
          electoral: 0,
          popular: 0,
        }
    };
    this.init = function(data) {
      drawStaticThings();
      drawThings(data, this.currentData);
      this.currentData = data;
    };
    this.update = function(data) {
      if (data.clinton.electoral + data.trump.electoral > totalVotes) {
        console.log('something doesn\'t add up');
        return false;
      }
      if (JSON.stringify(data) !== JSON.stringify(this.currentData)) {
        drawThings(data, this.currentData);
        this.currentData = data;
      }
    };

    function drawStaticThings() {
      // top border?
      bg.beginPath();
      bg.strokeStyle = '#ececec';
      bg.lineWidth = 3;
      bg.moveTo(0, 0);
      bg.lineTo(ctx.canvas.width, 0);
      bg.stroke();

      // bar background
      bg.beginPath();
      bg.fillStyle = '#e7e7e7';
      bg.fillRect(0, barTopPosition, ctx.canvas.width, barHeight);
      bg.beginPath();
      bg.strokeStyle = '#f7f7f7';
      bg.lineWidth = 1;
      bg.moveTo(0, barTopPosition + barHeight);
      bg.lineTo(ctx.canvas.width, barTopPosition + barHeight - 1);
      bg.stroke();

      // 270 marker
      bg.setLineDash([8, 8]);
      bg.beginPath();
      bg.strokeStyle = '#c7c7c7';
      bg.lineWidth = 1;
      bg.moveTo(ctx.canvas.width/2, 0);
      bg.lineTo(ctx.canvas.width/2, barTopPosition + barHeight);
      bg.stroke();

      // 270 bubble
      bg.setLineDash([]);
      bg.beginPath();
      bg.fillStyle = '#fff';
      bg.strokeStyle = '#000';
      bg.lineWidth = 1;
      bg.moveTo(ctx.canvas.width/2, barTopPosition + barHeight - 3);
      bg.lineTo(ctx.canvas.width/2 - 5, barTopPosition + barHeight + 10);
      bg.lineTo(ctx.canvas.width/2 - 110, barTopPosition + barHeight + 10);
      bg.lineTo(ctx.canvas.width/2 - 110, barTopPosition + barHeight + 30);
      bg.lineTo(ctx.canvas.width/2 + 110, barTopPosition + barHeight + 30);
      bg.lineTo(ctx.canvas.width/2 + 110, barTopPosition + barHeight + 10);
      bg.lineTo(ctx.canvas.width/2 + 5, barTopPosition + barHeight + 10);
      bg.lineTo(ctx.canvas.width/2, barTopPosition + barHeight - 3);
      bg.stroke();
      bg.fill();

      bg.beginPath();
      bg.fillStyle = '#000';
      bg.font = '10pt Helvetica, Arial, serif';
      bg.textAlign = 'center';
      bg.fillText('270 Electoral Votes Needed to Win', ctx.canvas.width/2, barTopPosition + barHeight + 25);
    }

    function drawThings(newData, currentData) {
      var clintonUpToDate = newData.clinton.electoral === currentData.clinton.electoral;
      var trumpUpToDate = newData.trump.electoral === currentData.trump.electoral;
      var clintonPosition = setBarPosition('clinton', newData, currentData);
      var clintonPercent = percentOfWin(currentData.clinton.electoral);
      var trumpPosition = setBarPosition('trump', newData, currentData);
      var trumpPercent = percentOfWin(currentData.trump.electoral);

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      drawBars(clintonPosition, trumpPosition);
      drawPopularVotes(newData);
      drawFaces(clintonPercent, trumpPercent, clintonPosition, trumpPosition);
      drawBubbleBoxes(clintonPosition, clintonPercent, trumpPosition, trumpPercent, currentData);

      setTimeout(function() {
        if (!clintonUpToDate || !trumpUpToDate) {
          drawThings(newData, currentData);
        }
      });
    }

    function drawBars(clintonPosition, trumpPosition) {
      // clinton
      ctx.beginPath();
      ctx.rect(0, barTopPosition, clintonPosition, barHeight);
      ctx.fillStyle = '#4056BE';
      ctx.fill();

      // trump
      ctx.beginPath();
      ctx.rect(ctx.canvas.width - trumpPosition, barTopPosition, trumpPosition, barHeight);
      ctx.fillStyle = '#e2272e';
      ctx.fill();
    }

    function drawPopularVotes(data) {
      drawPopularVotesFor('clinton', data, 'left', 10);
      drawPopularVotesFor('trump', data, 'right', ctx.canvas.width - 10);
    }

    function drawPopularVotesFor(candidate, data, align, x) {
      ctx.beginPath();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'normal 9pt Helvetica, Arial, serif';
      ctx.textAlign = align;
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      ctx.shadowBlur = 1;
      ctx.fillText(data[candidate].popular.toLocaleString() + ' POPULAR VOTES', x, barTopPosition + 20);
    }

    function bubbleCollision(clintonPosition, clintonPercent, trumpPosition, trumpPercent) {
      var clintonBubble = bubbleConfig(clintonPercent);
      var trumpBubble = bubbleConfig(trumpPercent);
      var trumpBarPosition = ctx.canvas.width - trumpPosition;
      var clintonBubbleRange = clintonPosition + clintonBubble.corner.bottom.right.x;
      var trumpBubbleRange = trumpBarPosition - trumpBubble.corner.bottom.left.x;
      var lead = clintonPosition > trumpPosition ? 'clinton' : 'trump';
      var offset = clintonBubbleRange > trumpBubbleRange ? Math.abs(clintonBubbleRange - trumpBubbleRange) : 0;
      return offset/2;
    }

    function drawBubbleBoxes(clintonPosition, clintonPercent, trumpPosition, trumpPercent, currentData) {
      var trumpBarPosition = ctx.canvas.width - trumpPosition;

      // if bubbles collide, see who pushes who harder and by how much
      var collision = bubbleCollision(clintonPosition, clintonPercent, trumpPosition, trumpPercent);
      // offsets adjusts the bubbles at the beginning and end of bar for "collision"
      var clintonOffset = clintonPosition < 40 ? 41 : clintonPosition - collision;
      var trumpOffset = trumpBarPosition > ctx.canvas.width - 40 ? ctx.canvas.width - 41 : trumpBarPosition + collision;

      drawBubble('CLINTON', clintonPosition, clintonPercent, '#cfd4ea', currentData.clinton.electoral, '#4056BE', clintonOffset);
      drawBubble('TRUMP', trumpBarPosition, trumpPercent, '#f8dad8', currentData.trump.electoral, '#e2272e', trumpOffset);
    }

    function drawBubble(text, position, percentOfWin, color, electoralVotes, colorText, bubbleOffset) {
      var minPercent = 0.4;
      var percent = percentOfWin;
      if (percent < minPercent) {
        percent = minPercent;
      }
      var bubble = bubbleConfig(percent);
      // adjust bubble handle when its at the edge of the bubble START
      var bubbleCornerBottomLeftX = bubbleOffset - bubble.corner.bottom.left.x;
      var handleBaseLeftX = position - bubble.handle.base.left.x;
      var handleBaseLeftX = bubbleCornerBottomLeftX > handleBaseLeftX ? bubbleCornerBottomLeftX : handleBaseLeftX;
      var bubbleCornerBottomRightX = bubbleOffset + bubble.corner.bottom.right.x;
      var handleBaseRightX = position + bubble.handle.base.right.x;
      var handleBaseRightX = bubbleCornerBottomRightX < handleBaseRightX ? bubbleCornerBottomRightX : handleBaseRightX;
      // adjust bubble handle when its at the edge of the bubble END

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.moveTo(position - bubble.handle.tip.x, barTopPosition - bubble.handle.tip.y);
      ctx.lineTo(handleBaseLeftX, barTopPosition - bubble.handle.base.left.y);
      ctx.lineTo(bubbleOffset - bubble.corner.bottom.left.x, barTopPosition - bubble.corner.bottom.left.y);
      ctx.lineTo(bubbleOffset - bubble.corner.top.left.x, barTopPosition - bubble.corner.top.left.y);
      ctx.lineTo(bubbleOffset + bubble.corner.top.right.x, barTopPosition - bubble.corner.top.right.y);
      ctx.lineTo(bubbleOffset + bubble.corner.bottom.right.x, barTopPosition - bubble.corner.bottom.right.y);
      ctx.lineTo(handleBaseRightX, barTopPosition - bubble.handle.base.right.y);
      ctx.lineTo(position - bubble.handle.tip.x, barTopPosition - bubble.handle.tip.y);
      ctx.stroke();
      ctx.fill();

      drawBubbleText(text, (36 * percent), '#000000', bubbleOffset, barTopPosition - (bubble.padding * percent) - bubble.corner.bottom.left.y - (85 * percent));
      drawBubbleText(electoralVotes, (80 * percent), colorText, bubbleOffset, barTopPosition - ((bubble.padding + 5) * percent) - bubble.corner.bottom.left.y);
    }

    function bubbleConfig(percent) {
      var width = 200 * percent;
      var height = 140 * percent;
      var padding = 10;

      return {
        width: width,
        height: height,
        padding: padding,
        handle: {
          tip: {
            x: 0,
            y: 2
          },
          base: {
            left: {
              x: 5,
              y: padding
            },
            right: {
              x: 5,
              y: padding
            }
          }
        },
        corner: {
          bottom: {
            left: {
              x: width/2,
              y: padding
            },
            right: {
              x: width/2,
              y: padding
            }
          },
          top: {
            left: {
              x: width/2,
              y: padding + height
            },
            right: {
              x: width/2,
              y: padding + height
            }
          }
        }
      }
    }

    function drawBubbleText(text, size, color, x, y) {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.font = size+'pt '+titleFont;
      ctx.textAlign = 'center';
      ctx.fillText(text, x, y);
    }

    function drawFaces(clintonPercent, trumpPercent, clintonPosition, trumpPosition) {
      var minPercent = 0.4;
      var trumpBarPosition = ctx.canvas.width - trumpPosition;
      var collision = bubbleCollision(clintonPosition, clintonPercent, trumpPosition, trumpPercent);

      // offsets adjusts face positions when colliding with bubbles
      var clintonOffset = clintonPosition < 100;
      var trumpOffset = trumpBarPosition > ctx.canvas.width - 100;
      makeClintonFace(clintonPosition, clintonPercent, minPercent, clintonOffset, collision);
      makeTrumpFace(trumpPosition, trumpPercent, minPercent, trumpOffset, collision);
    }

    function makeClintonFace(position, percent, minPercent, offset, collision) {
      var percent = percent;
      if (percent < minPercent) {
        percent = minPercent;
      }
      var bubble = bubbleConfig(percent);
      var clintonBubble = bubbleConfig(percent);
      var w = ctx.canvas.width/3.2 * percent;
      var h = w * imgClinton.height / imgClinton.width;
      var x = offset ? position/2 + 50 : 0;
      var y = barTopPosition - h;
      var bubbleRange = position - bubble.corner.bottom.left.x - (collision/2);
      var faceRange = w;
      var faceAdjustment = percent > minPercent && faceRange > bubbleRange ? faceRange - bubbleRange : 0;
      ctx.drawImage(imgClinton, x - faceAdjustment, y, w, h);
    }

    function makeTrumpFace(position, percent, minPercent, offset, collision) {
      var percent = percent;
      if (percent < minPercent) {
        percent = minPercent;
      }
      var bubble = bubbleConfig(percent);
      var w = ctx.canvas.width/2.8 * percent;
      var h = w * imgTrump.height / imgTrump.width;
      var x = offset ? ctx.canvas.width - w - position/2 - 50 : ctx.canvas.width - w;
      var y = barTopPosition - h;
      var bubbleRange = ctx.canvas.width - position + bubble.corner.top.right.x + (collision/2);
      var faceRange = ctx.canvas.width - w;
      var faceAdjustment = percent > minPercent && bubbleRange > faceRange ? bubbleRange - faceRange : 0;

      ctx.drawImage(imgTrump, x + faceAdjustment, y, w, h);
    }

    function setBarPosition(candidate, newData, currentData) {
      var position;
      if (newData[candidate].electoral > currentData[candidate].electoral) {
        position = barPosition(percentOfWin(currentData[candidate]['electoral']++));
      } else if (newData[candidate]['electoral'] < currentData[candidate]['electoral']) {
        position = barPosition(percentOfWin(currentData[candidate]['electoral']--));
      } else {
        position = barPosition(percentOfWin(currentData[candidate]['electoral']));
      }
      return position;
    }

    function barPosition(val) {
      return val * (ctx.canvas.width/2);
    }
    function percentOfWin(val) {
      var percent = val/winCondition;
      percent = percent > 1 ? 1 : percent;
      return percent;
    }
  };

  window.EVG = new ElectoralVotesGraph(ctx);
})();
