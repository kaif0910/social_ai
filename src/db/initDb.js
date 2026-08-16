const pool = require("./index");
const bcrypt = require("bcryptjs");

async function seedDemoData(demoId) {
  try {
    // 1️⃣ Seed Project 1: DevFlow AI Code Assistant
    const p1Check = await pool.query(
      "SELECT id FROM projects WHERE user_id = $1 AND LOWER(name) = LOWER($2)",
      [demoId, "devflow ai code assistant"]
    );

    if (p1Check.rows.length === 0) {
      console.log("🌱 Seeding Demo Project 1: DevFlow AI Code Assistant...");
      const proj1 = await pool.query(
        `INSERT INTO projects (user_id, name, description, created_at)
         VALUES ($1, $2, $3, NOW() - INTERVAL '7 days')
         RETURNING id`,
        [
          demoId,
          "DevFlow AI Code Assistant",
          "AI-powered inline code reviewer & automated unit test generator for VS Code and WebStorm",
        ]
      );
      const p1Id = proj1.rows[0].id;

      const roadmap1 = {
        roadmap: [
          {
            step: 1,
            feature: "Local Ollama & Llama 3 Integration",
            reason: "Highest requested feature for privacy-focused dev teams",
            expected_impact: "Doubles conversion among enterprise developers",
          },
          {
            step: 2,
            feature: "Automated Unit Test Suite Generator",
            reason: "Saves developers 5+ hours weekly writing boilerplate Jest tests",
            expected_impact: "Increases daily retention by 35%",
          },
          {
            step: 3,
            feature: "Git Pre-commit Review Hooks",
            reason: "Catches potential syntax and security bugs before push",
            expected_impact: "Reduces PR review cycles by 40%",
          },
        ],
        summary: "Strong positive developer sentiment regarding inline code refactoring and test generation.",
      };

      const clusters1 = [
        { name: "Local LLM / Ollama Support", mentions: 18, sentiment: "positive" },
        { name: "Jest & PyTest Auto Test Generation", mentions: 12, sentiment: "positive" },
        { name: "Offline Air-Gapped Mode", mentions: 8, sentiment: "mixed" },
      ];

      await pool.query(
        `INSERT INTO analyses
         (user_id, project_id, product_idea, subreddit, summary, sentiment_positive, sentiment_neutral, sentiment_negative, feature_clusters, insights, roadmap, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW() - INTERVAL '6 days')`,
        [
          demoId,
          p1Id,
          "DevFlow AI Code Assistant",
          "SaaS",
          "Strong positive developer sentiment regarding inline code refactoring and test generation.",
          34,
          12,
          4,
          JSON.stringify(clusters1),
          "Developers love instant inline completions but strongly desire local Ollama model support for privacy compliance.",
          JSON.stringify(roadmap1),
        ]
      );

      await pool.query(
        `INSERT INTO post_feedback
         (project_id, post_url, feature_context, agreement, neutral, disagreement, top_requested_change, confusions, recommended_next_feature, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() - INTERVAL '5 days')`,
        [
          p1Id,
          "https://www.reddit.com/r/SaaS/comments/devflow_launch",
          "Launched v1.2 with instant TypeScript inline test generation",
          28,
          8,
          3,
          "Add Python PyTest support alongside TypeScript Jest",
          JSON.stringify(["How does DevFlow handle private repos?", "Is code sent to third-party servers?"]),
          "Publish VS Code extension marketplace badge and offline mode settings toggle",
        ]
      );

      const camp1 = await pool.query(
        `INSERT INTO campaigns (user_id, project_id, name, brand_voice, tone, niche, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '5 days')
         RETURNING id`,
        [
          demoId,
          p1Id,
          "DevFlow Product Hunt Launch Drive",
          "Developer-centric, technical, authoritative yet humble",
          "conversational",
          "DevTools & AI",
        ]
      );

      await pool.query(
        `INSERT INTO posts (campaign_id, title, content, platform, status, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '4 days')`,
        [
          camp1.rows[0].id,
          "How we automated Jest unit test generation inline in VS Code",
          "We built DevFlow because writing unit tests manually was burning 10 hours of our dev sprint every single week. Here is how we automated Jest test generation inline without leaving VS Code...\n\n#DevTools #AI #TypeScript #VSCode #SoftwareEngineering",
          "reddit",
          "published",
        ]
      );
    }

    // 2️⃣ Seed Project 2: SocialPulse Analytics
    const p2Check = await pool.query(
      "SELECT id FROM projects WHERE user_id = $1 AND LOWER(name) = LOWER($2)",
      [demoId, "socialpulse analytics"]
    );

    if (p2Check.rows.length === 0) {
      console.log("🌱 Seeding Demo Project 2: SocialPulse Analytics...");
      const proj2 = await pool.query(
        `INSERT INTO projects (user_id, name, description, created_at)
         VALUES ($1, $2, $3, NOW() - INTERVAL '14 days')
         RETURNING id`,
        [
          demoId,
          "SocialPulse Analytics",
          "Privacy-first social sentiment tracker and community feature request engine for SaaS founders",
        ]
      );
      const p2Id = proj2.rows[0].id;

      const roadmap2 = {
        roadmap: [
          {
            step: 1,
            feature: "Automated Subreddit Keyword Watcher",
            reason: "Notifies founders instantly when users mention product pain points",
            expected_impact: "4x faster response rate to potential customers",
          },
          {
            step: 2,
            feature: "Slack Alert Webhook Digest",
            reason: "Delivers daily feedback summaries directly into team channels",
            expected_impact: "Keeps entire product team aligned on feedback",
          },
          {
            step: 3,
            feature: "Competitor Feature Gap Analysis",
            reason: "Highlights feature requests where competitors fall short",
            expected_impact: "Drives strategic positioning against incumbents",
          },
        ],
        summary: "Founders are actively looking for early adopter feedback signals without manual scraping.",
      };

      const clusters2 = [
        { name: "Automated Subreddit Crawler", mentions: 22, sentiment: "positive" },
        { name: "Competitor Sentiment Comparison", mentions: 15, sentiment: "positive" },
        { name: "Slack & Discord Webhooks", mentions: 11, sentiment: "mixed" },
      ];

      await pool.query(
        `INSERT INTO analyses
         (user_id, project_id, product_idea, subreddit, summary, sentiment_positive, sentiment_neutral, sentiment_negative, feature_clusters, insights, roadmap, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW() - INTERVAL '12 days')`,
        [
          demoId,
          p2Id,
          "SocialPulse Analytics",
          "Startups",
          "Founders are actively looking for early adopter feedback signals without manual scraping.",
          42,
          15,
          6,
          JSON.stringify(clusters2),
          "High interest from indie hackers looking to validate SaaS ideas on Reddit before writing code.",
          JSON.stringify(roadmap2),
        ]
      );

      await pool.query(
        `INSERT INTO post_feedback
         (project_id, post_url, feature_context, agreement, neutral, disagreement, top_requested_change, confusions, recommended_next_feature, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() - INTERVAL '10 days')`,
        [
          p2Id,
          "https://www.reddit.com/r/Startups/comments/socialpulse_showcase",
          "Automated community sentiment clustering for startup ideas",
          35,
          10,
          4,
          "Add Discord webhook notifications for instant sentiment alerts",
          JSON.stringify(["Can SocialPulse track subreddits without API rate limits?", "Does it analyze comment threads automatically?"]),
          "Enable one-click Slack webhook integration for positive mention digest",
        ]
      );

      const camp2 = await pool.query(
        `INSERT INTO campaigns (user_id, project_id, name, brand_voice, tone, niche, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '9 days')
         RETURNING id`,
        [
          demoId,
          p2Id,
          "SocialPulse Reddit Outreach",
          "Founder building in public, transparent, data-driven",
          "authentic & friendly",
          "SaaS & Marketing",
        ]
      );

      await pool.query(
        `INSERT INTO posts (campaign_id, title, content, platform, status, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '8 days')`,
        [
          camp2.rows[0].id,
          "What 5,000+ Reddit SaaS comments taught us about finding product-market fit",
          "Stop guessing what features your users actually want. We analyzed 5,000+ Reddit SaaS threads to see how indie founders discover product-market fit and validate ideas before building...\n\n#IndieHackers #SaaS #BuildingInPublic #ProductMarketFit #Startups",
          "reddit",
          "published",
        ]
      );
    }

    // 3️⃣ Seed Project 3: CloudScale Ops
    const p3Check = await pool.query(
      "SELECT id FROM projects WHERE user_id = $1 AND LOWER(name) = LOWER($2)",
      [demoId, "cloudscale ops"]
    );

    if (p3Check.rows.length === 0) {
      console.log("🌱 Seeding Demo Project 3: CloudScale Ops...");
      const proj3 = await pool.query(
        `INSERT INTO projects (user_id, name, description, created_at)
         VALUES ($1, $2, $3, NOW() - INTERVAL '21 days')
         RETURNING id`,
        [
          demoId,
          "CloudScale Ops",
          "Automated Kubernetes cluster optimizer and developer cloud cost management dashboard",
        ]
      );
      const p3Id = proj3.rows[0].id;

      const roadmap3 = {
        roadmap: [
          {
            step: 1,
            feature: "Non-prod Idle Pod Autoscaling",
            reason: "Slashes staging environment cloud bills by up to 45%",
            expected_impact: "Immediate ROI within 48 hours of installation",
          },
          {
            step: 2,
            feature: "Multi-cloud AWS & GCP Cost Dashboard",
            reason: "Single pane of glass for cloud infra spend across teams",
            expected_impact: "Reduces cloud bill surprises for engineering leads",
          },
          {
            step: 3,
            feature: "Terraform & Pulumi Export Engine",
            reason: "Allows infrastructure-as-code teams to apply recommendations cleanly",
            expected_impact: "Simplifies enterprise DevOps adoption",
          },
        ],
        summary: "DevOps teams are eager for tools that safely reduce AWS/GCP staging cluster spend.",
      };

      const clusters3 = [
        { name: "Idle Pod Auto-scaling", mentions: 16, sentiment: "positive" },
        { name: "AWS & GCP Cost Breakdown", mentions: 12, sentiment: "positive" },
        { name: "Terraform Module Exporter", mentions: 7, sentiment: "mixed" },
      ];

      await pool.query(
        `INSERT INTO analyses
         (user_id, project_id, product_idea, subreddit, summary, sentiment_positive, sentiment_neutral, sentiment_negative, feature_clusters, insights, roadmap, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW() - INTERVAL '18 days')`,
        [
          demoId,
          p3Id,
          "CloudScale Ops",
          "DevOps",
          "DevOps teams are eager for tools that safely reduce AWS/GCP staging cluster spend.",
          29,
          9,
          3,
          JSON.stringify(clusters3),
          "Strong interest from mid-size engineering teams spending $5k+/month on non-prod AWS EKS clusters.",
          JSON.stringify(roadmap3),
        ]
      );

      const camp3 = await pool.query(
        `INSERT INTO campaigns (user_id, project_id, name, brand_voice, tone, niche, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '15 days')
         RETURNING id`,
        [
          demoId,
          p3Id,
          "CloudScale Early Adopters Campaign",
          "DevOps specialist, crisp, value-oriented",
          "professional",
          "Cloud Infrastructure",
        ]
      );

      await pool.query(
        `INSERT INTO posts (campaign_id, title, content, platform, status, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '14 days')`,
        [
          camp3.rows[0].id,
          "How we cut staging cluster cloud bills by 45% using lightweight autoscaling",
          "Cloud bills sneaking up on your engineering team? We built a lightweight Kubernetes controller that automatically scales down non-prod workloads during off-peak hours...\n\n#DevOps #Kubernetes #AWS #CloudCost #FinOps",
          "reddit",
          "published",
        ]
      );
    }
  } catch (err) {
    console.error("⚠️ Failed to seed demo data:", err.message);
  }
}

