📌 GitHub Repository & Commit Explorer

A simple full-stack application that fetches GitHub repositories, displays commit counts, and supports filtering by language and stars.
This project uses:
Backend: Node.js, Express, Axios
Frontend: HTML, CSS, Vanilla JavaScript

🚀 Features
✔ Fetch all repositories of a user-> Uses /users/:username/repos
✔ Fetch commit count of a specific repository-> Uses /repos/:username/:repo/commits
✔ Filters implemented
1. Language filter → Show repos of a selected programming language
2. Star sorting → Sort repos based on star count (High → Low)

✔ Robust Error Handling
Network failures, Timeout handling, Invalid JSON responses, Malformed fields, GitHub API rate-limit or token errors


🛠️ Setup Instructions
1️⃣ Create a remote repository(Global Trend)
    Creating local folder(GLOBAL Trend) -> frontend and backend folder inside it. 


2️⃣ Backend Setup (Node.js)
Install dependencies(express, cors, axios, dotenv)
cd backend
npm install

Create .env file
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=your_github_username
PORT=5000

Start the backend:- nodemon index.js
Backend runs on: http://localhost:5000/

3️⃣ Frontend Setup
Simply open: frontend/index.html



🔗 API Endpoints Used
1. Get all repositories

GET /api/repos

Optional Query Params
Param	                Type	        Description

language	            string	        Filter by programming language
sort	                string	        stars to sort by stars
search	                string	        Search repos by name

Example
/api/repos?language=JavaScript&sort=stars

2. Get details of a single repo
GET /api/repos/:repoName
Returns: id, name, description, stars, forks, createdAt, language

3. Get commit count
GET /api/commits/:repoName
Returns:

{
  "repo": "AnimatedWebsites",
  "totalCommits": 42
}



🧠 How Filtering Works
Language Filter

Extracts all unique languages from repo list

Filters only repos matching selected language

Star Filter
sort=stars  
→ Sorts repos by `stargazers_count` (descending)


⚙️ Assumptions & Notes
✔ GitHub Token Required
GitHub API limits unauthenticated requests —
So a Personal Access Token is mandatory.

✔ Rate-Limits & Token Errors
If token expires or GitHub blocks due to rate-limit, UI displays:
❌ Error: API Rate Limit / Invalid Token

✔ Commit Count Logic
GitHub API returns commits in pages; for simplicity:
/commits endpoint is used with default pagination.

✔ Network Safety
Frontend includes:
Timeout system (7 seconds)
JSON parsing validation
Graceful error messages

✔ Malformed API Fields
If any field like language or stars is missing → handled safely.