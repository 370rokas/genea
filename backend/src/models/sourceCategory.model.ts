import { pool } from "@/utils/db";

interface SourceCategory {
  id: number;
  name: string;
}

export const SourceCategoryModel = {
  async create(name: string): Promise<SourceCategory> {
    const res = await pool.query(
      "INSERT INTO source_category (name) VALUES ($1) RETURNING id, name",
      [name],
    );

    return res.rows[0];
  },

  async update(id: number, name?: string) {
    const res = await pool.query(
      "UPDATE source_category SET name = COALESCE($1, name) WHERE id = $2 RETURNING id",
      [name, id],
    );

    return res.rows[0];
  },

  async delete(id: number) {
    const res = await pool.query(
      "DELETE FROM source_category WHERE id = $1 RETURNING id",
      [id],
    );

    return res.rows[0];
  },
};
