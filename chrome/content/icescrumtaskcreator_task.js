if (typeof(window.arguments) == "undefined")
{
	window.arguments = ["http://rlucca.homeunix.org/p/666/openWindow/sprintPlan/add/999/?story.id=010", "http://rlucca.homeunix.org", "666", "999", "010"]
}

function dlgCancel()
{
	if (isActivate()) changeButton("true");
	return true;
}

function dlgAccept()
{
	const Uri = window.arguments[0];
	const backlogId = window.arguments[1];
	const storyId = window.arguments[2];
	const type = window.arguments[3];
	const referer = Uri.substr(0, Uri.indexOf("openWindow"));
	const postUrl = referer + "task/save";
	var objTitle = document.getElementById("itc_title");

	if (isActivate()) changeButton("true");

	if (objTitle.value.length <= 3)
	{
		alert(objTitle.getAttribute("onerrorDisplay"));
		return false;
	}

	var data = "task.parentStory.id=" + encodeURI(storyId)
				+ "&task.sprint.id=" + encodeURI(backlogId)
				+ "&task.color=" + encodeURI(document.getElementById("itc_color").value)
				+ "&task.estimation=" + encodeURI(document.getElementById("itc_hour").value)
				+ "&task.name=" + encodeURI(document.getElementById("itc_title").value)
				+ "&task.description=" + encodeURI(document.getElementById("itc_desc").value);

	var showDivError = function() {
		alert(document.getElementById("divError").textContent);
	}

	var request = new XMLHttpRequest();
	request.onreadystatechange=function() {
		if (request.readyState==4) {
			console.log("IceScrum answered status [" + request.status + "]");
			console.log("IceScrum answered statusText [" + request.statusText + "]");
			console.log("IceScrum answered text [" + request.responseText + "]");
			if ((request.status/100) == 2 || request.statusText == "OK")
			{
				window.close();
			}
			else
			{
				showDivError();
			}
		}
	}
	request.addEventListener("error", showDivError, false);
	request.addEventListener("abort", showDivError, false);

	request.open("POST", postUrl);
	//request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	request.send(data);
	return false;
}

function itc_load_defaults()
{
	document.getElementById("itc_color").value = itc.prefs.getCharPref("task.color");
	document.getElementById("itc_hour").value = itc.prefs.getIntPref("task.hour");
	if (isActivate()) changeButton("waiting");

	// URL will change, but because the state it will not reload!
	var sprintPlan = new String(window.opener.content.location);
	sprintPlan = sprintPlan.substr(0, sprintPlan.indexOf("/add"));
	window.opener.content.location = sprintPlan;
}

function isActivate()
{
	return !(window.opener.document
				.getElementById("itc-toolbar-button")
				.getAttribute("state") == "false") || false;
}
function changeButton(newState)
{
	window.opener.document
		.getElementById("itc-toolbar-button")
		.setAttribute("state", newState);
}

window.addEventListener("load", function load(event){
    window.removeEventListener("load", load, false); //remove listener, no longer needed
    itc_load_defaults();
	document.getElementById("itc_title").focus();
},false);
