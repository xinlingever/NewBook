var sizeMap = { 'h1': 28, 'h2': 24, 'h3': 20, 'h4': 16, 'h5': 12, 'h6': 8 };

function getLines(ctx, sourceText, maxWidth, font) {
  var retLines = []
  var bakFont = ctx.font;

  //ctx.font = font;

  sourceText = sourceText.trim();
  if (sourceText.length === 0) {
    return retLines;
  }

  while (ctx.measureText(sourceText).width > maxWidth) {
    var expxtLength = sourceText.length * maxWidth / ctx.measureText(sourceText).width + 1;
    var line1 = sourceText.substr(0, expxtLength);

    var actualLength = expxtLength;
    while (ctx.measureText(line1).width > maxWidth) {
      line1 = line1.substring(0, line1.length - 2);
      actualLength = line1.length;
    }

    while ((line1[line1.length - 1] <= 'z' && line1[line1.length - 1] >= 'a')
        || (line1[line1.length - 1] <= 'Z' && line1[line1.length - 1] >= 'A')) {
      line1 = line1.substring(0, line1.length - 2);
      actualLength = line1.length;
    }

    retLines.push(line1);
    sourceText = sourceText.substr(actualLength);

  }

  retLines.push(sourceText);
  //ctx.font = bakFont;

  return retLines;
}



function drawRuler(startX, startY, endX, endY, stepX, stepY) {
  var ctx = document.getElementById('canvas').getContext('2d');

  var lineCnt = (endY - startY) / stepY;
  var columnCnt = (endX - startX) / stepX;


  var bakStroke = ctx.strokeStyle;
  var bakFill = ctx.fillStyle;
  ctx.strokeStyle = "#EEEEEE";
  ctx.fillStyle = "#EEEEEE";
  //ctx.lineWidth=1;
  // draw lines
  //ctx.moveTo(startX, startY);
  for (var line = 0; line <= lineCnt; line++) {
    var linePos = startY + stepY * line;
    ctx.fillText(line * stepY, startX + 5, linePos);
    ctx.beginPath();
    ctx.moveTo(startX, linePos);
    ctx.lineTo(endX, linePos);
    ctx.stroke();
  }

  // draw columns
  for (var column = 0; column <= columnCnt; column++) {
    var columnPos = startX + stepX * column;
    ctx.fillText(column * stepX, column * stepX + startX + 2, startY + 10);
    ctx.beginPath();
    ctx.moveTo(columnPos, startY);
    ctx.lineTo(columnPos, endY);
    ctx.stroke();
  }


  ctx.strokeStyle = bakStroke;
  ctx.fillStyle = bakFill;
}

var curPage = 0;
var pageCnt;
var pageHeight = 600;
var pageWidth = 800;

var fontSize = 18;
var lineSpace = 10;
var linesPerPage = parseInt(pageHeight / (fontSize + lineSpace) + '');
var ctx = document.getElementById('canvas').getContext('2d');
var textLines = [];

var gotopage = function (pageIndex) {
  if (pageIndex < 0 || pageIndex >= pageCnt) {
    return;
  }

  $('#textIndicator').text((pageIndex + 1) + ' / ' + parseInt(pageCnt.toString()));


  ctx.clearRect(0, 0, pageWidth, pageHeight);
  drawRuler(0, 0, pageWidth, pageHeight, 25, 25);

  var lineStart = parseInt(pageIndex * linesPerPage + '');
  var lineEnd = parseInt(lineStart + linesPerPage + '');
  if (lineEnd >= textLines.length) {
    lineEnd = textLines.length - 1;
  }
  for (var i = lineStart; i < lineEnd; i++) {
    ctx.fillText(textLines[i], 0, (i + 1 - lineStart) * (fontSize + lineSpace));
  }
}

var readText = function (text) {
  

  //ctx.fillStyle = "#000000";
  //ctx.strokeStyle = "#000000";
  ctx.font = fontSize + "px Arial";

  var lastCRIndex = 0;
  for (var i = 0; i < text.length; i++) {
    if (text[i] === '\r' || text[i] === '\n') {
      textLines = textLines.concat(getLines(ctx, text.substring(lastCRIndex, i), pageWidth, ctx.font));
      lastCRIndex = i;
    }

  }

  // page progress
  pageCnt = parseInt(textLines.length / linesPerPage + '');
  if (textLines.length % linesPerPage > 0) {
    pageCnt++;
  }

  gotopage(curPage);


}

//drawRuler(0, 0, 800, 600, 25, 25);

//draw(txt);
$('#btnOK').on('click', function () {
  readText($('#tt')[0].value);
});

//var w = new Worker("parseLinesWorker.js");
//w.onmessage = function (event) {
//  //document.getElementById("result").innerHTML = event.data;
//};
$('#btnOpen').on('change', function (evt) {
  var files = evt.target.files; // FileList object

  // Loop through the FileList and render image files as thumbnails.
  for (var i = 0, file; file = files[i]; i++) {

    var f = file;
    // Only process image files.
    if (!file.type.match('text/plain')) {
      continue;
    }

    var reader = new FileReader();
    var size = file.size;
    var chunk_size = 256 * 1024;
    var chunks = [];

    var offset = 0;
    var bytes = 0;

    var progress = $('#loadProgress');
    reader.onloadend = function (e) {
      if (e.target.readyState == FileReader.DONE) {
        var chunk = e.target.result;
        bytes += chunk.length;
        //w = new Worker("demo_workers.js");
        //while (chunk[chunk.length - 1] !== '\r' && chunk[chunk.length - 1] !== '\n') {
        //  chunk = chunk.substr(0, chunk.length - 2);
        //}
        chunks.push(chunk);
        //readText(chunk);

        progress.html(chunks.length + ' chunks // ' + bytes + ' bytes...');

        if ((offset < size)) {
          offset += chunk_size;
          var blob = file.slice(offset, offset + chunk_size);

          reader.readAsText(blob);

        } else {
          //progress.html("processing teh content...");

          var content = chunks.join("");
          readText(content);
          //alert("content is ready!");
          
          //w.postMessage(content); // Send data to our worker.
        };
      }



    };

    var blob = file.slice(offset, offset + chunk_size);
    reader.readAsText(blob);

    return;
    //////////////////////////////////////////////////////////////////////////
    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function (theFile) {
      return function (evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
          //readText(evt.target.result);
          //$('#tt')[0].value = evt.target.result;
          $('#loadProgress').text(' successed! ');
        }
      };
    })(f);

    reader.onprogress = (function (theFile) {
      return function (evt) {
        //evt.loaded / evt.total
        //if(evt.loaded !== evt.total){
        //  $('#loadProgress').text(' total: ' + evt.total + ' / loaded: ' + evt.loaded + '     ' + evt.loaded / evt.total);
        //}else{
        //  //$('#loadProgress').text(' successed! ');
        //}

        if (evt.total > 512 * 1024) {
          var sliceSize = 256 * 1024;

        }
      };
    })(f);

    // Read in the image file as a data URL.
    reader.readAsText(f);
  }
});

$('#btnPre').on('click', function () {
  if (curPage > 0) {
    gotopage(--curPage);
  }
});


$('#btnNext').on('click', function () {
  if (curPage < pageCnt - 1) {
    gotopage(++curPage);
  }
});

