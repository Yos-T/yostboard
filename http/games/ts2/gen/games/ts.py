regions = \
{ \
	"Central America": \
		{ \
		"Costa_Rica": '3', \
		"Cuba": '3', \
		"Dominican_Republic": '1', \
		"El_Salvador": '1', \
		"Guatemala": '1', \
		"Haiti": '1', \
		"Honduras": '2', \
		"Mexico": '2', \
		"Nicaragua": '1', \
		"Panama": '2' \
		} \
	, \
	"Afrika": \
		{  \
		"Algeria": '2', \
		"Angola": '1', \
		"Botswana": '2', \
		"Cameroon": '1', \
		"Ethiopia": '1', \
		"Ivory_Coast": '2', \
		"Kenya": '2', \
		"Morocco": '3', \
		"Nigeria": '1', \
		"Saharan_States": '1', \
		"SE_African_States": '1', \
		"Somalia": '2', \
		"South_Africa": '3', \
		"Sudan": '1', \
		"Tunisia": '2', \
		"West_African_States": '2', \
		"Zaire": '1', \
		"Zimbabwe": '1' \
		} \
	, \
	"South America": \
		{ \
		"Argentina": '2', \
		"Bolivia": '2', \
		"Brazil": '2', \
		"Chile": '3', \
		"Colombia": '1', \
		"Ecuador": '2', \
		"Paraguay": '2', \
		"Peru": '2', \
		"Uruguay": '2', \
		"Venezuela": '2' \
		} \
	, \
	"Asia": \
		{ \
		"Afghanistan": '2', \
		"Australia": '4', \
		"Burma": '2', \
		"India": '3', \
		"Indonesia": '1', \
		"Japan": '4', \
		"Laos_Cambodia": '1', \
		"Malaysia": '2', \
		"N_Korea": '3', \
		"Pakistan": '2', \
		"Philippines": '2', \
		"S_Korea": '3', \
		"Taiwan": '3', \
		"Thailand": '2', \
		"Vietnam": '1'  \
		} \
	, \
	"Europe": \
		{ \
		"Austria": '4', \
		"Benelux": '3', \
		"Bulgaria": '3', \
		"Canada": '4', \
		"Czechoslovakia": '3', \
		"Denmark": '3', \
		"E_Germany": '3', \
		"Finland": '4', \
		"France": '3', \
		"Greece": '2', \
		"Hungary": '3', \
		"Italy": '2', \
		"Norway": '4', \
		"Poland": '3', \
		"Romania": '3', \
		"Spain_Portugal": '2', \
		"Sweden": '4', \
		"Turkey": '2', \
		"UK": '5', \
		"W_Germany": '4', \
		"Yugoslavia": '3' \
		} \
	, \
	"Middle East": \
		{ \
		"Egypt": '2', \
		"Gulf_States": '3', \
		"Iran": '2', \
		"Iraq": '3', \
		"Israel": '4', \
		"Jordan": '2', \
		"Lebanon": '1', \
		"Libya": '2', \
		"Saudi_Arabia": '3', \
		"Syria": '2' \
		} \
}

def addGameSpecific(document):
	mapArea = document.getElementById('mapSection')
	gameArea = document.createElement('div')
	for regionName, countries in regions.items():
		regionNode = document.createElement('div')
		regionNode.setAttribute('id', regionName)
		regionNode.setIdAttribute('id')
		for countryName, stability in countries.items():
			countryNode = document.createElement('div')
			countryNode.setAttribute('class','country')
			countryNode.setAttribute('id',countryName)
			countryNode.setIdAttribute('id')
			countryNode.setAttribute('data-stability',stability)
			
			usaNode = document.createElement('input')
			usaNode.setAttribute('type','text')
			usaNode.setAttribute('maxLength','2')
			usaNode.setAttribute('id',countryName + '_a')
			usaNode.setIdAttribute('id')
			usaNode.setAttribute('class','inf unc_usa')
			#usaNode.setAttribute('onchange','infChange()')
			countryNode.appendChild(usaNode);
		
			ussrNode = document.createElement('input')
			ussrNode.setAttribute('type','text')
			ussrNode.setAttribute('maxLength','2')
			ussrNode.setAttribute('id',countryName + '_r')
			ussrNode.setIdAttribute('id')
			ussrNode.setAttribute('class','inf unc_ussr')
			#ussrNode.setAttribute('onchange','infChange()')
			countryNode.appendChild(ussrNode)
			
			regionNode.appendChild(countryNode)
	
		gameArea.appendChild(regionNode)
	mapArea.appendChild(gameArea)
