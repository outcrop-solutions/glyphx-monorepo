use crate::model::data::SelectedGlyph;
use crate::model::data::GlyphDescription;

#[derive(Debug, Clone)]
pub struct SelectedGlyphsManager {
    selected_glyphs: Vec<SelectedGlyph>,
}

impl SelectedGlyphsManager {
    pub fn new() -> Self {
        Self {
            selected_glyphs: Vec::new(),
        }
    }

    pub fn add_selected_glyph(&mut self, selected_glyph: SelectedGlyph) {
        self.selected_glyphs.push(selected_glyph);
    }

    pub fn selected_glyph_exists(&self, glyph_id: u32) -> bool {
        self.selected_glyphs.iter().any(|selected_glyph| selected_glyph.glyph_id == glyph_id)
    }

    pub fn remove_selected_glyph(&mut self, glyph_id: u32) {
        self.selected_glyphs.retain(|selected_glyph| selected_glyph.glyph_id != glyph_id);
    }

    pub fn clear_selected_glyphs(&mut self) {
        self.selected_glyphs.clear();
    }

    pub fn get_selected_glyphs(&self) -> Vec<SelectedGlyph> {
        self.selected_glyphs.clone()
    }

    pub fn get_selected_glyph(&self, glyph_id: u32) -> Option<SelectedGlyph> {
        self.selected_glyphs.iter().find(|selected_glyph| selected_glyph.glyph_id == glyph_id).cloned()
    }

