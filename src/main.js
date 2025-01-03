
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



// macsploit shit
async function attach() {
    const statusText = document.getElementById("statusText");
    let status = "Running AutoAttach";
    statusText.textContent = status;
    setStatus("orange");
  
    // 5553 ~ 5563 for each Roblox window
    for (let i = 5553; i <= 5563; i++) {
      const retry = await window.__TAURI__.core.invoke("attach", { port: i })
        .then(() => {
          connected = true;
          status = `Online | Port ${i}`;
          setStatus("green");
          statusText.textContent = status;
          console.log("[MsInject] Attached successfully to port", i);
          return false;
        })
        .catch((err) => {
          if (err === "ConnectionRefused") {
            status = `Is Roblox open? Couldn't connect to Port ${i}`;
            setStatus("orange");
            console.log("[MsInject] Connection refused on port", i);
            return true;
          } else if (err === "AlreadyInjected") {
            status = `Already Injected on Port ${i}`;
            setStatus("purple");
            statusText.textContent = status;
            console.log("[MsInject] Already injected on port", i);
            showNotification(
                "Already Injected!", 
                "You have already injected into Roblox. ", 
              );
            setTimeout(() => {
                status = `Online | Port ${i}`;
                statusText.textContent = status;
                setStatus("green");
            }, 2000);
            return false;
          } else if (err === "SocketNotAlive") {
            status = "Failed, make sure Roblox is open. Try again in menu.";
            setStatus("red");
            statusText.textContent = status;
            console.log("[MsInject] MacSploit/Port is not available on port", i);
            return false;
          } else if (err === "TimedOut" || err === "ConnectionConflict") {
            status = `Close the MacSploit client if open. Connection conflict Port ${i}`;
            statusText.textContent = status;
            setStatus("red");
            console.log("[MsInject] Timed out/Connection conflict on port", i);
            return false;
          }
          status = `Error on attach for port ${i}: ${err}`;
          statusText.textContent = status;
          setStatus("red");
          console.error("[MsInject] Error on attach for port", i, ":", err);
          return false;
        });
  
      if (!retry) break;
    }
  
    console.log("[MsInject] Final attach status:", status);
    statusText.textContent = status;
  }

  attach();

function execute(ev) {
    window.__TAURI__.core.invoke("execute", { script: ev })
    .then(() => {
        console.log("[Script Execution] Script executed successfully.");
        console.log("[Script Execution] / [DEBUG] ", ev);
    })
    .catch((err) => {
        if (err === "NotInjected") {
        console.error("[Script Execution] Not Injected");
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