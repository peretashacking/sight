
// when using `"withGlobalTauri": true`, you may use
  const { getCurrentWindow } = window.__TAURI__.window;

  const appWindow = getCurrentWindow();

  document
    .getElementById('titlebar-minimize')
    ?.addEventListener('click', () => appWindow.minimize());
  document
    .getElementById('titlebar-maximize')
    ?.addEventListener('click', () => appWindow.toggleMaximize());
  document
    .getElementById('titlebar-close')
    ?.addEventListener('click', () => appWindow.close());

  // make sure that it only attaches when roblox is NOT running
  localStorage.setItem("robloxStatus", "false");



// macsploit shit
async function attach(skipAlreadyInjected = false) {
  const statusText = document.getElementById("statusText");
  let status = "Running AutoAttach";
  statusText.textContent = status;
  setStatus("orange");
  
  // 5553 ~ 5563 for each Roblox window
  for (let i = 5553; i <= 5563; i++) {
  const retry = await window.__TAURI__.core.invoke("attach", { port: i })
  .then(() => {
    localStorage.setItem("robloxStatus", "true");
    connected = true;
    status = "Online";
    setStatus("green");
    statusText.textContent = status; // Only show "Online", no port number
    statusText.setAttribute("data-port", i); // Keep this for tooltip
    statusText.title = `Connected on Port ${i}`; // Show port in tooltip
    console.log("[AttachmentTool] Attached successfully to port", i);
    return false;
  })
  .catch((err) => {
    if (err === "ConnectionRefused") {
      status = `Is Roblox open? Couldn't connect to Port ${i}`;
      setStatus("orange");
      console.log("[AttachmentTool] Connection refused on port", i);
      localStorage.setItem("robloxStatus", "false");
      return true;
    } else if (err === "SocketNotAlive") {
      status = "Failed, make sure Roblox is open. Try again in menu.";
      localStorage.setItem("robloxStatus", "false");
      setStatus("red");
      statusText.textContent = status;
      console.log("[AttachmentTool] MacSploit/Port is not available on port", i);
      return false;
    } else if (err === "TimedOut" || err === "ConnectionConflict") {
      status = `Connection conflict on Port ${i}`;
      statusText.textContent = status;
      localStorage.setItem("robloxStatus", "false");
      setStatus("red");
      showNotification(
        "Connection conflict", 
        "If Roblox is running, close any other UIs you have open. This includes the MacSploit app. Sight will not work when another UI is open.", 
        );
      console.log("[AttachmentTool] Timed out/Connection conflict on port", i);
      return false;
    } else if (err === "AlreadyInjected" && skipAlreadyInjected === true) {
      localStorage.setItem("robloxStatus", "true");
      connected = true;
      status = "Online";
      setStatus("green");
      statusText.textContent = status; // Only show "Online", no port number
      statusText.setAttribute("data-port", i); // Keep this for tooltip
      statusText.title = `Connected on Port ${i}`; // Show port in tooltip
      console.log("[AttachmentTool] Attached successfully to port", i);
      return false;
    } else if (err === "AlreadyInjected" && skipAlreadyInjected === false) {
      setStatus("purple");
      status = `Already Injected on Port ${i}`;
      statusText.textContent = status;
      console.log("[MsInject] Already injected on port", i);
      showNotification(
        "Already Injected!", 
        "You have already injected into Roblox.", 
        5000
        );
      setTimeout(() => {
        status = "Online";
        statusText.textContent = status; // Only show "Online", no port number
        statusText.setAttribute("data-port", i); // Keep this for tooltip
        statusText.title = `Connected on Port ${i}`; // Show port in tooltip
        setStatus("green");
        localStorage.setItem("robloxStatus", "true");
      }, 2000);
    return true;
    }
    status = `Error on attach for port ${i}: ${err}`;
    statusText.textContent = status;
    setStatus("red");
    localStorage.setItem("robloxStatus", "false");
    console.error("[AttachmentTool] Error on attach for port", i, ":", err);
    return false;
  });
  
  if (!retry) break;
  }
  
  console.log("[AttachmentTool] Final attach status:", status);
  statusText.textContent = status;
}

function startAutoAttach() {
  console.log("[AutoAttach] Starting attach process.");
  attach(); // Run first instantly

  let attachInterval = setInterval(async () => {
    console.log("[AutoAttach] Re-running attach process.");
    await attach(true);

    // Check if attached successfully
    if (localStorage.getItem("robloxStatus") === "true") {
      clearInterval(attachInterval);
      console.log("[AutoAttach] Successfully attached, stopping interval.");
    }
  }, 15000); // Then run every 15 seconds
}

startAutoAttach();


