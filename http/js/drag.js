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

function clickPiece(e)
{
	e.stopPropagation(); //don't bubble

	if ( inFoldedStack(this) )
		unfold(this);
	//else
		//debug('click counter');
}

function unfold(piece)
{
	var p = piece;
	var down = true;
	while (p)
	{
		var sc = getStackContainer(p);
		sc.classList.remove('folded');
		sc.classList.add('unfolded');
		var ds = sc.getAttribute('data-size');
		if ((ds != 1) && down)
			down = false;
		else if (ds != 1)
			break;
			
		if (down)
			p = sc.firstElementChild;
		else 
			p = getParentPiece(piece);
	}
}

/**********************************
 *    FUNCTIONS THAT MAKE DELTAS  *
 **********************************/
function addToStackContainer(to, from, index)
{
	var sc = getStackContainer(to);
	if (index == -1)
		sc.appendChild(from);
	else
		sc.insertBefore(from, sc.childNodes[index]);
}

function setCoordinates(piece, x, y)
{
	piece.style.left = x+'px';
	piece.style.top = y+'px';
}

/**********************************
 *        DRAG HELPER FUNCTIONS   *
 **********************************/
 
// TODO: position ??
function getDropPosition(piece)
{
	return 'top';
}

function getParentPiece(piece)
{
	//piece<-stackContainer<-relativity<-piece
	return piece.parentNode.parentNode.parentNode;
}

/* Return true if stack of this piece is folded. */
function folded(piece)
{
	var sc = getStackContainer(piece);
	return sc.classList.contains('folded') &!
	       ( sc.getAttribute('data-size') == "1" && sc.childNodes.length == 0 );
}

/* Return true if piece is in a folded stack. */
function inFoldedStack(piece)
{
	return folded(piece) || folded(getParentPiece(piece));
}

function getStackingOrder(piece)
{
	if ( piece.classList.contains('stack-free') )
		return 'free';
	if ( piece.classList.contains('stack-list') )
		return 'list';
	if ( piece.classList.contains('stack-grouped') )
		return 'grouped';
	if ( piece.classList.contains('stack-static') )
		return 'static';
}

/* return index of currently visible face of node. */
//TODO: multi-face
function getVisibleFace(node)
{
	return node.querySelector('.faces').childNodes[0];
}

function getVisibleFaceIndex(node)
{
	return 0;
}

// TODO: exists for future; multiple windows 
function findElement(id)
{
	return document.getElementById(id);
}

// TODO: multiple windows
function getUniqueGroupId(pieceid)
{
	var nodeList = document.querySelectorAll('[data-origid='+pieceid+']');
	var idList = new Array();
	for(var i=0; i<nodeList.length; i++)
		idList[i] = nodeList[i].id;

	for(i=idList.length; i>=0; i--)
	{
		var newId = pieceid+'#'+i;
		if (!(newId in idList))
			return newId;
	}
	throw 'getUniqueGroupId: this is not possible...';
}

function copyIfNeeded(target, piece)
{
	/* TODO: multiple winows 
	if ( target.ownerDocument != piece.ownerDocument )
	{
		newPiece = target.ownerDocument.importNode(piece, true);
	}
	*/
	
	var dl = piece.getAttribute('data-limit');
	if ( dl > 1 )
	{
		var newPiece = piece.cloneNode(true);
		var id = getUniqueGroupId(newPiece.getAttribute('data-origid'));
		newPiece.id = id;
		newPiece.setAttribute('data-limit',1);
		piece.setAttribute('data-limit', dl-1);
		
		setPieceEvents(newPiece);

		return newPiece;
	}
	return piece;
}

function getStackContainer(piece)
{
	return piece.firstElementChild.lastElementChild;
}

function getTotalWidth(style, includeMargin)
{
	var w = style.width + 
	        style.borderLeft + style.borderRight + 
	        style.paddingLeft + style.paddingRight;
	if (includeMargin)
		return w + style.marginLeft + style.marginRight;
	else
		return w;
}

function getTotalHeight(style, includeMargin)
{
	var h = style.height + 
	        style.borderTop + style.borderBottom + 
	        style.paddingTop + style.paddingBottom;
	if (includeMargin)
		return h + style.marginTop + style.marginBottom;
	else
		return h;
}

function getCenter(n)
{
	var ns = window.getComputedStyle(n);
	var nX = ns.left + getTotalWidth(ns,false)/2;
        var nY = ns.top + getTotalHeight(ns,false)/2;
	return {x:nX,y:nY};
}

/* check if p1 is closer to pr than p2 */
function isCloser(p1, p2, pr)
{
	var a2 = Math.pow(Math.abs(p1.x-pr.x));
        var b2 = Math.pow(Math.abs(p1.y-pr.y));
        var c1 = Math.sqrt( a2+b2 );

	a2 = Math.pow(Math.abs(p2.x-pr.x));
        b2 = Math.pow(Math.abs(p2.y-pr.y));
	var c2 = Math.sqrt( a2+b2 );

	return (c1<c2);
}

