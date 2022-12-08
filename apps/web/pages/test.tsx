import evaporate from 'lib/evaporate';

export default function Upload() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-bright-blue text-white">
      <button className="bg-yellow px-2 py-1 rounded" onClick={handleSignUrl}>
        Sign Url
      </button>
      <input onChange={uploadFile} type="file" accept="image/png, image/jpeg" />
    </div>
  );
}

const handleSignUrl = async () => {
  const res = await fetch(`/api/aws-sign`);
  const result = await res.json();
  console.log({ result });
};

const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]!;
  const filename = encodeURIComponent(file.name);
  const fileType = encodeURIComponent(file.type);

  const res = await fetch(`/api/upload-url?file=${filename}&fileType=${fileType}`);
  const { url, fields } = await res.json();
  const formData = new FormData();

  Object.entries({ ...fields, file }).forEach(([key, value]) => {
    formData.append(key, value as string);
  });

  const upload = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (upload.ok) {
    console.log('Uploaded successfully!');
  } else {
    console.error('Upload failed.');
  }
};

const uploadFile = (evaporate) => {
  const file = new File([''], 'file_object_to_upload');

  const addConfig = {
    name: file.name,
    file: file,
    progress: (progressValue) => console.log('Progress', progressValue),
    complete: (_xhr, awsKey) => console.log('Complete!'),
  };

  /*
    The bucket and some other properties
    can be changed per upload
  */

  const overrides = {
    // bucket: process.env.AWS_BUCKET_2
  };

  evaporate.add(addConfig, overrides).then(
    (awsObjectKey) => console.log('File successfully uploaded to:', awsObjectKey),
    (reason) => console.log('File did not upload sucessfully:', reason)
  );
};
