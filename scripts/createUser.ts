import bcrypt from "bcryptjs"
import { pool } from "@/lib/db"
import logger from "@/lib/logger"

async function createUser(username: string, password: string) {
    const client = await pool.connect()
    const passwordHash = await bcrypt.hash(password, 10)

    try {
        await client.query(
            "INSERT INTO app_user (username, password_hash, permissions) VALUES ($1, $2, $3)",
            [username, passwordHash, ['SUDO']]
        )
        logger.info(`User ${username} created successfully.`)
    } catch (error) {
        logger.error("Error creating user:", error)
    } finally {
        client.release()
    }
}

// Read username and password from command line arguments
const args = process.argv.slice(2)
if (args.length < 2) {
    console.error("Usage: ts-node createUser.ts <username> <password>")
    process.exit(1)
}

const [username, password] = args

createUser(username, password)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error)
        process.exit(1)
    });