/* Find out where in the to.stack the piece was dropped */
// TODO: Algorithm is wrong...
function calcDropIndex(dropzone, target, x, y)
{

	//if ( dropzone != target )
//	{
//	}

	var dp = {x:x,y:y};
	var nodes = [getVisibleFaceIndex(target)];
	nodes.push(getStackContainer(target).childNodes);

	/* point closest to drop point */
	var nci=0, ncX=0, ncY=0;
	/* Delta X,Y between middle points of node closest to droppoint and the 
 	 * middle point of the next or previous sibbling of that node which is closer to the drop point.
 	 */
	var dX, dY;

	if (nodes.length == 1)
		throw "should be handled like folded stack.";

	for (var ni=0; ni<nodes.lenght; ni++)
	{
		/* middle points of nodes */
		var n = getCenter(nodes[i]);

		if (!i || isCloser(n, nc, dp))
		{
			/* middle of this node is closer to the drop-point */
			nci = i;
			nc = n;
		}
	}

	var s;

	/* check which sibbiling is closer to drop point */
	if (nci === 0)
		s = getCenter(nodes[nci+1]);
	else if (nci == nodes.length-1)
		s = getCenter(nodes[nci-1]);
	else
	{
		var stn = getCenter(nodes[nci+1]);
		var stp = getCenter(nodes[nci-1]);
		if (isCloser(stn, stp, dp))
			s = stn;
		else 
			s = stp; 
 	}
	dX = Math.abs(nc.x - s.x);
        dY = Math.abs(nc.y - s.y);

	/* insert before or after closest node */
	if (dX > dY) //row
	{
		if(nc.x-dp.x>0)
			return nci;
		else
			return nci+1;
	}
	else //column
	{
		if(nc.y-dp.y>0)
			return nci;
		else
			return nci+1;
	}
}		

function getStackIndex(piece)
{
	for (var k=0,e=piece; e = e.previousSibling; ++k);
	return k;
}

function getCoordinates(piece)
{
	var p = {x:0,y:0};
	var s = piece.style.left;
	p.x = s.substring(0, s.length-2); //strip 'px'
	s = piece.style.top;
	p.y = s.substring(0, s.length-2); //strip 'px'
	return p;
}

function copyPosition(from, to)
{
	var fromP = getParentPiece(from);
	var so = getStackingOrder(fromP);
	var i = getStackIndex(from);
	
	addToStackContainer(fromP, to, i);

	if (so === 'free')
	{
		var p = getCoordinates(from);
		setCoordinates(to, p.x, p.y);
	}
}
/*****************************
 *        DRAG EVENTS        *
 ****************************/
/****************************
 *        DRAG START        *
 ***************************/
function dragStartPiece(e) 
{
	//if ( inFoldedStack(this) )
	//	return true;

	e.stopPropagation(); //don't bubble

	if ( !folded(this) )
	{
		var clone = this.cloneNode( true );
		var sc = getStackContainer( clone );
		sc.parentNode.removeChild( sc );
		// TODO: hide and remove clones.... and move only piece without stack
		document.body.appendChild( clone );
		e.dataTransfer.setDragImage(clone, 0, 0);
	}
	else
	{
		e.dataTransfer.setDragImage(this, 0, 0);
	}
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

	if ( (getStackingOrder(this) == 'free') &&  folded(this) )// may not be needed.
		return true;

	e.preventDefault();
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
	return false;
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
	//var x = e.layerX;
	//var y = e.layerY;
	//if (this.classList.contains('nosubstacks'));
	//if (this.getAttribute('data-size') == '1')
/*
	if (this.getAttribute('data-slimit') == '1')
	{
		e.stopPropagation();
		var to = this;
		var fromid = e.dataTransfer.getData('nodeid');
		var from = copyIfNeeded(to, findElement(fromid));
//TODO: find correct postion to insert new node.
		addToStackContainer(to, from, -1);
		var sc = getStackContainer(from);
		while (sc.firstElementChild)
			addToStackContainer(to, sc.firstElementChild, -1);
	}
*/

	/* If piece is dropped on a list, it should be added to the list if that list is on a free stacking piece */
/*
	if ( getStackingOrder(this) == "list" )
	{
		var p = getParentPiece(this);
		var so = getStackingOrder( p );
		if ( so == "free" || so == "list" )
		{
			//e.stopPropagation();
			//return false;
		}
	}
*/
}

function dropPieceBubble(e)
{
	e.preventDefault(); //needed when image is dragged; prevent from opening image;
	var to = this;


	/* to calculate x,y of drop in relation to target use:
     * getBoundingClientRect i.c.m pageX/pageY
     * We want the x,y position relative to the top,left of 'to'.
     * layerX/layerY is not reliable for this.
     */
	var fromid = e.dataTransfer.getData('nodeid');
	var from = copyIfNeeded(to, findElement(fromid));
	var x = e.layerX;
	var y = e.layerY;

	switch(getStackingOrder(to))
	{
		case 'free':
			/* drop on foled is prohibited, so drop position is irrelevant */
			addToStackContainer(to, from, -1);
			setCoordinates(from, x, y);
			break;
		case 'static': /* drop behaviour for static and grouped is the same. */
		case 'grouped':
			//var group = to.querySelector('[data-origid="'+from.id+'"]');
			/* TODO: Grouping.... */
			/* if leftovers no break */
			break;
		case 'list':
			// Find top of stack
			var sc = getStackContainer( to );
			while ( sc.childNodes.length != 0 )
			{
				to = sc.childNodes[0];
				sc = getStackContainer( to );
			}
			var di = 0;
			if(folded(to))
			{
				addToStackContainer(to, from, -1);
			}
			else
			{
				//di = calcDropIndex(this, to, e.layerX, e.layerY);
				di = -1;
				addToStackContainer(to, from, di);
				// TODO: drop between pieces...
			}
			break;
		default:
			break;		
	}

	e.stopPropagation(); //don't bubble
	e.preventDefault(); //needed when image is dragged; prevent from opening image;
	return false;
}
