pub enum CameraTypeChanged {
    Ortbital,
    Perspective,
}

impl CameraTypeChanged {
    pub fn to_string(&self) -> String {
        match self {
            CameraTypeChanged::Ortbital => "Ortbital".to_string(),
            CameraTypeChanged::Perspective => "Perspective".to_string(),
        }
    }
}
