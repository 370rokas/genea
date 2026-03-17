import { logger } from "@/utils/logger";
import { pool } from "@/utils/db";
import app from "@/app";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

const cleanupAsync = async () => {
    logger.info('Closing database pool and server...');

    const closeServer = () => new Promise((resolve) => server.close(resolve));

    await closeServer();
    await pool.end();

    logger.info('Cleanup complete.');
};

const shutdown = (exitCode: number = 0) => {
    cleanupAsync()
        .then(() => {
            process.exit(exitCode);
        })
        .catch((cleanupErr) => {
            logger.fatal(cleanupErr, 'Error during cleanup');
            process.exit(1);
        });
};

// Listeners
process.on('uncaughtException', (err) => {
    logger.fatal(err, 'Uncaught exception detected');
    shutdown(1);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received');
    shutdown(0);
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    shutdown(0);
});