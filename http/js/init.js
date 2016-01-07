function init()
{
	var get = window.location.search;
	var game = get.substring(get.indexOf('game=')+5);
	var end = get.indexOf('&');
	if (end != -1)
		game = game.substring(0,end);

	var head = document.getElementsByTagName('head')[0];
	//Add game stylesheet and javascript
	var css = document.createElement('link');
	css.setAttribute('href', '../games/'+game+'/'+game+'.css');
	css.setAttribute('rel', 'stylesheet');
	css.setAttribute('type', 'text/css');
	head.appendChild(css);
	
	var js = document.createElement('script');
	js.setAttribute('src', '../games/'+game+'/'+game+'.js');
	js.setAttribute('type', 'application/javascript');
	head.appendChild(js);

	parseGame(game);
	
	if (typeof initGame == 'function')
		initGame();

}
