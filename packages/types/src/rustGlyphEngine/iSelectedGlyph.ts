export interface ISelectedGlyph {
  glyph_id: number;
  row_ids: number[];
  desc: {
    x: number | string;
    y: number | string;
    z: number;
  };
}
