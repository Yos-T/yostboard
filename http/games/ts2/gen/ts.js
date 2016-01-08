function infChange()
{
	var countryName = this.parentNode.id;
	var stability = this.parentNode.getAttribute('data-stability');
	var sibNode = this.nextElementSibling;
	if (!sibNode) { sibNode = this.previousElementSibling; }
	
	if ( this.value - sibNode.value >= stability )
	{
		this.className = this.className.replace("unc_", "con_");
		sibNode.className = sibNode.className.replace("con_", "unc_");
	}
	else if ( sibNode.value - this.value >= stability )
	{
		this.className = this.className.replace("con_", "unc_");
		sibNode.className = sibNode.className.replace("unc_", "con_");
	}
	else
	{
		this.className = this.className.replace("con_", "unc_");
		sibNode.className = sibNode.className.replace("con_", "unc_");
	}
}

function initGame()
{
	inf = document.getElementsByClassName('inf');
	for (i=0;i<inf.length;i++)
		inf[i].addEventListener ( "change", infChange, false );
}