async function initDb() {
  try {
    console.log("⚡ Checking and initializing database tables...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed demo account if missing
    const demoEmail = "demo@buildsense.ai";
    let demoId;
    const demoUserCheck = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [demoEmail]);
    if (demoUserCheck.rows.length === 0) {
      const hashedDemoPassword = await bcrypt.hash("demo1234", 10);
      const newDemoUser = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
        ["Demo User", demoEmail, hashedDemoPassword]
      );
      demoId = newDemoUser.rows[0].id;
      console.log("👤 Default demo user created (demo@buildsense.ai)");
    } else {
      demoId = demoUserCheck.rows[0].id;
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS analyses (
        id SERIAL PRIMARY KEY,
        project_id INT REFERENCES projects(id) ON DELETE CASCADE,
        product_idea TEXT,
        subreddit VARCHAR(255),
        summary TEXT,
        sentiment_positive INT DEFAULT 0,
        sentiment_neutral INT DEFAULT 0,
        sentiment_negative INT DEFAULT 0,
        feature_clusters JSONB,
        insights TEXT,
        roadmap JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_feedback (
        id SERIAL PRIMARY KEY,
        project_id INT REFERENCES projects(id) ON DELETE CASCADE,
        post_url TEXT,
        feature_context TEXT,
        agreement INT DEFAULT 0,
        neutral INT DEFAULT 0,
        disagreement INT DEFAULT 0,
        top_requested_change TEXT,
        confusions JSONB,
        recommended_next_feature TEXT,
        raw_ai_output TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        project_id INT REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        brand_voice TEXT,
        tone TEXT,
        niche TEXT,
        mode VARCHAR(50) DEFAULT 'manual',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
        title TEXT,
        content TEXT,
        platform VARCHAR(50) DEFAULT 'reddit',
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure user_id and project_id columns exist on analyses and campaigns
    await pool.query(`
      ALTER TABLE analyses ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;
    `);

    await pool.query(`
      ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;
    `);

    await pool.query(`
      ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS project_id INT REFERENCES projects(id) ON DELETE CASCADE;
    `);

    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS title TEXT;
    `);

    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS platform VARCHAR(50) DEFAULT 'reddit';
    `);

    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';
    `);

    // Assign any orphaned records (where user_id IS NULL) to demo user
    if (demoId) {
      await pool.query("UPDATE projects SET user_id = $1 WHERE user_id IS NULL", [demoId]);
      await pool.query("UPDATE analyses SET user_id = $1 WHERE user_id IS NULL", [demoId]);
      await pool.query("UPDATE campaigns SET user_id = $1 WHERE user_id IS NULL", [demoId]);

      // Populate demo account with rich initial dummy data
      await seedDemoData(demoId);
    }

    console.log("✅ Database tables initialized and user scoping updated successfully.");
  } catch (err) {
    console.error("⚠️ Database initialization notice:", err.message);
    console.log("💡 Ensure PostgreSQL is running and credentials in .env are correct.");
  }
}

module.exports = initDb;
