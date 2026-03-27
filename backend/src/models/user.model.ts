import { pool } from "@/utils/db";
import bcrypt from "bcryptjs";
import { Permission } from "@/types/auth";

export interface User {
  id: number;
  username: string;
  permissions: Permission[];
}

export const UserModel = {
  async create(
    username: string,
    password: string,
    permissions: string[],
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const res = await pool.query(
      "INSERT INTO users (username, password_hash, permissions) VALUES ($1, $2, $3) RETURNING id, username, permissions",
      [username, hashedPassword, permissions],
    );
    return res.rows[0];
  },

  async setPermissions(userId: number, permissions: string[]) {
    const res = await pool.query(
      "UPDATE users SET permissions = $1 WHERE id = $2 RETURNING id",
      [permissions, userId],
    );
    return res.rows[0];
  },

  async delete(userId: number) {
    const res = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [userId],
    );
    return res.rows[0];
  },

  async updatePassword(userId: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const res = await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id",
      [hashedPassword, userId],
    );
    return res.rows[0];
  },

  async checkPassword(
    username: string,
    password: string,
  ): Promise<User | null> {
    const res = await pool.query(
      "SELECT id, username, password_hash, permissions FROM users WHERE username = $1 LIMIT 1",
      [username],
    );

    if (res.rowCount === 0) {
      return null;
    }

    const user = res.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return null;
    }

    return res.rows[0] || null;
  },
};
