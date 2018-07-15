import { img } from "base64-img";
import { unlink } from "fs";
import uuid from "uuid/v1";
import { resolve as path_resolve } from "path";
import { createCollage } from "./tiler";

const brand = "fixtures/brand.jpg";

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
    img(data, "tmp", uuid(), (err, location) => {
      err && reject(err);
      resolve(path_resolve(location));
    });
  });
};

const create = async (req, res) => {
  console.log(Date.now());
  try {
    let body = req.body;
    let { story } = body;

    let images = [];
    for (var shot of story) {
      let loc = await save(shot.base64);
      images = images.concat([loc]);
    }
    console.log({ images });

    let collage = await createCollage(images, brand);
    console.log({ collage });
    console.log("\n");

    await cleanUp(images);
    res.status(200).json({ success: true, collage: collage.file_path });
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false, error: e });
  }
};

export default create;
