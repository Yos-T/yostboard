/*
    * Node.ELEMENT_NODE == 1
    * Node.ATTRIBUTE_NODE == 2
    * Node.TEXT_NODE == 3
    * Node.CDATA_SECTION_NODE == 4
    * Node.ENTITY_REFERENCE_NODE == 5
    * Node.ENTITY_NODE == 6
    * Node.PROCESSING_INSTRUCTION_NODE == 7
    * Node.COMMENT_NODE == 8
    * Node.DOCUMENT_NODE == 9
    * Node.DOCUMENT_TYPE_NODE == 10
    * Node.DOCUMENT_FRAGMENT_NODE == 11
    * Node.NOTATION_NODE == 12
*/
var classes = new Array();
var doc = document;
var xmlDoc = null;
var imgPath = '';

function parseGroup(htmlParent, node)
{
	var clsStr = '';
	for (i in node.childNodes)
	{
		var c = node.childNodes[i];
		switch(c.tagName)
		{
		case 'class':
			clsStr += c.textContent.trim();
			break;
		case 'piece':
			parsePiece(htmlParent, c, clsStr);
			break;
		default:
			break;
		}
	}
}

function parseFace(htmlParent, face)
{
	var el = doc.createElement('div');
	var iCount=0;
	var sCount=0;
	var children = face.childNodes;
	for (var i=0; i<children.length; i++)
	{
		var c = children[i];
		switch( c.nodeName )
		{
		case 'img':
			var img = doc.createElement('img');
			img.setAttribute('src', imgPath + c.textContent.trim());
			iCount++;
			img.setAttribute('class', 'i'+iCount);
			el.appendChild(img);
			break;
		default:
			if (c.nodeType == Node.TEXT_NODE)
			{
				var text = c.textContent.trim();
				if ( text )
				{
					var span = doc.createElement('span');
					sCount++;
					span.setAttribute('class', 's'+sCount);
					span.textContent = text;
					el.appendChild(span);
				}
			}
			break;
		}
	}
	htmlParent.appendChild(el);
}

function parseStacking(htmlPiece, htmlStack, stacking)
{
	//TODO allow/deny constraints
	htmlPiece.setAttribute('draggable', true);

	setPieceEvents(htmlPiece); //from drag.js

	var po = stacking.getElementsByTagName('order')[0].textContent.trim();
	htmlPiece.classList.add('stack-'+po);

/* DO NOT implement stacking limit now
	var lim = stacking.getElementsByTagName('limit')[0];
	if(lim)
		htmlStack.setAttribute('data-slimit',lim.textContent.trim());
	else
		htmlStack.setAttribute('data-slimit',-1);
*/
/* NOT NEEDED
	var sur = stacking.getElementsByTagName('surface')[0];
	if(sur)
		htmlStack.setAttribute('data-size',sur.textContent.trim());
	else
		htmlStack.setAttribute('data-size',1);
*/

}

function parsePiece(parent,node,classStr)
{
	var children = node.childNodes;
	var i;
	var c;
	/* find classes for this piece */
	for (i=0; i<children.length; i++)
	{
		c = children[i];
		if(c.nodeName == 'class')
			classStr += c.textContent.trim();
			//classStr += c.textContents.replace(/^\s+|\s+$/g, '');
	}

	/* apply classes to piece */
	var ca = classStr.split(' ');
	var clsArr = new Array();
	for (i=0; i<ca.length; i++)
	{
		if(ca[i] in classes)
		{
			var obj = classes[ca[i]];
			clsArr.push(obj.cloneNode(true));
		}
	}
	clsArr.push(node.cloneNode(true));
	
	for (i=0; i<clsArr.length; i++)
	{
		var cls = clsArr[i];
		for(var ii=0; ii<cls.childNodes.length; i++)
		{
			var cc = cls.childNodes[ii];
			var orig = node.getElementsByTagName(cc.tagName);
			if (orig.length)
				node.replaceChild(cc ,orig[0]);
			else
				node.appendChild(cc);
		}
	}

	/* Classes applied, now we can parse the piece. */

	var htmlPiece = doc.createElement('div');
		
	var id = node.getAttribute('id');
	htmlPiece.setAttribute('id', id);
	htmlPiece.setAttribute('class', node.tagName +' '+ classStr);

	var label = doc.createElement('span');
	label.setAttribute('class', 'label');
	
	var faces = doc.createElement('div');
	faces.setAttribute('class', 'faces');

	var stack = doc.createElement('div');
	switch(node.tagName) //TODO: should be default state element
	{
	case 'piece':
		stack.setAttribute('class', 'folded stack');
		break;
	case 'location':
	case 'area':
	case 'static':
		stack.setAttribute('class', 'unfolded stack');
		break;
	default:
		break;
	}

	for (i=0; i<children.length; i++)
	{
		c = children[i];
		switch( c.nodeName )
		{
		case 'label':
			label.textContent = c.textContent;
			break;
		case 'stacking':
			parseStacking(htmlPiece, stack, c);
			break;
		case 'face':
			parseFace(faces, c);
			break;
		case 'limit':
			htmlPiece.setAttribute('data-limit', c.textContent.trim());
			break;
		case 'group':
			parseGroup(stack,c);
			break;
		case 'piece':
			parsePiece(stack,c,'');
			break;
		default:
			break;
		}
	}
	var lim = parseInt(htmlPiece.getAttribute('data-limit'),10);
	if (!lim)
		htmlPiece.setAttribute('data-limit', '1');
	else if (lim > 1)
	{
		htmlPiece.setAttribute('id', id+'#0');
		htmlPiece.setAttribute('data-origid', id);
		htmlPiece.classList.add(id);
	}
	
	var rel = doc.createElement('div');
	rel.setAttribute('class','relativity');
	
	rel.appendChild(label);
	rel.appendChild(faces);
	rel.appendChild(stack);
	htmlPiece.appendChild(rel);

	parent.appendChild(htmlPiece);
}

function parseClassDescr(node)
{
	var id = node.getAttribute('name');
	classes[id] = node;
}

function parseGame(gameName)
{

//	netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
//netscape.security.PrivilegeManager.enablePrivilege("UniversalPreferencesRead");

	var fileName = '../games/' + gameName + '/' + gameName + '.xml';

	var req = new XMLHttpRequest(); 
	req.open("GET", fileName, false); 
	req.send(null); 
	xmlDoc = req.responseXML.documentElement;
/*
	var parser = new DOMParser();
	var gameXML = document.getElementById("game-xml").contentDocument;
	xmlDoc = parser.parseFromString(gameXML, "application/xml");
*/	
	imgPath = '../games/'+gameName+'/images/';
	
	var children = xmlDoc.childNodes;
	var parent = document.body;
	for (var i=0; i<children.length; i++)
	{
		var c = children[i];
		switch( c.nodeName )
		{
		case 'title':
			document.title = c.textContent;
			break;
		case 'classDescr':
			parseClassDescr(c);
			break;
		case 'location':
		case 'piece':
		case 'area':
			parsePiece(parent,c,'');
			break;
		case 'group':
			parseGroup(parent,c);
			break;
		default:
			break;
		}
	}
	
	delete classes;
}
