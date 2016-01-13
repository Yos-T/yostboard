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

function getFaces( piece )
{
    return piece.firstElementChild.getElementsByClassName("face");
}

function activeFace( piece )
{
    var faces = getFaces( piece );
    for ( var i = 0; i < faces.length; ++i )
    {
        if ( !faces[i].classList.contains("hidden") )
            return faces[i];
    }
    return null;
}

function getStackContainer( piece )
{
    return piece;
}

function inFoldedStackContainer( piece )
{
    var cl = piece.parentNode.classList;
    return cl.contains("piece") && !cl.contains("unfolded");
}

function inStackContainer( piece )
{
    return piece.parentNode.classList.contains("piece");
}

function stackNext( piece )
{
    return getStackContainer( piece ).firstElementChild;
}

function stackPrev( piece )
{
    if ( inStackContainer( piece ) )
    {
        return piece.parentNode;
    }
    return null;
}

function isTopOfStack( piece )
{
    return stackPrev( piece ) && !stackNext( piece );
}

function inStack( piece )
{
    return stackPrev( piece ) || stackNext( piece );
}

function inFoldedStack( piece )
{
    return inStack(piece) && getStackContainer( piece ).classList.contains("folded");
}

function inUnfoldedStack( piece )
{
    return inStack(piece) && getStackContainer( piece ).classList.contains("unfolded");
}

function getParentPiece( piece )
{
    if ( inStackContainer( piece ) )
        return piece.parentNode;
    else
        return null;
}

function doFold( piece, fold )
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
        p = sc.firstElementChild; // DOES NOT WORK!!
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

function fold( piece )
{
    doFold( piece, true );
}

function unfold( piece )
{
    doFold( piece, false );
}

function addToStack( pTo, pFrom )
{
    var sc = getStackContainer( pTo );
    while ( pFrom )
    {
        var next = sc.lastElementChild;
        if ( next == pFrom ) break;
        sc.appendChild( pFrom );
        sc = getStackContainer( pFrom );
        if ( !next ) break;
        if ( !next.classList.contains("piece") ) break;
        pFrom = next;
    }
}

function getCoordinates( piece )
{
    var p = {x:0,y:0};
    var s = piece.style.left;
    p.x = s.substring(0, s.length-2); //strip 'px'
    s = piece.style.top;
    p.y = s.substring(0, s.length-2); //strip 'px'
    return p;
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
    if ( inFoldedStackContainer(this) ) return; // Bubble to bottom of stack.

    var dragEl = this;
    if ( inUnfoldedStack(this) )
    {
        dragEl = activeFace(this);
    }

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

    e.dataTransfer.setDragImage(dragEl, x, y);

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

function getDragPiece( nodeid )
{
    var piece = findElement( nodeid );
    if ( !piece ) return null;

    if ( inUnfoldedStack( piece ) && !isTopOfStack( piece ) )
    {
        var nextPiece = stackNext( piece );
        var prevPiece = stackPrev( piece );
        if ( !prevPiece )
        {
            var c = getCoordinates( piece );
            setCoordinates( nextPiece, c.x, c.y );
            piece.parentNode.appendChild( nextPiece );
            if ( !inStack( nextPiece ) )
            {
                fold( nextPiece );
            }
        }
        else
        {
            addToStack( prevPiece, nextPiece );
        }
    }
    return piece;
}

function dropLocation(e)
{
    e.preventDefault();

    var to = this;
    var from = getDragPiece( e.dataTransfer.getData('nodeid') );
    var offsetX = e.dataTransfer.getData('offsetX');
    var offsetY = e.dataTransfer.getData('offsetY');
    var offset = getOffset(e);
    if ( !from ) return;
    var x = offset.x - offsetX;
    var y = offset.y - offsetY;
    setCoordinates(from, x, y);
    getPieceContainer( to ).appendChild( from );
    fold( from );

    e.stopPropagation();
}

function clickPiece( e )
{
    e.preventDefault();

    if ( inStack(this) )
    {
        if ( inFoldedStack(this) ) 
            unfold(this);
        else
            fold(this);
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
    // Last face is visible
    for ( var f = 0; f < faces.length-1; f++ )
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

function initTestBigStack()
{
    var piece = document.getElementById('c1');
    var mappc = getPieceContainer( document.getElementById('map') );
   
    var base = piece.cloneNode(true); 
    mappc.appendChild( base );
    setCoordinates( base, 0, 0 );

    for (var i = 0; i < 300; i++)
    {
        var clone = piece.cloneNode(true);
        clone.id = 'c'+i;
        setPieceEvents( clone );
        addToStack( base, clone );
    }
}

function init()
{
    initDrag();
    initTestBigStack();
//    if (initGame)
//        initGame();
//    restorePos();
}

