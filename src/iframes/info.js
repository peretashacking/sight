const version = "0.5.0 Limited Time Support"

const versionElement = document.getElementById("userVersion")

versionElement.innerText = version

async function msinfo() {
    const response = await fetch(`https://raptor.fun/main/version.json`);
    const data = await response.json();
    const relversion = document.getElementById("relversion");
    const changelogms = document.getElementById("changelogms");

    if (data.error) {
        changelogms.textContent = "An error occoured while trying to load the latest MacSploit version"
    } else {
        relversion.textContent = data.relVersion;
        changelogms.textContent = data.changelog;
    }
}

msinfo()