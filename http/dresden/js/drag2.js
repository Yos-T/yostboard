function debug(str)
{
//	document.getElementById('debug').innerHTML += '<br/>' + str;
}

function isStack(n)
{
	return ( n.getAttribute('class') == 'stack' || n.getAttribute('class') == 'stackUnfold')
}


function setCookie(c_name,value,expiredays)
{
var exdate=new Date();
exdate.setDate(exdate.getDate()+expiredays);
document.cookie=c_name+ "=" +escape(value)+
((expiredays==null) ? "" : ";expires="+exdate.toUTCString());
}

function getCookie(c_name)
{
if (document.cookie.length>0)
  {
  c_start=document.cookie.indexOf(c_name + "=");
  if (c_start!=-1)
    {
    c_start=c_start + c_name.length+1;
    c_end=document.cookie.indexOf(";",c_start);
    if (c_end==-1) c_end=document.cookie.length;
    return unescape(document.cookie.substring(c_start,c_end));
    }
  }
return "";
}

function savePos()
{
	var str = '';
	nodes = document.getElementById('counterSection').childNodes;
	for ( i=0; i<nodes.length; i++ )
	{
		n = nodes[i];
		if (n.nodeType != Node.ELEMENT_NODE)
			continue;
		debug('Nodeid: ' +n.id +';name :'+ n.nodeName);
		if (isStack(n))
		{
			str += 's,'+n.style.left+','+n.style.top;
			snodes = n.childNodes[0].childNodes;
			for ( ii=0; ii<snodes.length; ii++ )
			{
				sn = snodes[ii];
				cn = sn.childNodes;
				src=0;
				for ( src=0; src<cn.length; src++ )
				{
					if ( cn[src].nodeType == Node.ELEMENT_NODE )
					{
						cl = cn[src].getAttribute('class');
						if ( cl && cl.search('hidden') == -1 )
							break;
					}
				}
				str += ','+sn.id+','+src;
			}
			str += ';';
			debug('stack: '+str);
		}
		else
		{
			str += n.id +','+n.style.left+','+n.style.top+';';
			debug('counter: '+str);
		}
	}
	setCookie('pos',str,null);
	debug('save: ' + str);
}

function restorePos()
{
	str = getCookie('pos');
	debug('RESTORE:'+str);
	items = str.split(';');
	highid = 0;
	container = document.getElementById('counterSection');
debug('ITEMS: '+items[0] + ';  length:' +items.length);
	for ( i=0; i<items.length; i++ )
	{
		if(!items[i])
			continue;
		debug('ADD ITEM: '+items[i]);
		info = items[i].split(',');
		x = info[1];
		y = info[2];
		
		if ( info[0] == 's' ) //stack
		{
			stack = document.createElement('div');
			stack.setAttribute('class','stack');
			stack.style.left = x;
			stack.style.top = y;
			stackContainer = document.createElement('div');
			stackContainer.setAttribute('class','stackContainer');
			stack.appendChild(stackContainer);
				
			for ( ii=3; ii<info.length; ii+=2)
			{
				cname = info[ii].substring(0,info[ii].lastIndexOf('_'));
				cidnr = info[ii].substr(info[ii].lastIndexOf('_')+1);
				if ( cidnr > highid )
					highid = cidnr;
				src = parseInt(info[ii+1]);
				n = document.getElementById(cname);
				newNode = importNode(n);
				newNode.setAttribute('id',cname+'_'+cidnr);
				setActiveSrc(newNode, src);
				newNode.style.left = 5*((ii-3)/2) + 'px';
				newNode.style.top = 5*((ii-3)/2) + 'px';
				stackContainer.appendChild(newNode);
			}
			container.appendChild(stack);
			debug('ADD STACK:' + stack);
		}
		else //counter
		{
			name = info[0].substring(0,info[0].lastIndexOf('_'));
			idnr = parseInt(info[0].substr(info[0].lastIndexOf('_')+1));		
			if ( idnr > highid )
				highid = idnr;
			src = parseInt(info[3]);
			n = document.getElementById(name);
			newNode = importNode(n);
			newNode.setAttribute('id',name+'_'+idnr);
			newNode.style.left = x;
			newNode.style.top = y;
			container.appendChild(newNode);
			debug('ADD COUNTER:' + newNode);
		}
	}
	debug('DONE RESTORE');
	container.setAttribute('data-index',highid);
}

function setActiveSrc(node, src)
{
}

