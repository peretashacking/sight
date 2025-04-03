class TabManager {
    constructor() {
        this.tabs = [{
            id: 1,
            title: 'Sight 1',
            content: '-- Welcome to Sight'
        }];
        this.activeTabId = 1;
        this.nextTabId = 2;
        this.editor = null;

        this.initializeEditor();
        this.initializeEventListeners();
    }

    initializeEditor() {
        this.editor = ace.edit("editor");
        this.editor.setTheme("ace/theme/one_dark");
        this.editor.session.setMode("ace/mode/lua");
        this.editor.setShowPrintMargin(false);

        // Store content changes in the active tab
        this.editor.on('change', () => {
            const activeTab = this.tabs.find(t => t.id === this.activeTabId);
            if (activeTab) {
                activeTab.content = this.editor.getValue();
            }
        });
    }

    // Add to the initializeEventListeners method in the TabManager class
    initializeEventListeners() {
        // Tab click handler
        document.getElementById('tabs').addEventListener('click', (e) => {
            const tab = e.target.closest('.tab');
            if (!tab) return;

            const closeBtn = e.target.closest('.tab-close');
            if (closeBtn) {
                this.closeTab(parseInt(tab.dataset.tabId));
                return;
            }

            this.setActiveTab(parseInt(tab.dataset.tabId));
        });

        // Double click for rename
        document.getElementById('tabs').addEventListener('dblclick', (e) => {
            const tab = e.target.closest('.tab');
            if (!tab) return;
            
            const titleSpan = tab.querySelector('.tab-title');
            if (!titleSpan || titleSpan.classList.contains('editing')) return;

            this.startRenaming(tab);
        });

        // New tab button
        document.querySelector('.new-tab').addEventListener('click', () => {
            this.createNewTab();
        });

        // Initialize execute button
        document.getElementById("execute").addEventListener("click", () => {
            const editorValue = this.editor.getValue();
            console.log(editorValue);
            parent.execute(editorValue);
        });

        // Initialize clear button
        document.getElementById("clear").addEventListener("click", () => {
            this.editor.setValue("");
            const activeTab = this.tabs.find(t => t.id === this.activeTabId);
            if (activeTab) {
                activeTab.content = "";
            }
        });

        // Initialize IY button
        document.getElementById("iy").addEventListener("click", () => {
            parent.execute("loadstring(game:HttpGet('https://lua.peretas.live/iballexus/infiniteyield.lua'))()");
        });

        document.getElementById("save").addEventListener("click", async () => {
            const activeTab = this.tabs.find(t => t.id === this.activeTabId);
            if (!activeTab) {
                parent.showNotification("Error", "No active tab to save!", 2000);
                return;
            }

            try {
                const scriptContent = activeTab.content;
                if (!scriptContent) {
                    parent.showNotification("Error", "No content to save!", 2000);
                    return;
                }

                const options = {
                    filters: [{
                        name: 'Lua Script',
                        extensions: ['lua']
                    }]
                };

                await parent.save(scriptContent, options)

                parent.showNotification("Success", "SAVING DOESNT WORK RIGHT NOW | Script saved successfully!", 2000);
            } catch (error) {
                parent.showNotification("Error", `Failed to save script: ${error}`, 2000);
            }
        });
    
        // Open file button
        document.getElementById("open").addEventListener("click", () => {


            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.lua,.txt';
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
    
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    const newTab = {
                        id: this.nextTabId,
                        title: file.name.replace('.lua', ''),
                        content: content
                    };
                    
                    this.tabs.push(newTab);
                    this.nextTabId++;
                    this.renderTabs();
                    this.setActiveTab(newTab.id);

                };
                reader.readAsText(file);
            };
    
            input.click();
        });
    }

    createNewTab() {
        const newTab = {
            id: this.nextTabId,
            title: `Sight ${this.nextTabId}`,
            content: ''
        };
        
        this.tabs.push(newTab);
        this.nextTabId++;
        
        this.renderTabs();
        this.setActiveTab(newTab.id);
    }

    closeTab(tabId) {
        if (this.tabs.length === 1) return;

        const tabIndex = this.tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;

        this.tabs.splice(tabIndex, 1);

        if (this.activeTabId === tabId) {
            const newActiveTab = this.tabs[Math.min(tabIndex, this.tabs.length - 1)];
            this.setActiveTab(newActiveTab.id);
        }

        this.renderTabs();
    }

    setActiveTab(tabId) {
        this.activeTabId = tabId;
        const activeTab = this.tabs.find(t => t.id === tabId);
        
        if (activeTab) {
            this.editor.setValue(activeTab.content, 1);
            this.renderTabs();
        }
    }

    startRenaming(tabElement) {
        const titleSpan = tabElement.querySelector('.tab-title');
        const tabId = parseInt(tabElement.dataset.tabId);
        const currentTitle = titleSpan.textContent;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentTitle;
        input.className = 'tab-title editing';

        const finishRenaming = () => {
            const newTitle = input.value.trim() || currentTitle;
            const tab = this.tabs.find(t => t.id === tabId);
            if (tab) {
                tab.title = newTitle;
            }
            this.renderTabs();
        };

        input.addEventListener('blur', finishRenaming);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishRenaming();
            }
        });

        titleSpan.replaceWith(input);
        input.select();
    }

    renderTabs() {
        const tabsContainer = document.getElementById('tabs');
        tabsContainer.innerHTML = this.tabs.map(tab => `
            <div class="tab ${tab.id === this.activeTabId ? 'active' : ''}" data-tab-id="${tab.id}">
                <img src="lualogob.webp" alt="Lua Logo" class="lualogo">
                <span class="tab-title">${tab.title}</span>
                <span class="tab-close material-icons-round">close</span>
            </div>
        `).join('');
    }
}

window.tabManager = new TabManager();

// Initialize Roblox status
setTimeout(() => {
    const robloxStatus = localStorage.getItem('robloxStatus');
    const killRobloxBtn = document.getElementById("killRoblox");
    
    if (robloxStatus === 'true') {
        killRobloxBtn.title = "Kill Roblox (Running)";
        killRobloxBtn.style.background = 'rgba(5, 255, 93, 0.1)';
    } else if (robloxStatus === null) {
        parent.showNotification("Roblox Status", "Couldn't determine Roblox status", 3000);   
    } else {
        killRobloxBtn.title = "Start Roblox";
        killRobloxBtn.style.background = 'rgba(255, 5, 5, 0.1)';
    }
}, 1000);

// Initialize Roblox button
document.getElementById("killRoblox").addEventListener("click", function() {
    const robloxStatus = localStorage.getItem('robloxStatus');
    if (robloxStatus === 'true') {
        localStorage.setItem('robloxStatus', 'false');
        this.style.background = 'rgba(255, 5, 5, 0.1)';
        console.log("[RobloxKiller] Roblox stopped");
        this.title = "Start Roblox";
        parent.roblox("kill");
    } else {
        localStorage.setItem('robloxStatus', 'true');
        this.style.background = 'rgba(5, 255, 93, 0.1)';
        console.log("[RobloxKiller] Roblox started");
        this.title = "Kill Roblox (Running)";
        parent.roblox("open");
    }
});
