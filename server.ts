import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development with Vite
  }));
  app.use(morgan("dev"));
  app.use(express.json());

  // API routes
  const apiRouter = express.Router();

  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok", message: "KREATOR.AO API is running", timestamp: new Date().toISOString() });
  });

  // OAuth 2.0 Integration
  apiRouter.get("/auth/platforms/:platform/url", (req, res) => {
    const { platform } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // In a real app, these would come from env vars
    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`] || "mock_client_id";
    const redirectUri = `${process.env.APP_URL || "http://localhost:3000"}/api/auth/platforms/${platform}/callback`;
    
    let authUrl = "";
    const state = JSON.stringify({ userId, platform });

    switch (platform.toLowerCase()) {
      case "youtube":
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly&state=${state}&access_type=offline&prompt=consent`;
        break;
      case "instagram":
        authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code&state=${state}`;
        break;
      case "tiktok":
        authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientId}&scope=user.info.basic,video.list&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
        break;
      case "facebook":
        authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=email,public_profile`;
        break;
      case "spotify":
        authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=user-read-private,user-read-email&state=${state}`;
        break;
      case "twitch":
        authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=user:read:email&state=${state}`;
        break;
      case "twitter":
      case "x":
        authUrl = `https://twitter.com/i/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=tweet.read%20users.read&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
        break;
      case "linkedin":
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=r_liteprofile%20r_emailaddress&state=${state}`;
        break;
      case "pinterest":
        authUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=read_public&state=${state}`;
        break;
      default:
        return res.status(400).json({ error: "Unsupported platform" });
    }

    res.json({ url: authUrl });
  });

  apiRouter.get("/auth/platforms/:platform/callback", async (req, res) => {
    const { platform } = req.params;
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).send("Missing code or state");
    }

    try {
      const { userId } = JSON.parse(state as string);
      
      // In a real app, you would exchange the code for tokens here
      // const tokenResponse = await axios.post(tokenUrl, params);
      // const { access_token, refresh_token } = tokenResponse.data;

      // Mocking successful token exchange
      const mockTokens = {
        accessToken: `mock_access_token_${Math.random().toString(36).substring(7)}`,
        refreshToken: `mock_refresh_token_${Math.random().toString(36).substring(7)}`,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      };

      // Here you would save tokens to Firestore
      // await db.collection('platform_tokens').doc(`${userId}_${platform}`).set({ ...mockTokens, platform, userId });

      res.send(`
        <html>
          <body style="background: #050505; color: #F0EDE8; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center; padding: 2rem; border: 1px solid #1E2240; border-radius: 1rem; background: #13162A;">
              <h1 style="color: #C1440E;">Conexão Bem-sucedida!</h1>
              <p>A tua conta do ${platform.toUpperCase()} foi conectada com sucesso.</p>
              <p style="color: #8B8FA8; font-size: 0.875rem;">Esta janela fechará automaticamente...</p>
              <script>
                setTimeout(() => {
                  if (window.opener) {
                    window.opener.postMessage({ type: 'PLATFORM_AUTH_SUCCESS', platform: '${platform}' }, '*');
                    window.close();
                  } else {
                    window.location.href = '/dashboard/plataformas';
                  }
                }, 2000);
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  // Mock data for initial development
  apiRouter.get("/stats/global", (req, res) => {
    res.json({
      totalPaidAOA: 12500000,
      activeCreators: 1250,
      partnerBrands: 45
    });
  });

  apiRouter.get("/stats/creator", (req, res) => {
    res.json({
      revenue: 1285000,
      followers: 105000,
      engagement: 4.8,
      tips: 85400,
      trends: {
        revenue: "+12.5%",
        followers: "+8.2%",
        engagement: "+1.5%",
        tips: "+24%"
      }
    });
  });

  apiRouter.get("/transactions", (req, res) => {
    res.json([
      { id: "1", date: "2026-03-28", type: "revenue", source: "TikTok", amount: 125000, status: "completed" },
      { id: "2", date: "2026-03-27", type: "campaign", source: "Unitel", amount: 75000, status: "pending" },
      { id: "3", date: "2026-03-26", type: "tip", source: "Public Page", amount: 5000, status: "completed" },
    ]);
  });

  apiRouter.get("/platforms/sync", (req, res) => {
    const { platformId } = req.query;
    
    // Mocking fetching real-time data from platform API
    const mockStats = {
      subs: `${Math.floor(Math.random() * 200 + 50)}K`,
      views: `${Math.floor(Math.random() * 1000 + 100)}K`,
      revenue: Math.floor(Math.random() * 100000 + 10000),
      topContent: [
        { 
          title: platformId === "youtube" ? "Vlog em Luanda" : 
                 platformId === "twitter" || platformId === "x" ? "Thread sobre Criatividade" :
                 platformId === "linkedin" ? "Como crescer no KREATOR.AO" :
                 platformId === "pinterest" ? "Moodboard para Criadores" : "Dancinha Viral", 
          views: `${Math.floor(Math.random() * 50 + 10)}K`, 
          likes: `${Math.floor(Math.random() * 20 + 5)}K`, 
          comments: Math.floor(Math.random() * 1000).toString() 
        },
        { 
          title: platformId === "youtube" ? "Review de Gadget" : 
                 platformId === "twitter" || platformId === "x" ? "Meme do Dia" :
                 platformId === "linkedin" ? "Networking em Angola" :
                 platformId === "pinterest" ? "Dicas de Design" : "POV: Criador em Angola", 
          views: `${Math.floor(Math.random() * 40 + 5)}K`, 
          likes: `${Math.floor(Math.random() * 15 + 2)}K`, 
          comments: Math.floor(Math.random() * 800).toString() 
        }
      ]
    };

    res.json({ stats: mockStats, lastSync: "Agora" });
  });

  app.use("/api", apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