function execute(ev) {
  window.__TAURI__.core.invoke("execute", { script: ev })
  .then(() => {
    console.log("[Script Execution] Script executed successfully.");
    console.log("[Script Execution] / [DEBUG] ", ev);
  })
  .catch((err) => {
    if (err === "NotInjected") {
    console.error("[Script Execution] Not Injected");
    startAutoAttach();
    } else {
    console.error("[Script Execution] Error on execute:", err);
    }
});
}

async function readMacsploitSettings() {
  return window.__TAURI__.core.invoke("read_setting")
    .then((settings) => {
      console.log("[Settings Backend] Sent over settings successfully");
      console.log("[Settings Backend] / [DEBUG] ", settings);
      return settings; // Properly resolves the settings
    })
    .catch((e) => {
      console.error("[Settings Backend] Error on read_setting:", e);
      throw e; // Properly rejects the promise
    });
}

function writeMacsploitSetting(key, value) {
  window.__TAURI__.core.invoke("write_setting", { key, value })
    .then(() => {
      console.log("[Settings Backend] Successfully wrote setting", key, ":", value);
    })
    .catch((e) => {
      console.error("[Settings Backend] Error on write_setting:", e);
    });
}

function roblox(what) {
  if (what === 'open') {
  console.log("[RobloxKiller] Opening Roblox...");
  window.__TAURI__.core.invoke("start_roblox")
    .then(() => {
      console.log("[RobloxKiller] Started Roblox.");
      showNotification("Starting Roblox", "This might take a minute... If AutoAttach is on then it should automatically connect to Roblox.")
    })
    .catch((e) => {
      console.error("[Settings Backend] Error while starting Roblox:", e);
      showNotification("Error while starting Roblox", e)
    });
  } else if (what === 'kill') {
  window.__TAURI__.core.invoke("kill_roblox")
  .then(() => {
    console.log("[RobloxKiller] Killed Roblox.");
  })
  .catch((e) => {
    console.error("[Settings Backend] Error while killing Roblox:", e);
    showNotification("Error while killing Roblox", e)
  });
  } else {
  console.log('[RobloxKiller] Invalid command, trying to parse ', what, ', expected \'open\' or \'kill\'');
  }
}




function watchLogsFr() {
  const logFilePath = "/path/to/your/roblox.log"; // Change to actual log file path
  window.__TAURI__.invoke("watch_logs", { filePath: logFilePath })
    .then(() => {
      console.log("[LogWatcher] Started watching Roblox logs at", logFilePath);
    })
    .catch((e) => {
      console.error("[LogWatcher] Error while watching Roblox logs:", e);
    });
}


function openMsFolder(folder) {
  if (folder === 'msworkspace') {
    window.__TAURI__.core.invoke("msworkspace")
    .then(() => {
      console.log("[OpenFS] Opening MacSploit Workspace folder");
      showNotification(
        "Opening MacSploit Workspace Folder",
        "Opening the MacSploit Workspace folder in Finder."
      );
    })
    .catch((e) => {
      console.error("[OpenFS] Error on read_setting:", e);
    });
  } else if (folder === 'msautoexecution') {
    window.__TAURI__.core.invoke("msautoexecute")
    .then(() => {
      console.log("[OpenFS] Opening MacSploit Automatic Execution folder");
      showNotification(
        "Opening MacSploit Automatic Execution Folder",
        "Opening the MacSploit Automatic Execution folder in Finder."
      );
    })
    .catch((e) => {
      console.error("[OpenFS] Error on read_setting:", e);
    });
  } else {
    console.error("[OpenFS] Invalid folder to open: ", folder);
  }
}

async function save(scriptContent, options) {
  // Validate parameters - strict check for undefined to prevent infinite recursion
  if (scriptContent === undefined) {
    console.error("[Save] Error: Content is undefined");
    showNotification("Save Error", "No content to save", 2000);
    return;
  }

  // Additional check for null or empty string
  if (scriptContent === null || scriptContent === '') {
    console.error("[Save] Error: Content is empty");
    showNotification("Save Error", "No content to save", 2000);
    return;
  }

  // Ensure options is an object with proper filters
  if (!options || typeof options !== 'object') {
    console.log("[Save] Using default options as none were provided");
    options = {
      filters: [{
        name: 'Lua Script',
        extensions: ['lua']
      }]
    };
  }

  console.log("[Save] Saving to" + "\nContent length: " + scriptContent.length + "\nOptions: " + JSON.stringify(options));

  try {
    // Use the Rust backend to handle the save dialog and file writing
    const filePath = await window.__TAURI__.core.invoke("save_file", { 
      content: scriptContent, 
      options: options 
    });
    
    console.log("[Save] File saved successfully to", filePath);
    showNotification("Success", "File saved successfully", 2000);
    return filePath; // Return the file path for potential further use
  } catch (error) {
    console.error("[Save] Error saving file:", error);
    showNotification("Save Error", `Failed to save file: ${error}`, 5000);
    return null;
  }
}