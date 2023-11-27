use super::types::*;
use proc_macro2::TokenStream;
use quote::quote;

pub fn build_to_bson_function(
    field_definitions: &Vec<&FieldDefinition>,
    wrap_in_set: Option<()>,
    is_private: Option<()>,
) -> TokenStream {
    let mut object_id_fields = field_definitions
        .iter()
        .filter(|field_definition| field_definition.is_object_id.is_some())
        .map(|field_definition| format!("key == \"{}\"", field_definition.database_name.as_str()))
        .collect::<Vec<String>>()
        .join(" || ")
        .parse::<TokenStream>()
        .unwrap();

    //It is entirely possible for updates and creates to not have an id field.  This is my lazy way
    //of handling this condition.  If there are no object_id fields, then we will just pass through
    //false to our conditional below ensureing that it will never be hit.
    //TODO: WE need to add logic for handling vectors of ids
    if object_id_fields.is_empty() {
        object_id_fields = "false".parse::<TokenStream>().unwrap();
    }

    //for our updates we want the document wrapped in a $set
    let return_value = if wrap_in_set.is_some() {
        quote!(Ok(doc! {"$set" : document}))
    } else {
        quote!(Ok(document))
    };

    let visibility = if is_private.is_some() {
        quote!()
    } else {
        quote!(pub)
    };
    quote!( #visibility fn to_bson(&self) -> Result<mongodb::bson::Document, mongodb::bson::ser::Error> {
        let bson = mongodb::bson::to_bson(&self);
        if bson.is_err() {
            return Err(bson.err().unwrap());
        }
        let bson = bson.unwrap();
        let bson = bson.as_document().unwrap();
        let mut document = mongodb::bson::Document::new();
        bson.keys().for_each(|key| {
            if #object_id_fields {
                let str_value = bson.get(key).unwrap().as_str().unwrap();
                let object_id = mongodb::bson::oid::ObjectId::parse_str(str_value).unwrap();
                document.insert(key, mongodb::bson::Bson::ObjectId(object_id));
            } else {
                let v = bson.get(key).unwrap().clone();
                document.insert(key, v);
            }
        });

        #return_value
    })
}
