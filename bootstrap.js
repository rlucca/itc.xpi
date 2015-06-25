/********** IMPORTS **********/
const Cu = Components.utils;
const Ci = Components.interfaces;
//Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource:///modules/CustomizableUI.jsm");
Cu.importGlobalProperties(["XMLHttpRequest"]);

/********** BOOTSTRAP API **********/
function install(parms, reason) {}
function uninstall(parms, reason) {}

function startup(parms, reason)
{
	console.log("p [" + parms + "]");
	console.log("r [" + reason + "]");
	forEachOpenWindow(loadIntoWindow);
	Services.wm.addListener(WindowListener);
}

function shutdown(parms, reason)
{
	if (reason == APP_SHUTDOWN) /* application is shutting down? */
		return ;

	Services.wm.removeListener(WindowListener);

	console.log("maybe, call here a destructor...");
	console.log("'remove' from toolbar too because can be a uninstall");
	console.log("p [" + parms + "]");
	console.log("r [" + reason + "]");
}

/********** WINDOW LISTENER **********/
var WindowListener =
{
    onOpenWindow: function(xulWindow)
    {
        var window = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                              .getInterface(Ci.nsIDOMWindow);
        function onWindowLoad()
        {
            window.removeEventListener("load",onWindowLoad);
            if (window.document.documentElement.getAttribute("windowtype") == "navigator:browser")
			{
				loadIntoWindow();
			}
        }
		console.log("open window called putting observer on load window");
        window.addEventListener("load",onWindowLoad);
    },
    onCloseWindow: function(xulWindow) { },
    onWindowTitleChange: function(xulWindow, newTitle) { }
};
/********** WINDOW STUFF **********/
function loadIntoWindow ()
{
	// Lets load the xul file using XMLHttpRequest
	const tbxul = "chrome://icescrumtaskcreator/content/toolbutton.xul";
	var request = new XMLHttpRequest();
	request.mozBackgroundRequest = true;
	// When the load is finished lets put it in the toolbar
	request.addEventListener("load", function(event)
		{
		  var overlay = request.responseXML;
		  var toolbutton = overlay.getElementById("itc-toolbar-button");

		  try {
			CustomizableUI.createWidget({
				id: "itc-toolbar-button",
				type: "custom", // the default is button
				label: toolbutton.getAttribute("label"),
				tooltiptext: toolbutton.getAttribute("tooltiptext"),
//				onCommand: function(aEvent) {
//					var thisDOMWindow = aEvent.target.ownerDocument.defaultView; //this is the browser (xul) window
//					var thisWindowsSelectedTabsWindow = thisDOMWindow.gBrowser.selectedTab.linkedBrowser.contentWindow; //this is the html window of the currently selected tab
//					thisWindowsSelectedTabsWindow.alert('alert from html window of selected tab');
//					thisDOMWindow.alert('alert from xul window');
//				}
				onBuild: function(aDocument) {
					var itc = aDocument.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "script");
					itc.setAttribute("type", "application/x-javascript");
					itc.setAttribute("src", "chrome://icescrumtaskcreator/content/icescrumtaskcreator.js");
					var toolbarbutton = aDocument.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "toolbarbutton");
					var menupopup = aDocument.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menupopup");
					var menuitem = aDocument.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menuitem");

					var tbb_props = {
						id: "itc-toolbar-button",
						label: "banana",
						tooltiptext: "cerveja",
						type: "menu-button",
						class: "chromeclass-toolbar-additional toolbarbutton-1",
						removable: "true",
						state: "false",
						oncommand: "javascript:alert('42'); event.stopPropagation();"
					}
					var mp_props = {
						id: "itc-toolbar-button-popup-menu"
					}
					var mi_props = {
						id: "itc-toolbar-button-popup-menu-item1",
						label: "hahaha",
						tooltiptext: "tooltipsexy",
						oncommand: "javascript:alert('21'); event.stopPropagation();"
					}
					var setAllAttribs = function (obj, props) {
						for (var p in props) {
							obj.setAttribute(p, props[p]);
						}
					}
					setAllAttribs(toolbarbutton, tbb_props);
					setAllAttribs(menupopup, mp_props);
					setAllAttribs(menuitem, mi_props);

					toolbarbutton.appendChild(menupopup);
					menupopup.appendChild(menuitem);

					return toolbarbutton;
				}
			});
		  } catch (e) {
			console.log("Ops... " + e);
		  }
		}, false);
	request.open("GET", tbxul);
	request.send(null);

	console.log("load overlay called");
}

function unloadFromWindow ()
{
	try {
		const toolbuttonName = "itc-toolbar-button";
		CustomizableUI.destroyWidget(toolbuttonName);
	} catch (e) {
		Console.log("Ops... " + e);
	}
	console.log("unload overlay");
}
function forEachOpenWindow(todo)  // Apply a function to all open browser windows
{
    var windows = Services.wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements())
        todo(windows.getNext().QueryInterface(Ci.nsIDOMWindow));
}
