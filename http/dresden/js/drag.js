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

function getFaceContainer( piece )
{
    return piece.firstElementChild;
}
function getFaces( piece )
{
    return getFaceContainer( piece ).getElementsByClassName("face");
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

function stackNext( piece )
{
    if ( piece.lastElementChild.classList.contains("piece") )
    {
        return piece.lastElementChild;
    }
    else if ( piece.lastElementChild.classList.contains("stackOverflow") )
    {
        return piece.lastElementChild.firstElementChild;
    }
    return null; // Top of stack
}

function stackPrev( piece )
{
    if ( piece.parentNode.classList.contains("piece") )
    {
        return piece.parentNode;
    }
    else if ( piece.parentNode.classList.contains("stackOverflow") )
    {
        var prev = piece.previousElementSibling;
        if ( prev )
        {
            return prev;
        }
        else
        {
            return piece.parentNode.parentNode;
        }
    }
    return null; // Bottom of stack
}

function getStackBottom( piece )
{
    var prev = piece.parentNode;
    while( prev.classList.contains("piece") || prev.classList.contains("stackOverflow") )
    {
        piece = prev;
        prev = prev.parentNode;
    }
    return piece;
}

/*
function isTopOfStack( piece )
{
    return stackPrev( piece ) && !stackNext( piece );
}

function isBottomOfStack( piece )
{
    return !piece.parentNode.classList.contains("piece");
}
*/
function inStack( piece )
{
    return stackPrev( piece ) || stackNext( piece );
}

function isUnfolded( piece )
{
    return piece.classList.contains("unfolded");
}

function inFoldedStack( piece )
{
    return inStack(piece) && !isUnfolded( piece );
}

function inUnfoldedStack( piece )
{
    return inStack(piece) && isUnfolded( piece );
}

function toggleFold( piece )
{
// TODO: stackOverflow
    var p = piece;
    var down = true;
    while (p)
    {
        p.classList.toggle("unfolded");
        p = stackNext(p);
    }
    p = stackPrev(piece);
    while (p)
    {
        p.classList.toggle("unfolded");
        p = stackPrev(p);
    }
}

function fold( piece )
{
    if ( isUnfolded(piece) ) toggleFold(piece);
}

function unfold( piece )
{
    if ( !isUnfolded(piece) ) toggleFold(piece);
}

// Add piece pFrom on top of pTo
function addToStack( pTo, pFrom )
{
    if ( isUnfolded( pTo ) != isUnfolded( pFrom ) )
    {
        toggleFold( pFrom );
    }

// TODO: stackOverflow
/*
    var bottom = getStackBottom( pTo );
    var stackSize = 0;
    var next = stackNext( bottom );
    while ( next )
    {
        ++stackSize;
        next = stackNext( next );
        if ( stackSize >= MAX_PIECE_NESTING )
    }
*/
    while ( pFrom )
    {
        var next = stackNext( pTo );
        if ( next == pFrom ) break;
        pTo.appendChild( pFrom );
        pTo = pFrom;
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
function getEventOffset(evt, el) 
{
    if (typeof(el)==='undefined') el = evt.target; //No default arguments in chrome?

    var x = 0;
    var y = 0;

    while ( el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop) ) 
    {
        x += el.offsetLeft - el.scrollLeft;
        y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }

    x = evt.clientX - x + document.documentElement.scrollLeft;
    y = evt.clientY - y + document.documentElement.scrollTop;

    return { x: x, y: y };
}

function getDragPiece( nodeid )
{
    var piece = findElement( nodeid );
    if ( !piece ) return null;

    if ( inUnfoldedStack( piece ) )
    {
        var nextPiece = stackNext( piece );
// TODO: stackOverflow
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
        else if ( !nextPiece )
        {
            if ( !stackPrev( prevPiece ) )
            {
                fold( prevPiece );
            }
        }
        else
        {
            addToStack( prevPiece, nextPiece );
        }
    }

    return piece;
}

/****************************
 *        DRAG START        *
 ***************************/
function dragEndPiece(e)
{
    //this.parentNode.style.pointerEvents = '';
    //this.parentNode.style.zIndex = 'auto';
    //this.parentNode.style.opacity = '';
}

function dragStartPiece(e) 
{
/* TODO: loop to bottom of stack; Switch to draggable face ipv pieces 
*/
    // 'this' is the faces container
    var piece = this.parentNode;
    if ( inFoldedStack(piece) )
    {
        piece = getStackBottom( piece );
    }

    var dragEl = piece;
    if ( inUnfoldedStack(piece) )
    {
        dragEl = activeFace( piece );
    }
    else
    {
        // dragEl.style.pointerEvents = 'none'; // Stops dragging immediately in Chrome
    }

    var offsetX = 0;
    var offsetY = 0;
    var x = 0;
    var y = 0;

    if ( window.hasOwnProperty('devicePixelRatio') )
    {
        // Correct for zoom level
        var dpr = window.devicePixelRatio; //NON STANDARD ?
        var offset = getEventOffset(e, dragEl);
        offsetX = offset.x;
        x = offsetX * dpr;
        offsetY = offset.y;
        y = offsetY * dpr;
    }

//dragEl.style.zIndex = -1; // Stops dragging immediately in Chrome
//    var im = dragEl.cloneNode(true);
//    document.body.appendChild(im);
//    e.dataTransfer.setDragImage(im, x, y);
//dragEl.style.zIndex = -1; // Stops dragging immediately in Chrome
    e.dataTransfer.setDragImage(dragEl, x, y);
//dragEl.style.opacity = 0.5;
// cloneNode, add to body and position absolute top -computed height ??

    e.dataTransfer.dropEffect = 'move';
    e.dataTransfer.setData('nodeid', piece.id);
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

    var to = this.parentNode;
    var fromId = e.dataTransfer.getData('nodeid');
    if ( to.id != fromId ) 
    {
        var from = getDragPiece( e.dataTransfer.getData('nodeid') );
        addToStack(to, from);
    }
    else if ( !isUnfolded( to ) )
    {
        return;
    }

    e.stopPropagation();
}

function dropLocation(e)
{
    e.preventDefault();

    var to = this;
    var from = getDragPiece( e.dataTransfer.getData('nodeid') );
    var offsetX = e.dataTransfer.getData('offsetX');
    var offsetY = e.dataTransfer.getData('offsetY');
    var offset = getEventOffset(e, to);
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
    var piece = this.parentNode;
    if ( inStack(piece) )
    {
        toggleFold(piece);
    }

    e.stopPropagation();
}

function setPieceEvents(piece)
{
    var faceContainer = getFaceContainer( piece );
    faceContainer.addEventListener( "dragstart", dragStartPiece, false );
    faceContainer.addEventListener( "dragenter", function(){}, false );
    faceContainer.addEventListener( "dragleave", function(){}, false );
    faceContainer.addEventListener( "dragover", dragOverPiece, false );
    faceContainer.addEventListener( "drop", dropPieceBubble, false );
    faceContainer.addEventListener( "drop", dropPieceCapture, true ); //not needed for all pieces.
    faceContainer.addEventListener( "dragend", dragEndPiece, true ); //not needed for all pieces.
    faceContainer.addEventListener( "click", clickPiece, false );
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
//    initTestBigStack();
//    if (initGame)
//        initGame();
//    restorePos();
}

