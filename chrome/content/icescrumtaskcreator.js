
if (typeof(itc) == "undefined")
{
	var httpReq = null;
	var itc = null;
	httpReq = {
		observe: function (aSubject, aTopic, aData)
		{
			if (aTopic != 'http-on-modify-request')
				return ;

            var oHttp = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);

			//http://host/p/750/openWindow/sprintPlan/add/753/?story.id=urgent
			//http://host/p/750/openWindow/sprintPlan/add/753/?story.id=recurrent
			//http://host/p/750/openWindow/sprintPlan/add/753/?story.id=7086
			const urlExpr = 
				"^https?://(.*?)/p/(\\d+)/openWindow/sprintPlan/add/(\\d+)/\\\?story\.id=(.*?)$";
			var matchingUrl = new RegExp(urlExpr, "i");

			console.log("Is the URL [" + oHttp.URI.spec + "] a new task URL of IceScrum?");

			if (matchingUrl.test(oHttp.URI.spec))
			{
				var matchingUrlExec = matchingUrl.exec(oHttp.URI.spec);

				console.log("Yes. The new connection will be cancelled.");
				aSubject.cancel(Components.results.NS_BINDING_ABORTED);

				if (matchingUrlExec == null)
				{
					alert("Ohhh :-(");
				}
				else
				{
					window.openDialog("chrome://icescrumtaskcreator/content/task.xul",
										"taskDialog", "centerscreen",
										matchingUrlExec[0],
										matchingUrlExec[1],
										matchingUrlExec[2],
										matchingUrlExec[3],
										matchingUrlExec[4],
										null);
				}
			}
			else
			{
				console.log("No");
			}
		}
	};
	itc = {
		get prefs()
		{
			return Components.classes["@mozilla.org/preferences-service;1"]
                       .getService(Components.interfaces.nsIPrefService)
                       .getBranch("extensions.icescrumtaskcreator.");
		},

		isActivate: function ()
		{
			const btn = document.getElementById("itc-toolbar-button");
			return btn.getAttribute("state") == "true";
		},

		toggleState: function ()
		{
			if (!this.isActivate())
			{
				this.activate();
			}
			else
			{
				this.deactivate();
			}
		},

		toggleButton: function (ev)
		{
			this.toggleState();
			ev.stopPropagation();
		},

		showPreferences: function (ev)
		{
			const Cu = Components.utils;
			const {Services} = Cu.import('resource://gre/modules/Services.jsm');
			const uri_pref =
				"addons://detail/icescrumtaskcreator_rlucca@gmail.com/preferences";
			// Open the add-on's preference panel
			Services.wm.getMostRecentWindow('navigator:browser')
				.BrowserOpenAddonsMgr(uri_pref);
			ev.stopPropagation();
		},

		_changeButton: function(newState)
		{
			var btn = document.getElementById("itc-toolbar-button");
			btn.setAttribute("state", newState);
		},

		activate: function()
		{
			console.log("[ITC] adding listener of watching HTTP requests");
			Components.utils.import('resource://gre/modules/Services.jsm');
			try {
				Services.obs.addObserver(httpReq, "http-on-modify-request", false);
				this._changeButton(true);
			} catch (e) {
				console.log("[ITC] failed to add observer");
			}
		},

		deactivate: function()
		{
			console.log("[ITC] removing listener of watching HTTP requests");
			Components.utils.import('resource://gre/modules/Services.jsm');
			try {
				Services.obs.removeObserver(httpReq, "http-on-modify-request");
				this._changeButton(false);
			} catch (e) {
				console.log("[ITC] failed to remove observer");
			}
		},
	};
}

