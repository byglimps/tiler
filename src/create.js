import { img } from "base64-img";
import { unlink } from "fs";
import uuid from "uuid/v1";
import { resolve as path_resolve } from "path";
import { createCollage } from "./tiler";
import upload from "./upload";
import log from "./logger";

const { TMP_DIR = "tmp", HOST = "http://localhost:3001" } = process.env;

const cleanUp = async images => {
  return Promise.all(images.map(rm));
};

const rm = path => {
  return new Promise((resolve, reject) => {
    unlink(path, err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

const save = data => {
  return new Promise((resolve, reject) => {
    img(data, TMP_DIR, uuid(), (err, location) => {
      err && reject(err);
      resolve(path_resolve(location));
    });
  });
};

const createStory = async (storyImages, brandImageUrl) => {
  let imagePaths = [];
  for (var shot of storyImages) {
    let loc = await save(shot.base64);
    imagePaths = imagePaths.concat([loc]);
  }
  log({ imagePaths });

  let collage = await createCollage(imagePaths, brandImageUrl, TMP_DIR);
  log({ collage });
  await cleanUp(imagePaths);

  return collage;
};

const validateReq = (images, brand, eventName) => {
  return new Promise((resolve, reject) => {
    var err = [];
    if (!images || images.length < 3) {
      err.push({
        story: "story should be an array of 3 images in base64 format."
      });
    }
    if (!brand) {
      err.push({ brandImage: "The url to a brand image should be provided." });
    }
    if (!eventName) {
      err.push({ eventName: "An eventName should be provided" });
    }

    if (err.length > 0) {
      reject(err);
    }

    resolve();
  });
};

const makeDevUrl = filePath => {
  return `${HOST}/tmp/${filePath}`;
};

const create = async (req, res) => {
  try {
    let body = req.body;
    let { story: storyImages, brandImage, eventName } = body;
    await validateReq(storyImages, brandImage, eventName);

    let story = await createStory(storyImages, brandImage);

    if (__DEV__) {
      return res
        .status(200)
        .json({ success: true, collage: makeDevUrl(story.file_name) });
    } else {
      let uploadInfo = await upload(
        story.file_path,
        story.file_name,
        eventName
      );
      await rm(story.file_path);
      return res
        .status(200)
        .json({ success: true, collage: uploadInfo.Location });
    }
  } catch (e) {
    log(e);
    res.status(400).json({ success: false, error: e });
  }
};

export default create;
