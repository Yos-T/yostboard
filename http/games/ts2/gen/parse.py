import sys
import xml.dom.minidom

# Globals
gameName = sys.argv[1];
baseFile = 'base.html'
gameFile = 'xml/' + gameName + '.xml'
document = None
xmlDoc = None

def cleanup(node):
	for child in reversed(node.childNodes):
		cleanup(child)

	if node.nodeType == node.ELEMENT_NODE:
		if node.hasAttribute('id'):
			node.setIdAttribute('id')
	elif node.nodeType == node.TEXT_NODE :
		node.nodeValue = node.nodeValue.strip()
		if node.nodeValue == '':
			node.parentNode.removeChild(node)

def addTitle(title,pn):
	new = document.createElement('title')
	text = document.createTextNode(title.childNodes[0].nodeValue.strip())
	new.appendChild(text)
	#check for title node
	old = pn.getElementsByTagName('title')
	if old.length:
		old[0].parentNode.replaceChild(new,old[0])
	else:
		pn.appendChild(new)

def addScript(script,pn): 
	el = document.createElement('script')
	el.setAttribute('type','application/javascript')
	el.setAttribute('src',script.childNodes[0].nodeValue.strip())
	pn.appendChild(el)

def addCss(css,pn): 
	el = document.createElement('link')
	el.setAttribute('type','text/css')
	el.setAttribute('rel','stylesheet')
	el.setAttribute('href',css.childNodes[0].nodeValue.strip())
	pn.appendChild(el)

def addSrc(src,pn):
	type = src.getAttribute('type')
	if type == 'img':
		el = document.createElement('img')
		el.setAttribute('src',src.childNodes[0].nodeValue.strip())
		el.setAttribute('alt','map')
		pn.appendChild(el)
	elif type == 'html':
		html = xml.dom.minidom.parseString('<html><div>' + src.childNodes[0].nodeValue.strip() + '</div></html>')
		pn.appendChild(html.documentElement.childNodes[0])
		
# Map is always added to the mapSection
def addMap(map):
	mapSection = document.getElementById('mapSection')
	src = map.getElementsByTagName('src')[0]
	addSrc(src,mapSection)
	
def addCountersheet(sheet,pn):
	sheetNode = document.createElement('div')
	
	# <counterdefaults>
	defaults = {}
	for node in sheet.getElementsByTagName('counterDefaults')[0].childNodes:
		if node.nodeType == xml.dom.minidom.Node.ELEMENT_NODE:
			defaults[node.nodeName] = node.childNodes[0].nodeValue.strip()

	# <counter>
	for counter in sheet.getElementsByTagName('counter'):
		newCounter = document.createElement('a')
		newCounter.setAttribute("href",'#')
		newCounter.setAttribute("onclick",'return false')
		counterId = counter.getAttribute('id')
		newCounter.setAttribute('id',counterId)
		newCounter.setIdAttribute('id')
		
		settings = defaults.copy()

		first = True
		for node in counter.childNodes:
			# <src>
			if node.nodeName == "src":
				addSrc(node,newCounter)
				if first:
					first = False
				else:
					newCounter.lastChild.setAttribute('class','hidden')	
			elif node.nodeType == xml.dom.minidom.Node.ELEMENT_NODE:
				settings[node.nodeName] = node.childNodes[0].nodeValue.strip()

		settings['class'] += ' draggable'
		if settings['stackable'] == "true":
			settings['class'] += ' dropZone'

		newCounter.setAttribute('class',settings['class'])
		newCounter.setAttribute('draggable','true')
		newCounter.setAttribute('data-limit',settings['limit'])
		sheetNode.appendChild(newCounter)
	pn.appendChild(sheetNode)

### Main ###
document = xml.dom.minidom.parse(baseFile)
xmlDoc = xml.dom.minidom.parse(gameFile)
cleanup(document.documentElement)

#process documents
head = document.getElementsByTagName('head')[0]
body = document.getElementsByTagName("body")[0]

for node in xmlDoc.documentElement.childNodes:
	if node.nodeName == 'title':
		addTitle(node, head)
	elif node.nodeName == 'script':
		addScript(node,head)
	elif node.nodeName == 'css':
		addCss(node,head)
	elif node.nodeName == 'map':
		addMap(node)
	elif node.nodeName == 'countersheet':
		addCountersheet(node, body)

# add game specific elements
try:
	game = __import__('games.'+gameName, fromlist= [gameName])
	game.addGameSpecific(document)
except:
	pass

# Force endtag for script tags (startend tag doesn't work)
for node in document.getElementsByTagName('script'):
	node.appendChild(document.createTextNode(' '))
# Force endtag for div tags (startend tag doesn't work)
for node in document.getElementsByTagName('div'):
	if node.childNodes.length ==0:
	        node.appendChild(document.createTextNode(' '))

#print DOM
print (document.toprettyxml())

