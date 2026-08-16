const pool = require("./index");
const bcrypt = require("bcryptjs");

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
    const demoUserCheck = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [demoEmail]);
    if (demoUserCheck.rows.length === 0) {
      const hashedDemoPassword = await bcrypt.hash("demo1234", 10);
      await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
        ["Demo User", demoEmail, hashedDemoPassword]
      );
      console.log("👤 Default demo user created (demo@buildsense.ai)");
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
        username VARCHAR(255),
        content TEXT,
        ai_reply TEXT,
        reply_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure user_id column exists on analyses and campaigns
    await pool.query(`
      ALTER TABLE analyses ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;
    `);

    await pool.query(`
      ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;
    `);

    // Assign any orphaned records (where user_id IS NULL) to demo user
    const demoUser = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [demoEmail]);
    if (demoUser.rows.length > 0) {
      const demoId = demoUser.rows[0].id;
      await pool.query("UPDATE projects SET user_id = $1 WHERE user_id IS NULL", [demoId]);
      await pool.query("UPDATE analyses SET user_id = $1 WHERE user_id IS NULL", [demoId]);
      await pool.query("UPDATE campaigns SET user_id = $1 WHERE user_id IS NULL", [demoId]);
    }

    console.log("✅ Database tables initialized and user scoping updated successfully.");
  } catch (err) {
    console.error("⚠️ Database initialization notice:", err.message);
    console.log("💡 Ensure PostgreSQL is running and credentials in .env are correct.");
  }
}

module.exports = initDb;
