fetch('https://cdn.peretas.tech/sight/killswitch.txt')
    .then(r => r.text())
    .then(text => {
        text = text.trim(); // Trim whitespace
        if (text !== "WeUpBaby!Sight-v4") {
            window.location.href = 'dead.html'
        } else {
            console.log("[Killswitch] Welcome to Sight! Killswitch is armed.");
        }
    })
    .catch(error => {
        console.error("[Killswitch] Error fetching killswitch file:", error);
        window.location.href = 'dead.html'
    });