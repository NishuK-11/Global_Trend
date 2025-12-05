
function fetchWithTimeout(url, options = {}, timeout = 7000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Request Timeout")), timeout)
        )
    ]);
}
function showError(message) {
    const container = document.getElementById("repoContainer");
    container.innerHTML = `
        <div style="
            padding:15px;
            background:#ffe6e6;
            border-left:4px solid red;
            margin-bottom:10px;
            border-radius:6px;
        ">
            ❌ <strong>Error:</strong> ${message}
        </div>
    `;
}
async function safeJSON(res) {
    try {
        return await res.json();
    } catch (e) {
        throw new Error("Invalid JSON Response From Server");
    }
}
async function fetchRepos(url = "http://localhost:5000/api/repos") {
    try {
        const res = await fetchWithTimeout(url);

        if (!res.ok) {
            if (res.status === 403) throw new Error("API Rate Limit / Invalid Token");
            if (res.status === 404) throw new Error("API Endpoint Not Found");
            throw new Error(`Server Error ${res.status}`);
        }

        const data = await safeJSON(res);

        if (!Array.isArray(data)) {
            throw new Error("Malformed Response (Expected an array)");
        }

        return data;
    } 
    catch (err) {
        showError(err.message);
        return [];
    }
}

function renderLanguages(repos) {
    try {
        const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];
        const langSelect = document.getElementById("language");

        langSelect.innerHTML = `<option value="">All</option>`;
        languages.forEach(lang => {
            langSelect.innerHTML += `<option value="${lang}">${lang}</option>`;
        });

    } catch (err) {
        showError("Language filter render failed: " + err.message);
    }
}
function renderRepos(repos) {
    const container = document.getElementById("repoContainer");
    container.innerHTML = "";

    if (repos.length === 0) {
        container.innerHTML = `<p>No repositories found.</p>`;
        return;
    }

    repos.forEach(repo => {
        const { name, language, stars } = repo;

        if (!name) return; 

        const card = document.createElement("div");
        card.className = "repo-card";

        card.innerHTML = `
            <h3>${name}</h3>
            <p><strong>Language:</strong> ${language || "Unknown"}</p>
            <p><strong>⭐ Stars:</strong> ${stars ?? "0"}</p>

            <button data-repo="${name}">View Commits</button>
            <p id="commits-${name}"></p>
        `;

        container.appendChild(card);
    });

    attachCommitListeners();
}

function attachCommitListeners() {
    document.querySelectorAll(".repo-card button").forEach(btn => {
        btn.addEventListener("click", async () => {
            const repo = btn.dataset.repo;
            const commitTag = document.getElementById(`commits-${repo}`);

            commitTag.innerHTML = "⏳ Loading commits...";

            try {
                const res = await fetchWithTimeout(
                    `http://localhost:5000/api/commits/${repo}`
                );

                if (!res.ok) {
                    if (res.status === 404) throw new Error("Repo not found");
                    throw new Error(`Commit API Error: ${res.status}`);
                }

                const data = await safeJSON(res);

                if (typeof data.totalCommits !== "number") {
                    throw new Error("Malformed commit response");
                }

                commitTag.innerHTML = `Total Commits: <b>${data.totalCommits}</b>`;
            }
            catch (err) {
                commitTag.innerHTML = `<span style="color:red;">❌ ${err.message}</span>`;
            }
        });
    });
}

document.getElementById("applyFilters").addEventListener("click", async () => {
    try {
        let url = "http://localhost:5000/api/repos?";

        const lang = document.getElementById("language").value;
        const sort = document.getElementById("sort").value;

        if (lang) url += `language=${lang}&`;
        if (sort) url += `sort=${sort}`;

        const repos = await fetchRepos(url);

        renderRepos(repos);
    } 
    catch (err) {
        showError("Filter failed: " + err.message);
    }
});
(async function () {
    const repos = await fetchRepos();
    renderLanguages(repos);
    renderRepos(repos);
})();
