import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Proxy for Cricbuzz
  app.get("/api/score/:matchId", async (req, res) => {
    try {
      const { matchId } = req.params;
      const response = await axios.get(`https://www.cricbuzz.com/api/mcenter/comm/${matchId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("Error fetching score:", error.message);
      res.status(500).json({ error: "Failed to fetch score data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
