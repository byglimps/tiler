import { S3 } from "aws-sdk";
import { createReadStream } from "fs";
const s3 = new S3();
const { BUCKET_NAME } = process.env;

/**
 *
 * @param {string} path
 * @param {string} bucket
 * @param {string} destination
 * @returns {Promise<S3.ManagedUpload.SendData>}
 */
const uploadToS3 = (path, bucket, destination) => {
  return new Promise((resolve, reject) => {
    let imageStream = createReadStream(path);
    s3.upload(
      { Bucket: bucket, Key: destination, Body: imageStream },
      (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });
};

/**
 * 
 * @param {string} path 
 * @param {string} fileName 
 * @param {string} eventName 
 */
const upload = async (path, fileName, eventName) => {
    const directory = eventName;
    const s3Path = `${directory}/${fileName}`;
    let s3Upload = await uploadToS3(path, BUCKET_NAME, s3Path);
    return s3Upload;
};

export default upload;
