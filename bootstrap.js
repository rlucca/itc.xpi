/********** IMPORTS **********/
const Cu = Components.utils;
const Ci = Components.interfaces;
const Cc = Components.classes;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource:///modules/CustomizableUI.jsm");
Cu.importGlobalProperties(["XMLHttpRequest"]);

//Services.scriptloader.loadSubScript("resource://icescrumtaskcreator/icescrumtaskcreator.js", this, "UTF-8");
//let itc = this.__foo;
//delete this.__foo;
//function bla() { return itc.haha(); }
//console.log(bla());


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
				loadIntoWindow(window);
			}
        }
		console.log("open window called putting observer on load window");
        window.addEventListener("load",onWindowLoad);
    },
    onCloseWindow: function(xulWindow) { },
    onWindowTitleChange: function(xulWindow, newTitle) { }
};
/********** WINDOW STUFF **********/
function loadIntoWindow (aWindow)
{
  try {
	appendCSS("chrome://icescrumtaskcreator/skin/style.css");
	Services.scriptloader.loadSubScript("chrome://icescrumtaskcreator/content/icescrumtaskcreator.js", aWindow);
console.debug(aWindow.itc.fufufu());
	CustomizableUI.createWidget({
		id: "itc-toolbar-button",
		type: "custom", // the default is button
		label: "seila",
		tooltiptext: "seilanao",
		onBuild: function(aDocument) {
			var toolbarbutton = aDocument.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "toolbarbutton");
			var menupopup = aDocument.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menupopup");
			var menuitem = aDocument.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menuitem");
			var script = aDocument.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "script");
			script.setAttribute("type", "application/x-javascript");
			script.setAttribute("src", "chrome://icescrumtaskcreator/content/icescrumtaskcreator.js");
			script.setAttribute("id", "nonsesnsePutAId");

			var tbb_props = {
				id: "itc-toolbar-button",
				label: "banana",
				tooltiptext: "cerveja",
				type: "menu-button",
				class: "chromeclass-toolbar-additional toolbarbutton-1",
				removable: "true",
				state: "false",
				oncommand: "javascript: alert('42'); event.stopPropagation();"
			}
			var mp_props = {
				id: "itc-toolbar-button-popup-menu"
			}
			var mi_props = {
				id: "itc-toolbar-button-popup-menu-item1",
				label: "hahaha",
				tooltiptext: "tooltipsexy",
				oncommand: "itc.showPreferences(event);"
			}
			var setAllAttribs = function (obj, props) {
				for (var p in props) {
					obj.setAttribute(p, props[p]);
				}
			}

			setAllAttribs(toolbarbutton, tbb_props);
			setAllAttribs(menupopup, mp_props);
			setAllAttribs(menuitem, mi_props);

			script.appendChild(toolbarbutton);
			toolbarbutton.appendChild(menupopup);
			menupopup.appendChild(menuitem);

			return toolbarbutton;
		}
	});
  } catch (e) {
	console.log("Ops... " + e);
  }
}

function appendCSS(URI)
{
	let io =
	  Cc["@mozilla.org/network/io-service;1"].
		getService(Ci.nsIIOService);

	// the 'style' directive isn't supported in chrome.manifest for
	// bootstrapped extensions, so this is the manual way of doing
	// the same.
	this._ss =
	  Cc["@mozilla.org/content/style-sheet-service;1"].
		getService(Ci.nsIStyleSheetService);
	this._uri = io.newURI(URI, null, null);
	this._ss.loadAndRegisterSheet(this._uri, this._ss.USER_SHEET);
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
