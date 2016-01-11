function debug(msg)
{
    window.console.log(msg);
}

function findElement(id)
{
    return document.getElementById(id);
}


/*****************************
 *        DRAG EVENTS        *
 ****************************/
/*****************************
 *     EVENTS HELPERS        *
 ****************************/
function getOffset(evt) {
  var el = evt.target,
      x = 0,
      y = 0;

  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    x += el.offsetLeft - el.scrollLeft;
    y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }

  x = evt.clientX - x + document.documentElement.scrollLeft;
  y = evt.clientY - y + document.documentElement.scrollTop;

  return { x: x, y: y };
}

/****************************
 *        DRAG START        *
 ***************************/
function dragStartPiece(e) 
{
    e.stopPropagation(); //don't bubble

    var offsetX = 0;
    var offsetY = 0;
    var x = 0;
    var y = 0;

    if ( window.hasOwnProperty('devicePixelRatio') )
    {
        // Correct for zoom level
        var dpr = window.devicePixelRatio; //NON STANDARD ?
        var offset = getOffset(e);
        offsetX = offset.x;
        x = offsetX * dpr;
        offsetY = offset.y;
        y = offsetY * dpr;
    }

    e.dataTransfer.setDragImage(this, x, y);

    e.dataTransfer.dropEffect = 'move';
    e.dataTransfer.setData('nodeid', this.id);
    e.dataTransfer.setData('offsetX', offsetX);
    e.dataTransfer.setData('offsetY', offsetY);
}

/***************************
 *        DRAG OVER        *
 **************************/
function dragOverPiece(e)
{ 
    var dragObject = findElement(e.dataTransfer.getData('nodeid'));
    if (!dragObject) return;
}

function dragOverLocation(e)
{
    e.preventDefault();
}

/**********************
 *        DROP        *
 *********************/
function dropPieceCapture(e)
{
}

function dropPieceBubble(e)
{
    e.preventDefault(); //needed when image is dragged; prevent from opening image;
    var to = this;

    e.stopPropagation(); //don't bubble
    return false;
}

function setCoordinates(piece, x, y)
{
    piece.style.left = x+'px';
    piece.style.top = y+'px';
}

function getPieceContainer( loc )
{
    return loc.lastElementChild;
}

function dropLocation(e)
{
    e.preventDefault(); //needed when image is dragged; prevent from opening image;
    e.stopPropagation(); //don't bubble

    var to = this;
    var from = findElement( e.dataTransfer.getData('nodeid') );
    var offsetX = e.dataTransfer.getData('offsetX');
    var offsetY = e.dataTransfer.getData('offsetY');
    var offset = getOffset(e);
    if ( !from ) return;
    var x = offset.x - offsetX;
    var y = offset.y - offsetY;
    setCoordinates(from, x, y);
    getPieceContainer( to ).appendChild( from );
}

function setPieceEvents(piece)
{
    piece.addEventListener( "dragstart", dragStartPiece, false );
    piece.addEventListener( "dragenter", function(){}, false );
    piece.addEventListener( "dragleave", function(){}, false );
    piece.addEventListener( "dragover", dragOverPiece, false );
    piece.addEventListener( "drop", dropPieceBubble, false );
    piece.addEventListener( "drop", dropPieceCapture, true ); //not needed for all pieces.
//    piece.addEventListener( "click", clickPiece, false );
}

function setLocationEvents(loc)
{
    loc.addEventListener( "dragenter", function(){}, false );
    loc.addEventListener( "dragleave", function(){}, false );
    loc.addEventListener( "dragover", dragOverLocation, false );
    loc.addEventListener( "drop", dropLocation, false );
//    loc.addEventListener( "click", clickLocation, false );
}

function initFaces(el)
{
    if (!el) return;
    var faces = el.getElementsByClassName("face");
    if ( !faces ) return;
    // First face is visible
    for ( var f = 1; f < faces.length; f++ )
    {
        faces[f].classList.add("hidden");
    }
}

function initDrag()
{
    var pieces = document.getElementsByClassName("piece");
    for ( var i = 0; i < pieces.length; i++ )
    {
        setPieceEvents( pieces[i] );
        initFaces( pieces[i] );
    }

    var locations = document.getElementsByClassName("location");
    for ( var i = 0; i < locations.length; i++ )
    {
        setLocationEvents( locations[i] );
    }
}

function init()
{
    initDrag();
//    if (initGame)
//        initGame();
//    restorePos();
}

