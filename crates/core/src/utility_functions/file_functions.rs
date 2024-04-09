pub fn get_vector_file_name(workspace_id: &str, project_id: &str, model_hash: &str, axis: &str) -> String {

    format!("{}/{}/output/{}-{}-axis.vec", workspace_id, project_id, model_hash, axis)
}

pub fn get_glyph_file_name(workspace_id: &str, project_id: &str, model_hash: &str) -> String {

    format!("{}/{}/output/{}.gly", workspace_id, project_id, model_hash)
}

pub fn get_stats_file_name(workspace_id: &str, project_id: &str, model_hash: &str) -> String {
    
        format!("{}/{}/output/{}.sts", workspace_id, project_id, model_hash)
}

