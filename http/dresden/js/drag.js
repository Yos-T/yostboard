function findElement(id)
{
    return document.getElementById(id);
}

/*****************************
 *        DRAG EVENTS        *
 ****************************/
/****************************
 *        DRAG START        *
 ***************************/
function dragStartPiece(e) 
{
	e.stopPropagation(); //don't bubble

    e.dataTransfer.setDragImage(this, 0, 0);

	e.dataTransfer.dropEffect = 'move';
	e.dataTransfer.setData('nodeid', this.id);
	e.dataTransfer.setData('stacking', 1);
	return false;
}

/***************************
 *        DRAG OVER        *
 **************************/
function dragOverPiece(e)
{ 
	var dragObject = findElement(e.dataTransfer.getData('nodeid'));
	if (!dragObject)
		return false;

//	if ( (getStackingOrder(this) == 'free') &&  folded(this) )// may not be needed.
		return true;

//	e.preventDefault();
/* Scrolling ??? if this.style.overflow=scroll/auto
	const scrollSpeed=40;
	const scrollMargin=10;

	var hWidth = dragObject.offsetWidth/2;
	var hHeight = dragObject.offsetHeight/2;
	var x = e.pageX - hWidth;
	var y = e.pageY - hHeight;
	var scrollX = 0;
	var scrollY = 0;

	if (e.clientY - hHeight <= scrollMargin)
		scrollY = -scrollSpeed;
	else if (window.innerHeight - e.clientY - hHeight <= scrollMargin)
		scrollY = scrollSpeed;

	if (e.clientX - hWidth <= scrollMargin)
		scrollX = -scrollSpeed;
	else if (window.innerWidth - e.clientX - hWidth <= scrollMargin)
		scrollX = scrollSpeed;

	if ( scrollX || scrollY )
		window.scrollBy(scrollX,scrollY);
*/
//	return false;
}

function dragOverLocation(e)
{
    e.preventDefault();
    return true;
}

/**********************
 *        DROP        *
 *********************/

/* 
Node.compareDocumentPosition(node);
DOCUMENT_POSITION_DISCONNECTED = 0x01;
DOCUMENT_POSITION_PRECEDING = 0x02;
DOCUMENT_POSITION_FOLLOWING = 0x04;
DOCUMENT_POSITION_CONTAINS = 0x08;
DOCUMENT_POSITION_CONTAINED_BY = 0x10;
*/
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
    return loc.childNodes[1];
}

function dropLocation(e)
{
    e.preventDefault(); //needed when image is dragged; prevent from opening image;
    e.stopPropagation(); //don't bubble

    var to = this;
    var from = findElement( e.dataTransfer.getData('nodeid') );
    if ( !from ) return false;
    var x = e.layerX;
    var y = e.layerY;
    setCoordinates(from, x, y);
    getPieceContainer( to ).appendChild( from );
    return false;
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

function initFaces()
{
	var containers = document.getElementsByClassName("faces");
	for ( var i = 0; i < containers.length; i++ )
	{
		var faces = containers[i].childNodes;
		if ( !faces ) break;
        // First face is visible
		for ( var f = 1; f < faces.length; f++ )
		{
			faces[f].classList.add("hidden");
		}
	}
}

function initDrag()
{
    var pieces = document.getElementsByClassName("piece");
    for ( var i = 0; i < pieces.length; i++ )
    {
        setPieceEvents( pieces[i] );
    }

    var locations = document.getElementsByClassName("location");
    for ( var i = 0; i < locations.length; i++ )
    {
        setLocationEvents( locations[i] );
    }
}

function init()
{
	initFaces();
    initDrag();
//    if (initGame)
//        initGame();
//    restorePos();
}

