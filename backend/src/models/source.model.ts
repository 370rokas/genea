import { pool } from "@/utils/db";

export interface Source {
  id: number;

  title: string;
  title_en: string | null;

  description: string | null;
  description_en: string | null;

  category_id: number | null;

  link: string | null;
  created_at: Date;
}

export interface FullSource extends Source {
  location_ids: number[];
  tag_ids: number[];
}

export const SourceModel = {
  async create(
    title: string,
    titleEn: string | null,
    description: string | null,
    descriptionEn: string | null,
    categoryId: number | null,
    link: string | null,
  ): Promise<Source> {
    const res = await pool.query(
      `INSERT INTO source (title, title_en, description, description_en, category_id, link)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, title_en, description, description_en, category_id, link, created_at`,
      [title, titleEn, description, descriptionEn, categoryId, link],
    );

    return res.rows[0];
  },

  async clearTags(sourceId: number) {
    await pool.query("DELETE FROM source_tags WHERE source_id = $1", [
      sourceId,
    ]);
  },

  async assignTags(sourceId: number, tagIds: number[]) {
    const values = tagIds.map((tagId) => `(${sourceId}, ${tagId})`).join(", ");
    await pool.query(
      `INSERT INTO source_tags (source_id, tag_id) VALUES ${values}`,
    );
  },

  async clearLocations(sourceId: number) {
    await pool.query("DELETE FROM source_locations WHERE source_id = $1", [
      sourceId,
    ]);
  },

  async assignLocations(sourceId: number, locationIds: number[]) {
    const values = locationIds
      .map((locationId) => `(${sourceId}, ${locationId})`)
      .join(", ");
    await pool.query(
      `INSERT INTO source_locations (source_id, location_id) VALUES ${values}`,
    );
  },

  async update(
    id: number,
    title?: string,
    titleEn?: string | null,
    description?: string | null,
    descriptionEn?: string | null,
    categoryId?: number | null,
    link?: string | null,
  ) {
    const res = await pool.query(
      `UPDATE source
       SET title = COALESCE($1, title),
           title_en = COALESCE($2, title_en),
           description = COALESCE($3, description),
           description_en = COALESCE($4, description_en),
           category_id = COALESCE($5, category_id),
           link = COALESCE($6, link)
       WHERE id = $7`,
      [title, titleEn, description, descriptionEn, categoryId, link, id],
    );

    return res.rows[0];
  },

  async delete(id: number) {
    const res = await pool.query(
      "DELETE FROM source WHERE id = $1 RETURNING id",
      [id],
    );

    return res.rows[0];
  },
};
