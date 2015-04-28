if (typeof(window.arguments) == "undefined")
{
	window.arguments = ["http://rlucca.homeunix.org/p/666/openWindow/sprintPlan/add/999/?story.id=010", "http://rlucca.homeunix.org", "666", "999", "010"]
}

function dlgCancel()
{
	return true;
}

function dlgAccept()
{
	const Uri = window.arguments[0];
	const server = window.arguments[1];
	const projectId = window.arguments[2];
	const backlogId = window.arguments[3];
	const storyId = window.arguments[4];
	const referer = Uri.substr(0, Uri.indexOf("openWindow"));
	const postUrl = referer + "task/save";
	var objTitle = document.getElementById("itc_title");

	if (objTitle.value.length <= 3)
	{
		alert(objTitle.getAttribute("onerrorDisplay"));
		return false;
	}

	var data = "task.parentStory.id=" + escape(storyId)
				+ "&task.sprint.id=" + escape(backlogId)
				+ "&task.color=" + escape(document.getElementById("itc_color").value)
				+ "&task.estimation=" + escape(document.getElementById("itc_hour").value)
				+ "&task.name=" + escape(document.getElementById("itc_title").value)
				+ "&task.description=" + escape(document.getElementById("itc_desc").value);

	var divF = function() {	document.getElementById("divError").innerHTML = "Ops... :-("; }

	var request = new XMLHttpRequest();
	request.onreadystatechange=function() {
		if (request.readyState==4) {
			var obj = JSON.parse(request.responseText);
			if (typeof(obj.notice) == "object" && typeof(obj.notice.text) != "undefined")
			{
				document.getElementById("divError").innerHTML = obj.notice.text;
			}
			else
			{
				document.getElementById("divError").innerHTML = "Ok";
				window.close();
			}
		}
	}
	request.addEventListener("error", divF, false);
	request.addEventListener("abort", divF, false);

	request.open("POST", postUrl);
	//request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	request.send(data);
	return false;
}

function itc_load_defaults()
{
	document.getElementById("itc_color").value = itc.prefs.getCharPref("task.color");
	document.getElementById("itc_hour").value = itc.prefs.getIntPref("task.hour");
}

window.addEventListener("load", function load(event){
    window.removeEventListener("load", load, false); //remove listener, no longer needed
    itc_load_defaults();
	document.getElementById("itc_title").focus();
},false);
