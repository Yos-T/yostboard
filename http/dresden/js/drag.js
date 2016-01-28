var MAX_PIECE_NESTING = 2;

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
    var active = getFaceContainer( piece ).getElementsByClassName("face active")
    if ( active.length )
    {
        return active[0];
    }
    return null;
}

function inStackOverflow( piece )
{
    return piece.parentNode && piece.parentNode.classList.contains("stackOverflow");
}

function getStackOverflow( piece, parentOnly )
{
    if ( inStackOverflow( piece ) )
    {
        return piece.parentNode;
    }
    else if ( !parentOnly )
    {
        var soList = piece.getElementsByClassName("stackOverflow");
        if ( soList.length )
        {
            return soList[0];
        }
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
    else if ( inStackOverflow( piece ) )
    {
        return piece.nextElementSibling;
    }
    return null; // Top of stack
}

function stackPrev( piece )
{
    if ( piece.parentNode && piece.parentNode.classList.contains("piece") )
    {
        return piece.parentNode;
    }
    else if ( inStackOverflow( piece ) )
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
    while( prev && ( prev.classList.contains("piece") || prev.classList.contains("stackOverflow") ) )
    {
        piece = prev;
        prev = prev.parentNode;
    }
    return piece;
}

function getStackTop( piece )
{
    if ( inStackOverflow( piece ) )
    {
        return piece.parentNode.lastElementChild;
    }
    else
    {
        var stackOverflow = getStackOverflow( piece, false );
        if ( stackOverflow )
        {
            return stackOverflow.lastElementChild;
        }
        else
        {
            var next = stackNext( piece );
            while( next )
            {
                piece = next;
                next = stackNext( piece );
            }
            return piece;
        }
    }
}

function inStack( piece )
{
    return stackPrev( piece ) || stackNext( piece );
}

function isUnfolded( piece )
{
    return getStackBottom( piece ).classList.contains("unfolded");
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
    getStackBottom( piece ).classList.toggle("unfolded");
}

function fold( piece )
{
    if ( isUnfolded(piece) ) toggleFold(piece);
}

function unfold( piece )
{
    if ( !isUnfolded(piece) ) toggleFold(piece);
}

function newStackOverflow()
{
    var so = document.createElement('div');
    so.setAttribute('class', 'stackOverflow' );
    return so;
}

function addToStackOverflow( so, piece, pBefore )
{
    var fromTop = getStackTop( piece );
    var prev;
    while ( fromTop )
    {
        prev = stackPrev( fromTop );
        so.insertBefore( fromTop, pBefore );
        pBefore = fromTop;
        fromTop = prev;
    }
    // remove excess stackOverflow containers
    soList = so.getElementsByClassName( 'stackOverflow' );
    for (var i = 0; i < soList.length; ++i )
    {
        soList[i].parentNode.removeChild( soList[i] );
    }
}

// Add piece pFrom on top of pTo
// pFrom can be single detached piece or stack bottom
function addToStack( pTo, pFrom )
{
    var toUnfolded = isUnfolded( pTo );
    fold( pFrom );

    if ( !toUnfolded )
    {
        // Put on top of folded stack.
        pTo = getStackTop( pTo );
    }

    var toSo = getStackOverflow( pTo, true );
    if ( toSo )
    {
        var toNext = stackNext( pTo );
        addToStackOverflow( toSo, pFrom, toNext );
    }
    else
    {
        var next = getStackBottom( pTo );
        var stackSize = 1;
        while ( next != pTo )
        {
            ++stackSize;
            next = stackNext( next );
        }

        next = stackNext( pTo );
        // detach next, insert pFrom stack
        if ( next ) next.parentNode.removeChild( next );

        pTo.appendChild( pFrom );
        
        while ( pFrom && stackSize < MAX_PIECE_NESTING )
        {
            ++stackSize;
            pTo = pFrom;
            pFrom = stackNext( pFrom );
        }
        
        if ( pFrom )
        {
            pFrom.parentNode.removeChild( pFrom );
            var so = newStackOverflow();
            pTo.appendChild( so );
            addToStackOverflow( so, pFrom, null );
            if ( next )
                addToStackOverflow( so, next, null );
        }
        else if ( next )
        {
            pTo.appendChild( next );
            while ( next && stackSize < MAX_PIECE_NESTING )
            {
                ++stackSize;
                pTo = next;
                next = stackNext( next );
            }
            if ( next )
            {
                next.parentNode.removeChild( next );
                var so = newStackOverflow();
                pTo.appendChild( so );
                addToStackOverflow( so, next, null );
            }
        }
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

/* Find the piece with nodeid and detach it from it's parent.
 * If the piece is folded, it must be to bottom of a stack and will be detached from the location.
 * If the piece is unfolded, the rest of the stack will remain and the single piece will be detached from the stack.
 */
function getDragPiece( nodeid )
{
    var piece = findElement( nodeid );
    if ( !piece ) return null;

    if ( inUnfoldedStack( piece ) )
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
            else
            {
                if ( isUnfolded( piece ) )
                {
                    unfold( nextPiece );
                }
                // Update stackOverflow
                var so = nextPiece.getElementsByClassName( 'stackOverflow' );
                if ( so.length )
                {
                    var first = so[0].firstElementChild;
                    so[0].parentNode.appendChild( first );
                    if ( so[0].firstElementChild ) // not empty
                    {
                        first.appendChild( so[0] );
                    }
                    else
                    {
                        so[0].parentNode.removeChild( so[0] );
                    }
                }
            }
        }
        else if ( !nextPiece )
        {
            if ( !stackPrev( prevPiece ) )
            {
                fold( prevPiece );
            }
            else
            {
                piece.parentNode.removeChild( piece );
                // Remove empty stackOverflow
                var so = prevPiece.getElementsByClassName( 'stackOverflow' );
                if ( so.length )
                {
                    so[0].parentNode.removeChild( so[0] );
                }
            }
        }
        else if ( !inStackOverflow( piece ) )
        {
            piece.parentNode.removeChild( piece );
            // piece has stackOverflow 
            if ( piece.lastElementChild.classList.contains( 'stackOverflow' ) )
            {
                nextPiece.parentNode.removeChild( nextPiece );
                var so = piece.lastElementChild;
                piece.removeChild( so );
                if ( so.firstElementChild ) //not empty
                {
                    nextPiece.appendChild( so ); // move stackOverflow
                }
            }
            addToStack( prevPiece, nextPiece );
        }
    }
    
    if ( piece.parentNode ) // Not detached yet.
    {
        piece.parentNode.removeChild( piece );
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
        if ( !isUnfolded( to ) && getStackBottom( to ).id == fromId )
        {
            return;
        }
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
    faces[faces.length-1].classList.add("active");
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
    base.id = 'cc0';
    setPieceEvents( base );
    mappc.appendChild( base );
    setCoordinates( base, 0, 0 );

    for (var i = 1; i < 300; i++)
    {
        var clone = piece.cloneNode(true);
        clone.id = 'cc'+i;
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

