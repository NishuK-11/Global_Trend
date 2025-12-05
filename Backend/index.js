import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors()); // <-- IMPORTANT

const PORT = process.env.PORT || 5000;


const TOKEN = process.env.GITHUB_TOKEN;
const USER = process.env.GITHUB_USERNAME;

// app.get("/api/repos", async (req, res) => {
//     try {
//         const response = await axios.get(`https://api.github.com/users/${USER}/repos`, {
//             headers: { Authorization: `token ${TOKEN}` }
//         });

//         const repoNames = response.data.map(r => ({ name: r.name }));
//         res.json(repoNames);

//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });
app.get("/api/commits/:repo", async (req, res) => {
    try {
        const repoName = req.params.repo;

        const response = await axios.get(
            `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${repoName}/commits`,
            { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
        );

        res.json({ totalCommits: response.data.length });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get("/api/repos", async (req, res) => {
    try {
        const { language, search, sort } = req.query;

        const response = await axios.get(
            `https://api.github.com/users/${process.env.GITHUB_USERNAME}/repos`,
            { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
        );

        let repos = response.data;

        // Filter: language
        if (language) {
            repos = repos.filter(r => r.language?.toLowerCase() === language.toLowerCase());
        }

        // Filter: search keyword
        if (search) {
            repos = repos.filter(r =>
                r.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Sort by stars
        if (sort === "stars") {
            repos = repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
        }

        const finalList = repos.map(r => ({
            id: r.id,
            name: r.name,
            language: r.language,
            stars: r.stargazers_count
        }));

        res.json(finalList);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get("/api/repos/:repoName", async (req, res) => {
    try {
        const repo = req.params.repoName;

        const response = await axios.get(
            `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${repo}`,
            { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
        );

        res.json({
            id: response.data.id,
            name: response.data.name,
            description: response.data.description,
            forks: response.data.forks_count,
            stars: response.data.stargazers_count,
            language: response.data.language,
            createdAt: response.data.created_at
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log("Server running on port", PORT));