    pub fn len(&self) -> usize {
        self.selected_glyphs.len()
    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;
    use model_common::VectorOrigionalValue;

    mod constructor {
        use super::*;

        #[test]
        fn it_creates_a_new_selected_glyphs_manager() {
            let selected_glyphs_manager = SelectedGlyphsManager::new();
            assert_eq!(selected_glyphs_manager.selected_glyphs.len(), 0);
        }
    }

    mod add_selected_glyph {
        use super::*;

        #[test]
        fn it_adds_a_selected_glyph() {
            let mut selected_glyphs_manager = SelectedGlyphsManager::new();
            let selected_glyph = SelectedGlyph::new(
                1,
                vec![1, 2],
                GlyphDescription::new(
                    VectorOrigionalValue::F64(3.0),
                    VectorOrigionalValue::F64(4.0),
                    5.0,
                ),
            );
            selected_glyphs_manager.add_selected_glyph(selected_glyph.clone());
            assert_eq!(selected_glyphs_manager.selected_glyphs.len(), 1);
            assert_eq!(selected_glyphs_manager.selected_glyphs[0].glyph_id, selected_glyph.glyph_id);
        }
    } 
    mod selected_glyph_exists {
        use super::*;

        #[test]
        fn it_returns_true_if_selected_glyph_exists() {
            let mut selected_glyphs_manager = SelectedGlyphsManager::new();
            let selected_glyph = SelectedGlyph::new(
                1,
                vec![1, 2],
                GlyphDescription::new(
                    VectorOrigionalValue::F64(3.0),
                    VectorOrigionalValue::F64( 4.0),
                    5.0,
                ),
            );
            selected_glyphs_manager.add_selected_glyph(selected_glyph.clone());
            assert_eq!(selected_glyphs_manager.selected_glyph_exists(1), true);
        }

        #[test]
        fn it_returns_false_if_selected_glyph_does_not_exist() {
            let mut selected_glyphs_manager = SelectedGlyphsManager::new();
            let selected_glyph = SelectedGlyph::new(
                2,
                vec![1, 2],
                GlyphDescription::new(
                    VectorOrigionalValue::F64(3.0),
                    VectorOrigionalValue::F64( 4.0),
                    5.0,
                ),
            );
            selected_glyphs_manager.add_selected_glyph(selected_glyph.clone());
            assert_eq!(selected_glyphs_manager.selected_glyph_exists(1), false);
        }
    }
   
    mod remove_selected_glyph {
        use super::*;

        #[test]
        fn it_removes_selected_glyph() {
            let mut selected_glyphs_manager = SelectedGlyphsManager::new();
            let selected_glyph = SelectedGlyph::new(
                1,
                vec![1, 2],
                GlyphDescription::new(
                    VectorOrigionalValue::F64(3.0),
                    VectorOrigionalValue::F64( 4.0),
                    5.0,
                ),
            );
            selected_glyphs_manager.add_selected_glyph(selected_glyph.clone());
            selected_glyphs_manager.remove_selected_glyph(1);
            assert_eq!(selected_glyphs_manager.selected_glyphs.len(), 0);
        }

        #[test]
        pub fn it_does_not_remove_selected_glyph_if_it_does_not_exist() {
            let mut selected_glyphs_manager = SelectedGlyphsManager::new();
            let selected_glyph = SelectedGlyph::new(
                2,
                vec![1, 2],
                GlyphDescription::new(
                    VectorOrigionalValue::F64(3.0),
                    VectorOrigionalValue::F64( 4.0),
                    5.0,
                ),
            );
            selected_glyphs_manager.add_selected_glyph(selected_glyph.clone());
            selected_glyphs_manager.remove_selected_glyph(1);
            assert_eq!(selected_glyphs_manager.selected_glyphs.len(), 1);
        }
    }
    
    mod clear_selected_glyphs {
        use super::*;

        #[test]
        fn it_clears_selected_glyphs() {
            let mut selected_glyphs_manager = SelectedGlyphsManager::new();
            let selected_glyph = SelectedGlyph::new(
                1,
                vec![1, 2],
                GlyphDescription::new(
                    VectorOrigionalValue::F64(3.0),
                    VectorOrigionalValue::F64( 4.0),
                    5.0,
                ),
            );
            selected_glyphs_manager.add_selected_glyph(selected_glyph.clone());
            selected_glyphs_manager.clear_selected_glyphs();
            assert_eq!(selected_glyphs_manager.selected_glyphs.len(), 0);
        }
    }

    mod get_selected_glyphs {
        use super::*;

        #[test]
        fn it_returns_selected_glyphs() {
            let mut selected_glyphs_manager = SelectedGlyphsManager::new();
            let selected_glyph = SelectedGlyph::new(
                1,
                vec![1, 2],
                GlyphDescription::new(
                    VectorOrigionalValue::F64(3.0),
                    VectorOrigionalValue::F64( 4.0),
                    5.0,
                ),
            );
            selected_glyphs_manager.add_selected_glyph(selected_glyph.clone());
            let selected_glyphs = selected_glyphs_manager.get_selected_glyphs();
            assert_eq!(selected_glyphs.len(), 1);
            assert_eq!(selected_glyphs[0].glyph_id, selected_glyph.glyph_id);
        }
    }

    mod get_selected_glyph {
        use super::*;

        #[test]
        fn it_returns_selected_glyph() {
            let mut selected_glyphs_manager = SelectedGlyphsManager::new();
            let selected_glyph = SelectedGlyph::new(
                1,
                vec![1, 2],
                GlyphDescription::new(
                    VectorOrigionalValue::F64(3.0),
                    VectorOrigionalValue::F64( 4.0),
                    5.0,
                ),
            );
            selected_glyphs_manager.add_selected_glyph(selected_glyph.clone());
            let selected_glyph = selected_glyphs_manager.get_selected_glyph(1);
            assert!(selected_glyph.is_some());
            let selected_glyph = selected_glyph.unwrap();
            assert_eq!(selected_glyph.glyph_id, 1);
        }

        #[test]
        fn it_returns_none_if_selected_glyph_does_not_exist() {
            let mut selected_glyphs_manager = SelectedGlyphsManager::new();
            let selected_glyph = SelectedGlyph::new(
                2,
                vec![1, 2],
                GlyphDescription::new(
                    VectorOrigionalValue::F64(3.0),
                    VectorOrigionalValue::F64( 4.0),
                    5.0,
                ),
            );
            selected_glyphs_manager.add_selected_glyph(selected_glyph.clone());
            let selected_glyph = selected_glyphs_manager.get_selected_glyph(1);
            assert!(selected_glyph.is_none());
        }
    }

    mod len {
        use super::*;

        #[test]
        fn it_returns_the_number_of_selected_glyphs() {
            let mut selected_glyphs_manager = SelectedGlyphsManager::new();
            let selected_glyph = SelectedGlyph::new(
                1,
                vec![1, 2],
                GlyphDescription::new(
                    VectorOrigionalValue::F64(3.0),
                    VectorOrigionalValue::F64( 4.0),
                    5.0,
                ),
            );
            selected_glyphs_manager.add_selected_glyph(selected_glyph.clone());
            assert_eq!(selected_glyphs_manager.len(), 1);
        }
    }
}
