
if (typeof(itc) == "undefined")
{
	var httpReq = null;
	var itc = null;
	httpReq = {
		checkUrlByExpr: function (Url, Expr)
		{
			var match = new RegExp(Expr, "i");
			if (match.test(Url))
				return match;
			return false;
		},

		isInterestingURL: function(URL)
		{
			//http://host/p/750/openWindow/sprintPlan(...)
			const interestingExpr =
				"^https?://.*?/p/\\d+/openWindow/sprintPlan";

			console.log("[ITC] Is the URL [" + URL + "] interesting?");

			if (!this.checkUrlByExpr(URL, interestingExpr))
			{
				console.log("[ITC] No");
				return false;
			}

			console.log("[ITC] Yes");
			return true;
		},

		isSprintPlanURL: function(URL)
		{
			//http://host/p/750/openWindow/sprintPlan
			const sprintPlanExpr =
				"^https?://.*?/p/\\d+/openWindow/sprintPlan$";
			return !!this.checkUrlByExpr(URL, sprintPlanExpr);
		},

		isTaskURL: function(URL)
		{
			//http://host/p/750/openWindow/sprintPlan/add/753/?story.id=urgent
			//http://host/p/750/openWindow/sprintPlan/add/753/?story.id=recurrent
			//http://host/p/750/openWindow/sprintPlan/add/753/?story.id=7086
			const taskExpr =
				"^https?://(.*?)/p/(\\d+)/openWindow/sprintPlan/add/(\\d+)/\\\?story\.id=(.*?)$";
			return this.checkUrlByExpr(URL, taskExpr);
		},

		observe: function (aSubject, aTopic, aData)
		{
			if (aTopic != 'http-on-modify-request')
				return ;

            var oHttp = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
			var link = oHttp.URI.spec;

			if (!this.isInterestingURL(link))
			{
				return ;
			}

			if (itc.isWaiting() && this.isSprintPlanURL(link))
			{
				console.log("[ITC] sprintPlan reload will be cancelled.");
				aSubject.cancel(Components.results.NS_BINDING_ABORTED);
				return ;
			}

			var taskMatch = this.isTaskURL(link);

			if (!!taskMatch)
			{
				var matchingUrlExec = taskMatch.exec(link);

				console.log("[ITC] Connection to task page will be cancelled.");
				aSubject.cancel(Components.results.NS_BINDING_ABORTED);

				if (matchingUrlExec == null)
				{
					console.log("[ITC] Could not retrieve data");
				}
				else
				{
					window.openDialog("chrome://icescrumtaskcreator/content/task.xul",
										"taskDialog", "centerscreen",
										matchingUrlExec[0],
										matchingUrlExec[3],
										matchingUrlExec[4],
										null);
				}
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
			return !(btn.getAttribute("state") == "false");
		},

		isWaiting: function ()
		{
			const btn = document.getElementById("itc-toolbar-button");
			return btn.getAttribute("state") == "waiting";
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

		toggleBatchingMode: function (ev)
		{
			const btn = document.getElementById("itc-batch-mode");

			// checked already uptodate before function be called
			if (btn.getAttribute("checked") == "true")
			{
				window.openDialog("chrome://icescrumtaskcreator/content/task.xul",
									"taskDialog", "centerscreen",
									"Invalid data, openWindow,",
									"will be used here to fill it",
									"because it wont be used",
									"UPDATE",
									null);
			}

			ev.stopPropagation();
		},

		isBatchModeOn: function()
		{
			if (typeof(window.opener) == "undefined" || window.opener == null)
				return (document.getElementById("itc-batch-mode").getAttribute("checked") == "true");
			return (window.opener.document.getElementById("itc-batch-mode").getAttribute("checked") == "true");
		},
	};
}

