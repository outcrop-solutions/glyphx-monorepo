import Evaporate from 'evaporate';
import crypto from 'crypto';

const config = {
  signerUrl: process.env.SIGNER_URL,
  aws_key: process.env.AWS_KEY,
  bucket: process.env.AWS_BUCKET,
  cloudfront: true,
  computeContentMd5: true,
  cryptoMd5Method: (data) => crypto.createHash('md5').update(data).digest('base64'),
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

// return Evaporate.create(config).then(uploadFile);
