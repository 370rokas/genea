import { pool } from "@/utils/db";

export interface Location {
  id: number;
  name: string;
  parent_id: number | null;
}

export const LocationModel = {
  async create(
    name: string,
    parentId: number | null = null,
  ): Promise<Location> {
    const res = await pool.query(
      "INSERT INTO location (name, parent_id) VALUES ($1, $2) RETURNING id, name, parent_id",
      [name, parentId],
    );
    return res.rows[0];
  },

  async update(id: number, name?: string, parentId?: number | null) {
    const res = await pool.query(
      "UPDATE location SET name = COALESCE($1, name), parent_id = COALESCE($2, parent_id) WHERE id = $3 RETURNING id",
      [name, parentId, id],
    );
    return res.rows[0];
  },

  async delete(id: number) {
    const res = await pool.query(
      "DELETE FROM location WHERE id = $1 RETURNING id",
      [id],
    );
    return res.rows[0];
  },
};