function setCounterEvents(node)
{
	node.addEventListener( "dragstart", dStartCounter, false );
	node.addEventListener( "dragend", function(){}, false );
	node.addEventListener( "drag", function(){}, false );
	
	node.addEventListener( "dragover", dOverCounter, false );
	node.addEventListener( "dragenter", function(){}, false );
	node.addEventListener( "dragleave", function(){}, false );
	node.addEventListener( "drop", dDropOnCounter, false );
	
	node.addEventListener( "click", clickCounter, false );
}

function inFoldedStack(node)
{
	return ( node.parentNode.parentNode.getAttribute('class') == 'stack' )
}

function inUnfoldedStack(node)
{
	return ( node.parentNode.parentNode.getAttribute('class') == 'stackUnfold' )
}

function importNode(node)
{
	container = document.getElementById('counterSection');
	newNode = document.importNode(node,true);
	id = node.getAttribute('id');

	idnr = parseInt(container.getAttribute('data-index'))+1;
	container.setAttribute('data-index',idnr);
	
	limit = parseInt(node.getAttribute('data-limit'))-1;
	if (!limit)
		node.style.visibility = 'hidden';
	node.setAttribute('data-limit', limit);
	
	newNode.setAttribute('data-counterid',id);
	newNode.setAttribute('id',id+'_'+idnr);

	setCounterEvents(newNode);

	return newNode;
}

function correctStackContainer(c)
{
	for (i=0; i<c.childNodes.length; i++)
	{
		c.childNodes[i].style.top = 5*i + 'px';
		c.childNodes[i].style.left = 5*i + 'px';
	}
}
function clickMap(e)
{
	nodes = document.getElementsByClassName('stackUnfold');
	for(i=nodes.length-1;i>=0;i--)
		nodes[i].setAttribute('class','stack');
}
function clickCounter(e)
{
	e.stopPropagation(); //don't bubble
	
	if ( inFoldedStack(this) )
		this.parentNode.parentNode.setAttribute('class','stackUnfold');
	else
		debug('click counter');
}

function dOverCounter(e)
{
	var dragObject = document.getElementById(e.dataTransfer.getData('nodeid'));
	if (!dragObject)
		return false;
	e.preventDefault();
}

function dOverMap(e)
{ 
	var dragObject = document.getElementById(e.dataTransfer.getData('nodeid'));
	if (!dragObject)
		return false;
	e.preventDefault();

	scrollSpeed=40;
	scrollMargin=10;

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

	return false;
	
}

function newStack(to,from)
{
	//create new stack
	container = document.getElementById('counterSection');
	index = parseInt(container.getAttribute('data-index'))+1;
	container.setAttribute('data-index',index)

	stack = document.createElement('div');
	stack.setAttribute('class','stack');
	stack.style.top = to.style.top;
	stack.style.left = to.style.left;
	stackContainer = document.createElement('div');
	stackContainer.setAttribute('class','stackContainer');
	stack.appendChild(stackContainer);

	container.appendChild(stack);

	stackContainer.appendChild(to);
	stackContainer.appendChild(from);
	correctStackContainer(stackContainer);
}

