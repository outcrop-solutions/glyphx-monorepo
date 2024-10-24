pub enum CameraTypeChanged {
    Orbital,
    Perspective,
}

impl CameraTypeChanged {
    pub fn to_string(&self) -> String {
        match self {
            CameraTypeChanged::Orbital => "Orbital".to_string(),
            CameraTypeChanged::Perspective => "Perspective".to_string(),
        }
    }
}
