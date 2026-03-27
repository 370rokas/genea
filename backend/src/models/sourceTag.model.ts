import { pool } from "@/utils/db";

export interface SourceTag {
  id: number;
  name: string;
}

export const SourceTagModel = {
  async create(name: string): Promise<SourceTag> {
    const res = await pool.query(
      "INSERT INTO source_tag (name) VALUES ($1) RETURNING id, name",
      [name],
    );

    return res.rows[0];
  },

  async update(id: number, name?: string) {
    const res = await pool.query(
      "UPDATE source_tag SET name = COALESCE($1, name) WHERE id = $2 RETURNING id",
      [name, id],
    );

    return res.rows[0];
  },

  async delete(id: number) {
    const res = await pool.query(
      "DELETE FROM source_tag WHERE id = $1 RETURNING id",
      [id],
    );

    return res.rows[0];
  },
};