function dDropOnCounter(e)
{
	e.stopPropagation(); //don't bubble
	from = document.getElementById(e.dataTransfer.getData('nodeid'));
	to = this;
	
	ffs = inFoldedStack(from); // folded
	fus = inUnfoldedStack(from); // unfolded
	flc = (!ffs &! fus); // loose counter
	tfs = inFoldedStack(to);
	tus = inUnfoldedStack(to);
	tlc = (!tfs &! tus);

	// Check if import is needed
	if ( flc &! from.getAttribute('data-counterid') )
		from = importNode(from);

	// Dropped on self
	if ( from == to )
	{
		if ( tlc )
		{
			x = parseInt(to.style.left.substring(0, to.style.left.length-2)) + e.layerX;
			y = parseInt(to.style.top.substring(0, to.style.top.length-2)) + e.layerY;
			to.style.left = x + 'px';
			to.style.top = y + 'px';
		}
	}
	//from counter to counter
	else if ( flc && tlc )
	{
		newStack(to,from);
	}
	//from counter to folded stack &&
	//from counter to unfolded stack
	else if ( flc && ( tfs || tus ) )
	{
		c = to.parentNode;
		if ( tus && ( e.layerY < to.offsetTop+to.offsetHeight/2 ) )
			ins = to;
		else if (tus)
			ins = to.nextSibling;
		else // tfs
			ins = null;
		c.insertBefore(from,ins);
		correctStackContainer(c);
	}
	//from folded stack to counter
	else if ( ffs && tlc )
	{
		c = from.parentNode;
		s = c.parentNode;
		s.style.top = to.style.top;
		s.style.left = to.style.left;
		c.insertBefore(to, c.firstChild);
		// correct positions
		correctStackContainer(c);
	}
	//from folded stack to folded stack &&
	//from folded stack to unfolded stack
	else if ( ffs && (tfs || tus) )
	{
		fc = from.parentNode;
		fs = fc.parentNode;
		tc = to.parentNode;
	
		if (tfs && fc == tc)
			return;
		if ( tus && ( e.layerY < to.offsetTop+to.offsetHeight/2 ) )
			ins = to;
		else if (tus)
			ins = to.nextSibling;
		else // tfs
			ins = null;
	
		for (i=fc.childNodes.length-1; i>=0; i--)
			ins = tc.insertBefore(fc.childNodes[i],ins);

		correctStackContainer(tc);
		fs.parentNode.removeChild(fs);
	}
	// from unfolded stack to counter
	else if ( fus && tlc )
	{
		c = from.parentNode;
		newStack(to,from);
		if ( c.childNodes.length == 1 )
		{
			ln = c.childNodes[0];
			s = c.parentNode;
			ln.style.top = s.style.top;
			ln.style.left = s.style.left;
			s.parentNode.appendChild(ln);
			s.parentNode.removeChild(s);
		}
	}
	// from unfolded stack to folded stack &&
	// from unfolded stack to unfolded stack
	else if ( fus && (tfs || tus) )
	{
		tc = to.parentNode;
		fc = from.parentNode;
		if ( tus && ( e.layerY < to.offsetTop+to.offsetHeight/2 ) )
			ins = to;
		else if (tus)
			ins = to.nextSibling;
		else // tfs
			ins = null;
		tc.insertBefore(from,ins);
		correctStackContainer(tc);
		correctStackContainer(fc);
		
		if ( fc.childNodes.length == 1 )
		{
			ln = fc.childNodes[0];
			fs = fc.parentNode;
			ln.style.top = fs.style.top;
			ln.style.left = fs.style.left;
			fs.parentNode.appendChild(fc.childNodes[0]);
			fs.parentNode.removeChild(fs);
		}
	}
	else
		alert('You dropped something');
}

function dDropOnMap(e) 
{
	e.stopPropagation(); // stops the browser from redirecting
	node = document.getElementById(e.dataTransfer.getData('nodeid'));
	if ( inFoldedStack(node) )
	{
		stack = node.parentNode.parentNode;
		stack.style.left = e.layerX + 'px';
		stack.style.top = e.layerY + 'px';
	}
	else
	{
		container = document.getElementById('counterSection');
		if ( node.getAttribute('data-counterid') )
		{
			// node is on the map, but my be in an unfolded stack
			if ( inUnfoldedStack(node) )
			{
				stackContainer = node.parentNode;
				container.appendChild(node);
				if ( stackContainer.childNodes.length == 1 )
				{
					stack = stackContainer.parentNode;
					lone = stackContainer.childNodes[0];
					lone.style.left = stack.style.left;
					lone.style.top = stack.style.top;
					container.appendChild(lone);
					stack.parentNode.removeChild(stack);
				}
				else
					correctStackContainer(stackContainer);
			}
			node.style.left = e.layerX + 'px';
			node.style.top = e.layerY + 'px';
		}
		else
		{
			newNode = importNode(node);
			newNode.style.left = e.layerX + 'px';
			newNode.style.top = e.layerY + 'px';
			container.appendChild(newNode);
debug('NEW: x:'+newNode.style.left+' y:'+newNode.style.top );
		}
	}
	
	savePos();
}

function dStartCounter(e) 
{
	if ( inFoldedStack(this) )
	{
		stack = this.parentNode;
		//e.dataTransfer.setDragImage(stack, stack.clientWidth/2, stack.clientHeight/2);
		e.dataTransfer.setDragImage(stack, 0, 0);
	}
	else
	{
		//e.dataTransfer.setDragImage(this, this.clientWidth/2, this.clientHeight/2);
		e.dataTransfer.setDragImage(this, 0, 0);
	}
	e.dataTransfer.dropEffect = 'move';
	e.dataTransfer.setData('nodeid', this.id);
}

function initDrag()
{
	var dragThings = document.getElementsByClassName("draggable");
	for (var i=0; i<dragThings.length; i++)
	{
		setCounterEvents(dragThings[i]);
	}
	dragThings = null;
	
	mapSection = document.getElementById("mapSection");
	mapSection.addEventListener( "dragover", dOverMap, false );
	mapSection.addEventListener( "dragenter", function(){}, false );
	mapSection.addEventListener( "dragleave", function(){}, false );
	mapSection.addEventListener( "drop", dDropOnMap, false );
	mapSection.addEventListener( "click", clickMap, false );

}

function init()
{
	initDrag();
	if (initGame)
		initGame();
	restorePos();
}
