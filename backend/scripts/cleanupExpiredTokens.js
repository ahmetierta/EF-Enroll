const AppDataSource = require("../data-source");

async function cleanupExpiredTokens() {
  await AppDataSource.initialize();

  try {
    const result = await AppDataSource.manager.query(`
      DELETE FROM refresh_tokens
      WHERE expires_at <= NOW()
         OR (
          revoked_at IS NOT NULL
          AND revoked_at <= DATE_SUB(NOW(), INTERVAL 30 DAY)
        )
    `);
    const deletedCount = Array.isArray(result) ? result.affectedRows || 0 : 0;

    console.log(`Expired/revoked refresh tokens cleaned: ${deletedCount}`);
  } finally {
    await AppDataSource.destroy();
  }
}

cleanupExpiredTokens().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
