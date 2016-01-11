function debug(msg)
{
    window.console.log(msg);
}

function findElement(id)
{
    return document.getElementById(id);
}

function getPieceContainer( loc )
{
    return loc.lastElementChild;
}

function getStackContainer( piece )
{
    return piece.lastElementChild.lastElementChild;
}

function inFoldedStackContainer( piece )
{
    var cl = piece.parentNode.classList;
    return cl.contains("stack") && !cl.contains("unfolded");
}

function inStackContainer( piece )
{
    return piece.parentNode.classList.contains("stack");
}

function inStack( piece )
{
    return inStackContainer( piece ) || getStackContainer( piece ).firstElementChild;
}

function inFoldedStack( piece )
{
    return inStack(piece) && getStackContainer( piece ).classList.contains("folded");
}

function getParentPiece( piece )
{
    if ( inStackContainer( piece ) )
        return piece.parentNode.parentNode.parentNode;
    else
        return null;
}

function fold( piece, fold )
{
    var p = piece;
    var add = 'unfolded';
    var remove = 'folded';
    if( fold )
    {
        add = 'folded';
        remove = 'unfolded';
    }

    while (p)
    {
        var sc = getStackContainer(p);
        sc.classList.remove(remove);
        sc.classList.add(add);
        p = sc.firstElementChild;
    }
    p = getParentPiece(piece);
    while (p)
    {
        var sc = getStackContainer(p);
        sc.classList.remove(remove);
        sc.classList.add(add);
        p = getParentPiece(p);
    }
}

function addToStack( pTo, pFrom )
{
    var sc = getStackContainer( pTo );
    var next = sc.firstElementChild;
    if ( next )
    {
        addToStack( next, pFrom )
    }
    else
    {
        sc.appendChild( pFrom );
    }
}

function setCoordinates(piece, x, y)
{
    piece.style.left = x+'px';
    piece.style.top = y+'px';
}

/*****************************
 *        DRAG EVENTS        *
 ****************************/
/*****************************
 *     EVENTS HELPERS        *
 ****************************/
function getOffset(evt) {
  var el = evt.currentTarget,
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
    if ( inStackContainer(this) ) return;
    
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

    e.stopPropagation(); 
}

/***************************
 *        DRAG OVER        *
 **************************/
function dragOverPiece(e)
{ 
    e.preventDefault();
//    var dragObject = findElement(e.dataTransfer.getData('nodeid'));
//    if (!dragObject) return;
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
    e.preventDefault(); 
}

function dropPieceBubble(e)
{
    e.preventDefault(); 

    var to = this;
    var from = findElement( e.dataTransfer.getData('nodeid') );
    addToStack(to, from);

    e.stopPropagation();
}

function dropLocation(e)
{
    e.preventDefault();

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

    e.stopPropagation();
}

function clickPiece( e )
{
    e.preventDefault();

    if ( inStack(this) )
    {
        if ( inFoldedStack(this) ) 
            fold(this, false);
        else
            fold(this, true);
    }

    e.stopPropagation();
}

function setPieceEvents(piece)
{
    piece.addEventListener( "dragstart", dragStartPiece, false );
    piece.addEventListener( "dragenter", function(){}, false );
    piece.addEventListener( "dragleave", function(){}, false );
    piece.addEventListener( "dragover", dragOverPiece, false );
    piece.addEventListener( "drop", dropPieceBubble, false );
    piece.addEventListener( "drop", dropPieceCapture, true ); //not needed for all pieces.
    piece.addEventListener( "click", clickPiece, false );
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

